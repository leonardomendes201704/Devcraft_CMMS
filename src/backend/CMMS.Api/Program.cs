using CMMS.Api.Tenancy;
using CMMS.Api.Auth;
using CMMS.Application;
using CMMS.Domain.Auth;
using CMMS.Domain.Project;
using CMMS.Infrastructure;
using CMMS.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, services, configuration) =>
{
    configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .WriteTo.Console();
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<CMMS.Shared.Tenancy.ICurrentTenant, HttpCurrentTenant>();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddControllers();
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = false;
});

var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>() ?? new JwtSettings();
if (string.IsNullOrWhiteSpace(jwtSettings.Key) || jwtSettings.Key.Length < 32)
{
    throw new InvalidOperationException("Jwt:Key must be configured with at least 32 characters.");
}

var issuer = string.IsNullOrWhiteSpace(jwtSettings.Issuer) ? "Devcraft.CMMS" : jwtSettings.Issuer.Trim();
var audience = string.IsNullOrWhiteSpace(jwtSettings.Audience) ? "Devcraft.CMMS.Web" : jwtSettings.Audience.Trim();
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key));
var clockSkewMinutes = Math.Max(0, jwtSettings.ClockSkewMinutes);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = signingKey,
            RoleClaimType = ClaimTypes.Role,
            NameClaimType = ClaimTypes.Email,
            ClockSkew = TimeSpan.FromMinutes(clockSkewMinutes)
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(AuthorizationPolicies.AdminMasterOnly, policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireRole(AuthRoles.AdminMaster);
    });

    options.FallbackPolicy = options.GetPolicy(AuthorizationPolicies.AdminMasterOnly);
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new() { Title = "Devcraft CMMS API", Version = "v1" });
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme."
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await dbContext.Database.EnsureCreatedAsync();
    await EnsureAuthSchemaAsync(dbContext);
    await EnsureKanbanEvidenceSchemaAsync(dbContext);
    await EnsureProjectChangelogSchemaAsync(dbContext);
    await SyncProjectChangelogFromFileAsync(dbContext, app.Environment.ContentRootPath);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseSerilogRequestLogging();
app.UseHttpsRedirection();
app.UseMiddleware<TenantResolutionMiddleware>();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new { status = "healthy", utcNow = DateTime.UtcNow })).AllowAnonymous();
app.MapControllers();

app.Run();

static async Task EnsureAuthSchemaAsync(AppDbContext dbContext)
{
    var providerName = dbContext.Database.ProviderName ?? string.Empty;

    if (providerName.Contains("Sqlite", StringComparison.OrdinalIgnoreCase))
    {
        await dbContext.Database.ExecuteSqlRawAsync(
            """
            CREATE TABLE IF NOT EXISTS auth_users (
              "Id" TEXT NOT NULL CONSTRAINT "PK_auth_users" PRIMARY KEY,
              "TenantId" TEXT NOT NULL,
              "Email" TEXT NOT NULL,
              "PasswordHash" TEXT NOT NULL,
              "Role" TEXT NOT NULL,
              "IsActive" INTEGER NOT NULL,
              "CreatedAtUtc" TEXT NOT NULL,
              "UpdatedAtUtc" TEXT NULL
            );
            """);
        await dbContext.Database.ExecuteSqlRawAsync(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS IX_auth_users_tenant_email
            ON auth_users ("TenantId","Email");
            """);
        return;
    }

    if (providerName.Contains("Npgsql", StringComparison.OrdinalIgnoreCase))
    {
        await dbContext.Database.ExecuteSqlRawAsync(
            """
            CREATE TABLE IF NOT EXISTS auth_users (
              "Id" uuid NOT NULL PRIMARY KEY,
              "TenantId" uuid NOT NULL,
              "Email" character varying(256) NOT NULL,
              "PasswordHash" character varying(512) NOT NULL,
              "Role" character varying(64) NOT NULL,
              "IsActive" boolean NOT NULL,
              "CreatedAtUtc" timestamp with time zone NOT NULL,
              "UpdatedAtUtc" timestamp with time zone NULL
            );
            """);
        await dbContext.Database.ExecuteSqlRawAsync(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_auth_users_tenant_email"
            ON auth_users ("TenantId","Email");
            """);
    }
}

static async Task EnsureKanbanEvidenceSchemaAsync(AppDbContext dbContext)
{
    var providerName = dbContext.Database.ProviderName ?? string.Empty;

    if (providerName.Contains("Sqlite", StringComparison.OrdinalIgnoreCase))
    {
        try
        {
            await dbContext.Database.ExecuteSqlRawAsync(
                "ALTER TABLE kanban_tasks ADD COLUMN EvidenceJson TEXT NOT NULL DEFAULT '[]';");
        }
        catch
        {
            // Column may already exist on dev databases.
        }

        return;
    }

    if (providerName.Contains("Npgsql", StringComparison.OrdinalIgnoreCase))
    {
        await dbContext.Database.ExecuteSqlRawAsync(
            "ALTER TABLE kanban_tasks ADD COLUMN IF NOT EXISTS \"EvidenceJson\" text NOT NULL DEFAULT '[]';");
    }
}

