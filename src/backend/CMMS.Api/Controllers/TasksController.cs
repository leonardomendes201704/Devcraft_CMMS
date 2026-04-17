using CMMS.Domain.Tasks;
using CMMS.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace CMMS.Api.Controllers;

[ApiController]
[Route("api/tasks")]
public sealed class TasksController(AppDbContext dbContext) : ControllerBase
{
    private readonly AppDbContext _dbContext = dbContext;

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

        var imageUrl = request.ImageUrl?.Trim() ?? string.Empty;
        if (imageUrl.Length == 0)
        {
            return BadRequest(CreateValidationProblemDetails(nameof(request.ImageUrl), "ImageUrl is required."));
        }

        var evidences = DeserializeEvidencesJson(task.EvidenceJson);
        evidences.Add(new KanbanTaskEvidence
        {
            Id = Guid.NewGuid(),
            Title = title,
            ImageUrl = imageUrl,
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

    [Required, MaxLength(2048)]
    public string ImageUrl { get; init; } = string.Empty;

    [MaxLength(64)]
    public string? Source { get; init; }

    public DateTime? CapturedAtUtc { get; init; }
}

public sealed record KanbanTaskEvidenceResponse(
    Guid Id,
    string Title,
    string ImageUrl,
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
    DateTime? ClosedAtUtc,
    decimal? TotalSpentHoursOnClose,
    decimal? TotalLeadTimeHoursOnClose,
    IReadOnlyList<KanbanTaskEvidenceResponse> Evidences);

public static class KanbanTaskMappings
{
    public static KanbanTaskResponse ToResponse(this KanbanTask task)
    {
        var createdAtUtc = DateTime.SpecifyKind(task.CreatedAtUtc, DateTimeKind.Utc);
        var closedAtUtc = task.ClosedAtUtc.HasValue
            ? DateTime.SpecifyKind(task.ClosedAtUtc.Value, DateTimeKind.Utc)
            : (DateTime?)null;
        var evidences = DeserializeEvidences(task.EvidenceJson)
            .OrderByDescending(x => x.CapturedAtUtc)
            .Select(x => new KanbanTaskEvidenceResponse(
                x.Id,
                x.Title,
                x.ImageUrl,
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
}
