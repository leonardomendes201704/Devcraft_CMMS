using CMMS.Domain.Tasks;
using CMMS.Domain.Auth;
using CMMS.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.Text;

namespace CMMS.Api.Controllers;

[ApiController]
[Route("api/tasks")]
[Authorize(Policy = AuthorizationPolicies.AdminMasterOnly)]
public sealed class TasksController(AppDbContext dbContext) : ControllerBase
{
    private readonly AppDbContext _dbContext = dbContext;
    private static readonly string[] FrontendFlowKeywords =
    [
        "frontend", "front-end", "web", "ui", "ux", "react", "page", "modal", "kanban", "playwright", "e2e"
    ];

    private static readonly string[] ApiFlowKeywords =
    [
        "api", "backend", "endpoint", "controller", "payload", "json", "postman", "auth", "swagger", "integration"
    ];

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<KanbanTaskResponse>>> ListAsync(CancellationToken cancellationToken)
    {
        var tasks = await _dbContext.KanbanTasks
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return Ok(tasks.Select(x => x.ToResponse()).ToList());
    }

    [HttpPost]
    public async Task<ActionResult<KanbanTaskResponse>> CreateAsync([FromBody] CreateKanbanTaskRequest request, CancellationToken cancellationToken)
    {
        if (!KanbanTaskType.Allowed.Contains(request.Type))
        {
            return BadRequest(CreateValidationProblemDetails(nameof(request.Type), "Type is invalid."));
        }

        var task = new KanbanTask
        {
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Type = request.Type,
            Module = request.Module.Trim(),
            Assignee = string.IsNullOrWhiteSpace(request.Assignee) ? "Unassigned" : request.Assignee.Trim(),
            EstimateHours = NormalizeHours(request.EstimateHours, 0.5m),
            SpentHours = 0,
            Status = KanbanTaskStatus.New
        };

        _dbContext.KanbanTasks.Add(task);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Created($"/api/tasks/{task.Id}", task.ToResponse());
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<KanbanTaskResponse>> UpdateStatusAsync(Guid id, [FromBody] UpdateTaskStatusRequest request, CancellationToken cancellationToken)
    {
        if (!KanbanTaskStatus.Allowed.Contains(request.Status))
        {
            return BadRequest(CreateValidationProblemDetails(nameof(request.Status), "Status is invalid."));
        }

        if (request.Status == KanbanTaskStatus.Closed)
        {
            return BadRequest(CreateValidationProblemDetails(nameof(request.Status), "Use /complete endpoint to close a task."));
        }

        var task = await _dbContext.KanbanTasks.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (task is null)
        {
            return NotFound();
        }

        if (task.Status == KanbanTaskStatus.Closed)
        {
            return BadRequest(CreateValidationProblemDetails(nameof(request.Status), "Closed tasks cannot change status."));
        }

        if (task.Status == request.Status)
        {
            return Ok(task.ToResponse());
        }

        var previousStatus = task.Status;
        if (!IsAllowedStatusTransition(previousStatus, request.Status))
        {
            return BadRequest(CreateValidationProblemDetails(nameof(request.Status), $"Transition from '{previousStatus}' to '{request.Status}' is not allowed."));
        }

        task.Status = request.Status;

        _dbContext.KanbanTaskAuditLogs.Add(new KanbanTaskAuditLog
        {
            KanbanTaskId = task.Id,
            EventType = "status_changed",
            FromStatus = previousStatus,
            ToStatus = task.Status
        });

        await _dbContext.SaveChangesAsync(cancellationToken);
        return Ok(task.ToResponse());
    }

    [HttpPatch("{id:guid}/effort")]
    public async Task<ActionResult<KanbanTaskResponse>> UpdateEffortAsync(Guid id, [FromBody] UpdateTaskEffortRequest request, CancellationToken cancellationToken)
    {
        var task = await _dbContext.KanbanTasks.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (task is null)
        {
            return NotFound();
        }

        if (task.Status == KanbanTaskStatus.Closed)
        {
            return BadRequest(CreateValidationProblemDetails(nameof(request.SpentHours), "Closed tasks cannot change effort."));
        }

        var previousSpent = task.SpentHours;
        var nextSpent = NormalizeHours(request.SpentHours, 0m);

        if (previousSpent == nextSpent)
        {
            return Ok(task.ToResponse());
        }

        task.SpentHours = nextSpent;

        _dbContext.KanbanTaskAuditLogs.Add(new KanbanTaskAuditLog
        {
            KanbanTaskId = task.Id,
            EventType = "effort_changed",
            FromSpentHours = previousSpent,
            ToSpentHours = task.SpentHours
        });

        await _dbContext.SaveChangesAsync(cancellationToken);
        return Ok(task.ToResponse());
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<ActionResult<KanbanTaskResponse>> CompleteAsync(Guid id, [FromBody] CompleteTaskRequest? request, CancellationToken cancellationToken)
    {
        var task = await _dbContext.KanbanTasks.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (task is null)
        {
            return NotFound();
        }

        if (task.Status == KanbanTaskStatus.Closed)
        {
            return Ok(task.ToResponse());
        }

        if (task.Status != KanbanTaskStatus.Resolved)
        {
            return BadRequest(CreateValidationProblemDetails(nameof(task.Status), "Task can only be completed when status is 'resolved'."));
        }

        if (request?.SpentHours is decimal spentHours)
        {
            var previousSpent = task.SpentHours;
            var nextSpent = NormalizeHours(spentHours, 0m);

            if (previousSpent != nextSpent)
            {
                task.SpentHours = nextSpent;
                _dbContext.KanbanTaskAuditLogs.Add(new KanbanTaskAuditLog
                {
                    KanbanTaskId = task.Id,
                    EventType = "effort_changed",
                    FromSpentHours = previousSpent,
                    ToSpentHours = task.SpentHours
                });
            }
        }

        if (task.SpentHours <= 0m)
        {
            return BadRequest(CreateValidationProblemDetails(nameof(task.SpentHours), "Task must have spentHours greater than 0 before close."));
        }

        var evidences = DeserializeEvidencesJson(task.EvidenceJson);
        var evidenceValidation = ValidateRequiredEvidence(task, evidences);
        if (evidenceValidation.Count > 0)
        {
            return BadRequest(new ValidationProblemDetails(evidenceValidation));
        }

        var previousStatus = task.Status;
        var closedAtUtc = DateTime.UtcNow;
        var leadTimeHours = Math.Round((decimal)(closedAtUtc - task.CreatedAtUtc).TotalHours, 2);

        task.Status = KanbanTaskStatus.Closed;
        task.ClosedAtUtc = closedAtUtc;
        task.TotalSpentHoursOnClose = task.SpentHours;
        task.TotalLeadTimeHoursOnClose = leadTimeHours;

        _dbContext.KanbanTaskAuditLogs.Add(new KanbanTaskAuditLog
        {
            KanbanTaskId = task.Id,
            EventType = "status_changed",
            FromStatus = previousStatus,
            ToStatus = task.Status
        });

        _dbContext.KanbanTaskAuditLogs.Add(new KanbanTaskAuditLog
        {
            KanbanTaskId = task.Id,
            EventType = "task_completed",
            FromStatus = previousStatus,
            ToStatus = KanbanTaskStatus.Closed,
            TotalSpentHoursAtClose = task.TotalSpentHoursOnClose,
            TotalLeadTimeHoursAtClose = task.TotalLeadTimeHoursOnClose
        });

        await _dbContext.SaveChangesAsync(cancellationToken);
        return Ok(task.ToResponse());
    }

    [HttpPost("{id:guid}/evidences")]
    public async Task<ActionResult<KanbanTaskResponse>> AddEvidenceAsync(
        Guid id,
        [FromBody] AddTaskEvidenceRequest request,
        CancellationToken cancellationToken)
    {
        var task = await _dbContext.KanbanTasks.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (task is null)
        {
            return NotFound();
        }

        var title = request.Title?.Trim() ?? string.Empty;
        if (title.Length == 0)
        {
            return BadRequest(CreateValidationProblemDetails(nameof(request.Title), "Title is required."));
        }

        var kind = NormalizeEvidenceKind(request.Kind);
        if (kind is null)
        {
            return BadRequest(CreateValidationProblemDetails(nameof(request.Kind), "Kind must be either 'image' or 'api'."));
        }

        var imageUrl = request.ImageUrl?.Trim() ?? string.Empty;
        var payloadJson = request.PayloadJson?.Trim();

        if (kind == "image" && imageUrl.Length == 0)
        {
            return BadRequest(CreateValidationProblemDetails(nameof(request.ImageUrl), "ImageUrl is required for image evidence."));
        }

        if (kind == "api" && string.IsNullOrWhiteSpace(payloadJson))
        {
            return BadRequest(CreateValidationProblemDetails(nameof(request.PayloadJson), "PayloadJson is required for api evidence."));
        }

        if (kind == "api" && !IsValidJson(payloadJson!))
        {
            return BadRequest(CreateValidationProblemDetails(nameof(request.PayloadJson), "PayloadJson must contain valid JSON."));
        }

        var evidences = DeserializeEvidencesJson(task.EvidenceJson);
        evidences.Add(new KanbanTaskEvidence
        {
            Id = Guid.NewGuid(),
            Title = title,
            Kind = kind,
            ImageUrl = imageUrl,
            PayloadJson = kind == "api" ? payloadJson : null,
            CapturedAtUtc = request.CapturedAtUtc ?? DateTime.UtcNow,
            Source = string.IsNullOrWhiteSpace(request.Source) ? "manual" : request.Source.Trim()
        });

        task.EvidenceJson = JsonSerializer.Serialize(evidences);

        _dbContext.KanbanTaskAuditLogs.Add(new KanbanTaskAuditLog
        {
            KanbanTaskId = task.Id,
            EventType = "evidence_added"
        });

        await _dbContext.SaveChangesAsync(cancellationToken);
        return Ok(task.ToResponse());
    }

    private static decimal NormalizeHours(decimal value, decimal minimum)
    {
        if (value < minimum)
        {
            return minimum;
        }

        return Math.Round(value, 2);
    }

    private static ValidationProblemDetails CreateValidationProblemDetails(string field, string message)
    {
        return new ValidationProblemDetails(new Dictionary<string, string[]>
        {
            [field] = [message]
        });
    }

    private static string? NormalizeEvidenceKind(string? kind)
    {
        if (string.IsNullOrWhiteSpace(kind))
        {
            return "image";
        }

        var normalized = kind.Trim().ToLowerInvariant();
        return normalized is "image" or "api" ? normalized : null;
    }

    private static Dictionary<string, string[]> ValidateRequiredEvidence(KanbanTask task, IReadOnlyList<KanbanTaskEvidence> evidences)
    {
        var normalized = BuildSearchableTaskText(task);
        var requiresFrontendEvidence = FrontendFlowKeywords.Any(keyword => normalized.Contains(keyword));
        var requiresApiEvidence = ApiFlowKeywords.Any(keyword => normalized.Contains(keyword));

        var validationErrors = new Dictionary<string, string[]>();
        if (requiresFrontendEvidence)
        {
            var hasFrontendEvidence = evidences.Any(evidence =>
                NormalizeEvidenceKind(evidence.Kind) == "image" &&
                !string.IsNullOrWhiteSpace(evidence.ImageUrl));

            if (!hasFrontendEvidence)
            {
                validationErrors["evidences.frontend"] =
                [
                    "Frontend-related task requires at least one image evidence before close."
                ];
            }
        }

        if (requiresApiEvidence)
        {
            var hasApiEvidence = evidences.Any(evidence =>
                NormalizeEvidenceKind(evidence.Kind) == "api" &&
                !string.IsNullOrWhiteSpace(evidence.PayloadJson));

            if (!hasApiEvidence)
            {
                validationErrors["evidences.api"] =
                [
                    "API-related task requires at least one API evidence with JSON payload/response before close."
                ];
            }
        }

        return validationErrors;
    }

    private static string BuildSearchableTaskText(KanbanTask task)
    {
        var builder = new StringBuilder();
        builder.Append(task.Title);
        builder.Append(' ');
        builder.Append(task.Description);
        builder.Append(' ');
        builder.Append(task.Module);
        builder.Append(' ');
        builder.Append(task.Type);
        return builder.ToString().ToLowerInvariant();
    }

    private static bool IsValidJson(string payloadJson)
    {
        try
        {
            JsonDocument.Parse(payloadJson);
            return true;
        }
        catch
        {
            return false;
        }
    }

    private static bool IsAllowedStatusTransition(string current, string next)
    {
        return (current, next) switch
        {
            (KanbanTaskStatus.New, KanbanTaskStatus.Active) => true,
            (KanbanTaskStatus.Active, KanbanTaskStatus.Resolved) => true,
            (KanbanTaskStatus.Resolved, KanbanTaskStatus.Active) => true,
            _ => false
        };
    }

    private static List<KanbanTaskEvidence> DeserializeEvidencesJson(string? evidenceJson)
    {
        if (string.IsNullOrWhiteSpace(evidenceJson))
        {
            return [];
        }

        try
        {
            return JsonSerializer.Deserialize<List<KanbanTaskEvidence>>(evidenceJson) ?? [];
        }
        catch
        {
            return [];
        }
    }
}

public sealed class CreateKanbanTaskRequest
{
    [Required, MaxLength(256)]
    public string Title { get; init; } = string.Empty;

    [Required, MaxLength(4000)]
    public string Description { get; init; } = string.Empty;

    [Required, MaxLength(32)]
    public string Type { get; init; } = string.Empty;

    [Required, MaxLength(128)]
    public string Module { get; init; } = string.Empty;

    [MaxLength(128)]
    public string? Assignee { get; init; }

    public decimal EstimateHours { get; init; }
}

public sealed class UpdateTaskStatusRequest
{
    [Required, MaxLength(32)]
    public string Status { get; init; } = string.Empty;
}

public sealed class UpdateTaskEffortRequest
{
    public decimal SpentHours { get; init; }
}

public sealed class CompleteTaskRequest
{
    public decimal? SpentHours { get; init; }
}

public sealed class AddTaskEvidenceRequest
{
    [Required, MaxLength(256)]
    public string Title { get; init; } = string.Empty;

    [MaxLength(16)]
    public string? Kind { get; init; }

    [MaxLength(2048)]
    public string? ImageUrl { get; init; }

    [MaxLength(24000)]
    public string? PayloadJson { get; init; }

    [MaxLength(64)]
    public string? Source { get; init; }

    public DateTime? CapturedAtUtc { get; init; }
}

public sealed record KanbanTaskEvidenceResponse(
    Guid Id,
    string Title,
    string Kind,
    string ImageUrl,
    string? PayloadJson,
    string Source,
    DateTime CapturedAtUtc);

public sealed record KanbanTaskResponse(
    Guid Id,
    string Title,
    string Description,
    string Type,
    string Module,
    string Assignee,
    decimal EstimateHours,
    decimal SpentHours,
    string Status,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    DateTime? ClosedAtUtc,
    decimal? TotalSpentHoursOnClose,
    decimal? TotalLeadTimeHoursOnClose,
    IReadOnlyList<KanbanTaskEvidenceResponse> Evidences);

public static class KanbanTaskMappings
{
    public static KanbanTaskResponse ToResponse(this KanbanTask task)
    {
        var createdAtUtc = DateTime.SpecifyKind(task.CreatedAtUtc, DateTimeKind.Utc);
        var updatedAtUtc = task.UpdatedAtUtc.HasValue
            ? DateTime.SpecifyKind(task.UpdatedAtUtc.Value, DateTimeKind.Utc)
            : (DateTime?)null;
        var closedAtUtc = task.ClosedAtUtc.HasValue
            ? DateTime.SpecifyKind(task.ClosedAtUtc.Value, DateTimeKind.Utc)
            : (DateTime?)null;
        var evidences = DeserializeEvidences(task.EvidenceJson)
            .OrderByDescending(x => x.CapturedAtUtc)
            .Select(x => new KanbanTaskEvidenceResponse(
                x.Id,
                x.Title,
                NormalizeEvidenceKindForResponse(x.Kind),
                x.ImageUrl,
                x.PayloadJson,
                x.Source,
                DateTime.SpecifyKind(x.CapturedAtUtc, DateTimeKind.Utc)))
            .ToList();

        return new KanbanTaskResponse(
            task.Id,
            task.Title,
            task.Description,
            task.Type,
            task.Module,
            task.Assignee,
            task.EstimateHours,
            task.SpentHours,
            task.Status,
            createdAtUtc,
            updatedAtUtc,
            closedAtUtc,
            task.TotalSpentHoursOnClose,
            task.TotalLeadTimeHoursOnClose,
            evidences);
    }

    private static List<KanbanTaskEvidence> DeserializeEvidences(string? evidenceJson)
    {
        if (string.IsNullOrWhiteSpace(evidenceJson))
        {
            return [];
        }

        try
        {
            return JsonSerializer.Deserialize<List<KanbanTaskEvidence>>(evidenceJson) ?? [];
        }
        catch
        {
            return [];
        }
    }

    private static string NormalizeEvidenceKindForResponse(string? kind)
    {
        if (string.Equals(kind, "api", StringComparison.OrdinalIgnoreCase))
        {
            return "api";
        }

        return "image";
    }
}
