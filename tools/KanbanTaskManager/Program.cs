using System.Data.Common;
using System.Globalization;
using System.Text.Json;
using Npgsql;

var options = CliOptions.Parse(args);
if (options is null)
{
    CliOptions.PrintUsage();
    return 1;
}

await using var db = await DatabaseContext.CreateAsync(options);

return options.Command switch
{
    "list" => await ListTasksAsync(db, options),
    "create" => await CreateTaskAsync(db, options),
    "set-effort" => await SetEffortAsync(db, options),
    "set-status" => await SetStatusAsync(db, options),
    "close" => await CloseTaskAsync(db, options),
    _ => 1
};

static async Task<int> ListTasksAsync(DatabaseContext db, CliOptions options)
{
    var tenantId = options.RequireGuid("tenant");

    await using var cmd = db.CreateCommand(@"
SELECT ""Id"", ""Title"", ""Status"", ""EstimateHours"", ""SpentHours"", ""TotalSpentHoursOnClose"", ""CreatedAtUtc"", ""ClosedAtUtc""
FROM kanban_tasks
WHERE ""TenantId"" = @tenantId
ORDER BY ""CreatedAtUtc"" DESC;");

    db.AddParameter(cmd, "@tenantId", tenantId);
    await using var reader = await cmd.ExecuteReaderAsync();

    var tasks = new List<object>();
    while (await reader.ReadAsync())
    {
        tasks.Add(new
        {
            id = reader.GetGuid(0),
            title = reader.GetString(1),
            status = reader.GetString(2),
            estimateHours = reader.GetDecimal(3),
            spentHours = reader.GetDecimal(4),
            totalSpentHoursOnClose = reader.IsDBNull(5) ? (decimal?)null : reader.GetDecimal(5),
            createdAtUtc = reader.GetDateTime(6),
            closedAtUtc = reader.IsDBNull(7) ? (DateTime?)null : reader.GetDateTime(7)
        });
    }

    Console.WriteLine(JsonSerializer.Serialize(tasks, new JsonSerializerOptions { WriteIndented = true }));
    return 0;
}

static async Task<int> CreateTaskAsync(DatabaseContext db, CliOptions options)
{
    var tenantId = options.RequireGuid("tenant");
    var title = options.RequireString("title").Trim();
    var description = options.RequireString("description").Trim();
    var type = options.GetString("type")?.Trim() ?? "chore";
    var module = options.GetString("module")?.Trim() ?? "General";
    var assignee = options.GetString("assignee")?.Trim() ?? "Unassigned";
    var estimate = options.GetDecimal("estimate", 1m);

    var id = Guid.NewGuid();
    var utcNow = DateTime.UtcNow;

    await using var cmd = db.CreateCommand(@"
INSERT INTO kanban_tasks (
  ""Id"", ""TenantId"", ""CreatedAtUtc"", ""UpdatedAtUtc"", ""Title"", ""Description"", ""Type"", ""Module"", ""Assignee"", ""EstimateHours"", ""SpentHours"", ""Status"", ""ClosedAtUtc"", ""TotalSpentHoursOnClose"", ""TotalLeadTimeHoursOnClose""
) VALUES (
  @id, @tenantId, @createdAtUtc, NULL, @title, @description, @type, @module, @assignee, @estimateHours, @spentHours, @status, NULL, NULL, NULL
);");

    db.AddParameter(cmd, "@id", id);
    db.AddParameter(cmd, "@tenantId", tenantId);
    db.AddParameter(cmd, "@createdAtUtc", utcNow);
    db.AddParameter(cmd, "@title", title);
    db.AddParameter(cmd, "@description", description);
    db.AddParameter(cmd, "@type", type);
    db.AddParameter(cmd, "@module", module);
    db.AddParameter(cmd, "@assignee", assignee);
    db.AddParameter(cmd, "@estimateHours", estimate);
    db.AddParameter(cmd, "@spentHours", 0m);
    db.AddParameter(cmd, "@status", "new");

    await cmd.ExecuteNonQueryAsync();

    Console.WriteLine($"created task {id}");
    return 0;
}

static async Task<int> SetEffortAsync(DatabaseContext db, CliOptions options)
{
    var tenantId = options.RequireGuid("tenant");
    var taskId = options.RequireGuid("task");
    var spent = Math.Round(Math.Max(0m, options.RequireDecimal("spent")), 2);

    var task = await db.GetTaskAsync(tenantId, taskId);
    if (task is null)
    {
        Console.Error.WriteLine("task not found");
        return 2;
    }

    if (task.SpentHours == spent)
    {
        Console.WriteLine("no changes");
        return 0;
    }

    var utcNow = DateTime.UtcNow;

    await using var tx = await db.Connection.BeginTransactionAsync();

    await using (var cmd = db.CreateCommand(@"
UPDATE kanban_tasks
SET ""SpentHours"" = @spentHours,
    ""UpdatedAtUtc"" = @updatedAtUtc,
    ""TotalSpentHoursOnClose"" = CASE WHEN ""Status"" = 'closed' THEN @spentHours ELSE ""TotalSpentHoursOnClose"" END
WHERE ""TenantId"" = @tenantId AND ""Id"" = @taskId;", tx))
    {
        db.AddParameter(cmd, "@spentHours", spent);
        db.AddParameter(cmd, "@updatedAtUtc", utcNow);
        db.AddParameter(cmd, "@tenantId", tenantId);
        db.AddParameter(cmd, "@taskId", taskId);
        await cmd.ExecuteNonQueryAsync();
    }

    await db.InsertAuditLogAsync(
        tx,
        tenantId,
        taskId,
        "effort_changed",
        null,
        null,
        task.SpentHours,
        spent,
        task.Status == "closed" ? spent : null,
        null,
        utcNow);

    await tx.CommitAsync();

    Console.WriteLine($"updated effort task={taskId} from={task.SpentHours.ToString(CultureInfo.InvariantCulture)} to={spent.ToString(CultureInfo.InvariantCulture)}");
    return 0;
}

static async Task<int> SetStatusAsync(DatabaseContext db, CliOptions options)
{
    var tenantId = options.RequireGuid("tenant");
    var taskId = options.RequireGuid("task");
    var nextStatus = options.RequireString("status").Trim().ToLowerInvariant();

    var task = await db.GetTaskAsync(tenantId, taskId);
    if (task is null)
    {
        Console.Error.WriteLine("task not found");
        return 2;
    }

    var current = task.Status;
    if (current == nextStatus)
    {
        Console.WriteLine("no changes");
        return 0;
    }

    if (!Transitions.IsAllowed(current, nextStatus))
    {
        Console.Error.WriteLine($"invalid transition: {current} -> {nextStatus}");
        return 3;
    }

    var utcNow = DateTime.UtcNow;

    await using var tx = await db.Connection.BeginTransactionAsync();

    await using (var cmd = db.CreateCommand(@"
UPDATE kanban_tasks
SET ""Status"" = @status,
    ""UpdatedAtUtc"" = @updatedAtUtc
WHERE ""TenantId"" = @tenantId AND ""Id"" = @taskId;", tx))
    {
        db.AddParameter(cmd, "@status", nextStatus);
        db.AddParameter(cmd, "@updatedAtUtc", utcNow);
        db.AddParameter(cmd, "@tenantId", tenantId);
        db.AddParameter(cmd, "@taskId", taskId);
        await cmd.ExecuteNonQueryAsync();
    }

    await db.InsertAuditLogAsync(tx, tenantId, taskId, "status_changed", current, nextStatus, null, null, null, null, utcNow);

    await tx.CommitAsync();

    Console.WriteLine($"updated status task={taskId} from={current} to={nextStatus}");
    return 0;
}

static async Task<int> CloseTaskAsync(DatabaseContext db, CliOptions options)
{
    var tenantId = options.RequireGuid("tenant");
    var taskId = options.RequireGuid("task");
    var optionalSpent = options.GetNullableDecimal("spent");

    var task = await db.GetTaskAsync(tenantId, taskId);
    if (task is null)
    {
        Console.Error.WriteLine("task not found");
        return 2;
    }

    var current = task.Status;
    if (current == "closed")
    {
        Console.WriteLine("already closed");
        return 0;
    }

    if (current != "resolved")
    {
        Console.Error.WriteLine("task must be resolved before close");
        return 3;
    }

    var utcNow = DateTime.UtcNow;
    var spent = optionalSpent.HasValue ? Math.Round(Math.Max(0m, optionalSpent.Value), 2) : task.SpentHours;
    var leadHours = Math.Round((decimal)(utcNow - task.CreatedAtUtc).TotalHours, 2);

    if (spent <= 0m)
    {
        Console.Error.WriteLine("task must have spentHours greater than 0 before close");
        return 4;
    }

    await using var tx = await db.Connection.BeginTransactionAsync();

    if (task.SpentHours != spent)
    {
        await using var effortCmd = db.CreateCommand(@"
UPDATE kanban_tasks
SET ""SpentHours"" = @spentHours,
    ""UpdatedAtUtc"" = @updatedAtUtc
WHERE ""TenantId"" = @tenantId AND ""Id"" = @taskId;", tx);

        db.AddParameter(effortCmd, "@spentHours", spent);
        db.AddParameter(effortCmd, "@updatedAtUtc", utcNow);
        db.AddParameter(effortCmd, "@tenantId", tenantId);
        db.AddParameter(effortCmd, "@taskId", taskId);
        await effortCmd.ExecuteNonQueryAsync();

        await db.InsertAuditLogAsync(tx, tenantId, taskId, "effort_changed", null, null, task.SpentHours, spent, null, null, utcNow);
    }

    await using (var closeCmd = db.CreateCommand(@"
UPDATE kanban_tasks
SET ""Status"" = 'closed',
    ""ClosedAtUtc"" = @closedAtUtc,
    ""UpdatedAtUtc"" = @updatedAtUtc,
    ""TotalSpentHoursOnClose"" = @totalSpentHours,
    ""TotalLeadTimeHoursOnClose"" = @totalLeadHours
WHERE ""TenantId"" = @tenantId AND ""Id"" = @taskId;", tx))
    {
        db.AddParameter(closeCmd, "@closedAtUtc", utcNow);
        db.AddParameter(closeCmd, "@updatedAtUtc", utcNow);
        db.AddParameter(closeCmd, "@totalSpentHours", spent);
        db.AddParameter(closeCmd, "@totalLeadHours", leadHours);
        db.AddParameter(closeCmd, "@tenantId", tenantId);
        db.AddParameter(closeCmd, "@taskId", taskId);
        await closeCmd.ExecuteNonQueryAsync();
    }

    await db.InsertAuditLogAsync(tx, tenantId, taskId, "status_changed", current, "closed", null, null, null, null, utcNow);
    await db.InsertAuditLogAsync(tx, tenantId, taskId, "task_completed", current, "closed", null, null, spent, leadHours, utcNow);

    await tx.CommitAsync();

    Console.WriteLine($"closed task={taskId} spent={spent.ToString(CultureInfo.InvariantCulture)} leadHours={leadHours.ToString(CultureInfo.InvariantCulture)}");
    return 0;
}

internal static class Transitions
{
    public static bool IsAllowed(string current, string next)
    {
        return (current, next) switch
        {
            ("new", "active") => true,
            ("active", "resolved") => true,
            ("resolved", "active") => true,
            _ => false
        };
    }
}

internal sealed class DatabaseContext : IAsyncDisposable
{
    public required DbConnection Connection { get; init; }
    public required string Provider { get; init; }

    public static async Task<DatabaseContext> CreateAsync(CliOptions options)
    {
        var appConfigPath = Path.Combine(options.WorkspaceRoot, "src", "backend", "CMMS.Api", "appsettings.Development.json");
        if (!File.Exists(appConfigPath))
        {
            appConfigPath = Path.Combine(options.WorkspaceRoot, "src", "backend", "CMMS.Api", "appsettings.json");
        }

        using var doc = JsonDocument.Parse(File.ReadAllText(appConfigPath));
        var root = doc.RootElement;

        var defaultConnection = root.GetProperty("ConnectionStrings").GetProperty("DefaultConnection").GetString() ?? string.Empty;
        var provider = options.Provider;
        if (provider is not ("postgres" or "auto"))
        {
            throw new ArgumentException($"unsupported provider '{provider}'. Use --provider postgres.");
        }

        DbConnection conn = new NpgsqlConnection(defaultConnection);
        provider = "postgres";
        await conn.OpenAsync();
        return new DatabaseContext { Connection = conn, Provider = provider };
    }

    public DbCommand CreateCommand(string sql, DbTransaction? transaction = null)
    {
        var cmd = Connection.CreateCommand();
        cmd.CommandText = sql;
        cmd.Transaction = transaction;
        return cmd;
    }

    public void AddParameter(DbCommand cmd, string name, object? value)
    {
        var p = cmd.CreateParameter();
        p.ParameterName = name;
        p.Value = value ?? DBNull.Value;
        cmd.Parameters.Add(p);
    }

    public async Task<TaskRow?> GetTaskAsync(Guid tenantId, Guid taskId)
    {
        await using var cmd = CreateCommand(@"
SELECT ""Id"", ""Status"", ""SpentHours"", ""CreatedAtUtc""
FROM kanban_tasks
WHERE ""TenantId"" = @tenantId AND ""Id"" = @taskId
LIMIT 1;");

        AddParameter(cmd, "@tenantId", tenantId);
        AddParameter(cmd, "@taskId", taskId);

        await using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
        {
            return null;
        }

        return new TaskRow
        {
            Id = reader.GetGuid(0),
            Status = reader.GetString(1),
            SpentHours = reader.GetDecimal(2),
            CreatedAtUtc = reader.GetDateTime(3)
        };
    }

    public async Task InsertAuditLogAsync(
        DbTransaction tx,
        Guid tenantId,
        Guid taskId,
        string eventType,
        string? fromStatus,
        string? toStatus,
        decimal? fromSpent,
        decimal? toSpent,
        decimal? totalSpentOnClose,
        decimal? totalLeadOnClose,
        DateTime utcNow)
    {
        await using var cmd = CreateCommand(@"
INSERT INTO kanban_task_audit_logs (
  ""Id"", ""TenantId"", ""CreatedAtUtc"", ""UpdatedAtUtc"", ""KanbanTaskId"", ""EventType"", ""FromStatus"", ""ToStatus"", ""FromSpentHours"", ""ToSpentHours"", ""TotalSpentHoursAtClose"", ""TotalLeadTimeHoursAtClose""
) VALUES (
  @id, @tenantId, @createdAtUtc, NULL, @taskId, @eventType, @fromStatus, @toStatus, @fromSpent, @toSpent, @totalSpent, @totalLead
);", tx);

        AddParameter(cmd, "@id", Guid.NewGuid());
        AddParameter(cmd, "@tenantId", tenantId);
        AddParameter(cmd, "@createdAtUtc", utcNow);
        AddParameter(cmd, "@taskId", taskId);
        AddParameter(cmd, "@eventType", eventType);
        AddParameter(cmd, "@fromStatus", fromStatus);
        AddParameter(cmd, "@toStatus", toStatus);
        AddParameter(cmd, "@fromSpent", fromSpent);
        AddParameter(cmd, "@toSpent", toSpent);
        AddParameter(cmd, "@totalSpent", totalSpentOnClose);
        AddParameter(cmd, "@totalLead", totalLeadOnClose);

        await cmd.ExecuteNonQueryAsync();
    }

    public async ValueTask DisposeAsync()
    {
        await Connection.DisposeAsync();
    }

    public sealed class TaskRow
    {
        public Guid Id { get; init; }
        public required string Status { get; init; }
        public decimal SpentHours { get; init; }
        public DateTime CreatedAtUtc { get; init; }
    }
}

internal sealed class CliOptions
{
    public required string Command { get; init; }
    public required Dictionary<string, string> Args { get; init; }
    public string Provider => GetString("provider")?.ToLowerInvariant() ?? "postgres";
    public string WorkspaceRoot => GetString("workspace") ?? Directory.GetCurrentDirectory();

    public string? GetString(string name) => Args.TryGetValue(name, out var v) ? v : null;

    public Guid RequireGuid(string name)
    {
        var raw = RequireString(name);
        return Guid.TryParse(raw, out var parsed)
            ? parsed
            : throw new ArgumentException($"invalid guid for --{name}: {raw}");
    }

    public decimal RequireDecimal(string name)
    {
        var raw = RequireString(name);
        return decimal.Parse(raw, CultureInfo.InvariantCulture);
    }

    public decimal GetDecimal(string name, decimal defaultValue)
    {
        var raw = GetString(name);
        return string.IsNullOrWhiteSpace(raw) ? defaultValue : decimal.Parse(raw, CultureInfo.InvariantCulture);
    }

    public decimal? GetNullableDecimal(string name)
    {
        var raw = GetString(name);
        return string.IsNullOrWhiteSpace(raw) ? null : decimal.Parse(raw, CultureInfo.InvariantCulture);
    }

    public string RequireString(string name)
    {
        var raw = GetString(name);
        if (string.IsNullOrWhiteSpace(raw))
        {
            throw new ArgumentException($"missing required --{name}");
        }

        return raw;
    }

    public static CliOptions? Parse(string[] args)
    {
        if (args.Length == 0)
        {
            return null;
        }

        var command = args[0].Trim().ToLowerInvariant();
        var dict = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        for (var i = 1; i < args.Length; i++)
        {
            var token = args[i];
            if (!token.StartsWith("--", StringComparison.Ordinal))
            {
                continue;
            }

            var key = token[2..];
            if (i + 1 >= args.Length || args[i + 1].StartsWith("--", StringComparison.Ordinal))
            {
                dict[key] = "true";
                continue;
            }

            dict[key] = args[i + 1];
            i++;
        }

        return new CliOptions
        {
            Command = command,
            Args = dict
        };
    }

    public static void PrintUsage()
    {
        Console.WriteLine("KanbanTaskManager usage:");
        Console.WriteLine("  dotnet run --project tools/KanbanTaskManager -- list --tenant <guid> [--provider postgres]");
        Console.WriteLine("  dotnet run --project tools/KanbanTaskManager -- create --tenant <guid> --title <text> --description <text> --type <type> --module <module> --estimate <hours> [--assignee <name>]");
        Console.WriteLine("  dotnet run --project tools/KanbanTaskManager -- set-effort --tenant <guid> --task <guid> --spent <hours>");
        Console.WriteLine("  dotnet run --project tools/KanbanTaskManager -- set-status --tenant <guid> --task <guid> --status <new|active|resolved>");
        Console.WriteLine("  dotnet run --project tools/KanbanTaskManager -- close --tenant <guid> --task <guid> [--spent <hours>]");
    }
}
