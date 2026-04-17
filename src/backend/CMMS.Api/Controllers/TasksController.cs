using CMMS.Domain.Tasks;
using CMMS.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

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
    decimal? TotalLeadTimeHoursOnClose);

public static class KanbanTaskMappings
{
    public static KanbanTaskResponse ToResponse(this KanbanTask task)
    {
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
            task.CreatedAtUtc,
            task.ClosedAtUtc,
            task.TotalSpentHoursOnClose,
            task.TotalLeadTimeHoursOnClose);
    }
}