static async Task EnsureProjectChangelogSchemaAsync(AppDbContext dbContext)
{
    var providerName = dbContext.Database.ProviderName ?? string.Empty;

    if (providerName.Contains("Sqlite", StringComparison.OrdinalIgnoreCase))
    {
        await dbContext.Database.ExecuteSqlRawAsync(
            """
            CREATE TABLE IF NOT EXISTS project_changelog_entries (
              "Id" TEXT NOT NULL CONSTRAINT "PK_project_changelog_entries" PRIMARY KEY,
              "Version" TEXT NOT NULL,
              "ReleaseDateUtc" TEXT NOT NULL,
              "Category" TEXT NOT NULL,
              "Description" TEXT NOT NULL,
              "Source" TEXT NOT NULL,
              "CreatedAtUtc" TEXT NOT NULL
            );
            """);
        await dbContext.Database.ExecuteSqlRawAsync(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS IX_project_changelog_entries_unique
            ON project_changelog_entries ("Version","ReleaseDateUtc","Category","Description");
            """);
        return;
    }

    if (providerName.Contains("Npgsql", StringComparison.OrdinalIgnoreCase))
    {
        await dbContext.Database.ExecuteSqlRawAsync(
            """
            CREATE TABLE IF NOT EXISTS project_changelog_entries (
              "Id" uuid NOT NULL PRIMARY KEY,
              "Version" character varying(64) NOT NULL,
              "ReleaseDateUtc" timestamp with time zone NOT NULL,
              "Category" character varying(128) NOT NULL,
              "Description" character varying(4000) NOT NULL,
              "Source" character varying(32) NOT NULL,
              "CreatedAtUtc" timestamp with time zone NOT NULL
            );
            """);
        await dbContext.Database.ExecuteSqlRawAsync(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_project_changelog_entries_unique"
            ON project_changelog_entries ("Version","ReleaseDateUtc","Category","Description");
            """);
    }
}

static async Task SyncProjectChangelogFromFileAsync(AppDbContext dbContext, string contentRootPath)
{
    var changelogPath = ResolveChangelogPath(contentRootPath);
    if (changelogPath is null || !File.Exists(changelogPath))
    {
        return;
    }

    var lines = await File.ReadAllLinesAsync(changelogPath);
    var parsedEntries = ParseChangelogLines(lines);
    if (parsedEntries.Count == 0)
    {
        return;
    }

    var existing = await dbContext.ProjectChangelogEntries
        .AsNoTracking()
        .ToListAsync();

    var existingKeys = existing
        .Select(ToEntryKey)
        .ToHashSet(StringComparer.OrdinalIgnoreCase);

    var toInsert = parsedEntries
        .Where(entry => !existingKeys.Contains(ToEntryKey(entry)))
        .ToList();

    if (toInsert.Count == 0)
    {
        return;
    }

    dbContext.ProjectChangelogEntries.AddRange(toInsert);
    await dbContext.SaveChangesAsync();
}

static string? ResolveChangelogPath(string contentRootPath)
{
    var current = new DirectoryInfo(contentRootPath);
    while (current is not null)
    {
        var candidate = Path.Combine(current.FullName, "CHANGELOG.md");
        if (File.Exists(candidate))
        {
            return candidate;
        }

        current = current.Parent;
    }

    return null;
}

static List<ProjectChangelogEntry> ParseChangelogLines(IEnumerable<string> lines)
{
    var releaseRegex = new Regex(@"^##\s+\[(?<version>[^\]]+)\]\s*-\s*(?<date>\d{4}-\d{2}-\d{2})\s*$", RegexOptions.Compiled);
    var categoryRegex = new Regex(@"^###\s+(?<category>.+?)\s*$", RegexOptions.Compiled);

    string? currentVersion = null;
    DateTime currentReleaseDateUtc = DateTime.UtcNow.Date;
    string? currentCategory = null;
    var results = new List<ProjectChangelogEntry>();

    foreach (var rawLine in lines)
    {
        var line = rawLine.Trim();
        if (line.Length == 0)
        {
            continue;
        }

        var releaseMatch = releaseRegex.Match(line);
        if (releaseMatch.Success)
        {
            currentVersion = releaseMatch.Groups["version"].Value.Trim();
            var dateText = releaseMatch.Groups["date"].Value.Trim();
            if (DateOnly.TryParse(dateText, out var releaseDate))
            {
                currentReleaseDateUtc = new DateTime(releaseDate.Year, releaseDate.Month, releaseDate.Day, 0, 0, 0, DateTimeKind.Utc);
            }
            currentCategory = null;
            continue;
        }

        var categoryMatch = categoryRegex.Match(line);
        if (categoryMatch.Success)
        {
            currentCategory = categoryMatch.Groups["category"].Value.Trim();
            continue;
        }

        if (!line.StartsWith("- ", StringComparison.Ordinal) || currentVersion is null || currentCategory is null)
        {
            continue;
        }

        var description = line[2..].Trim();
        if (description.Length == 0)
        {
            continue;
        }

        results.Add(new ProjectChangelogEntry
        {
            Id = Guid.NewGuid(),
            Version = currentVersion,
            ReleaseDateUtc = currentReleaseDateUtc,
            Category = currentCategory,
            Description = description,
            Source = "file",
            CreatedAtUtc = DateTime.UtcNow
        });
    }

    return results
        .GroupBy(ToEntryKey)
        .Select(group => group.First())
        .ToList();
}

static string ToEntryKey(ProjectChangelogEntry entry)
{
    return $"{entry.Version}|{entry.ReleaseDateUtc:yyyy-MM-dd}|{entry.Category}|{entry.Description}";
}
