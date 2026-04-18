using CMMS.Api.Auth;
using CMMS.Domain.Auth;
using CMMS.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace CMMS.Api.Controllers;

[ApiController]
[Route("api/auth/jobs")]
[Authorize(Policy = AuthorizationPolicies.AdminMasterOnly)]
public sealed class JobsController(AppDbContext dbContext) : ControllerBase
{
    private readonly AppDbContext _dbContext = dbContext;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AuthJobResponse>>> ListAsync([FromQuery] Guid? departmentId, CancellationToken cancellationToken)
    {
        var query = _dbContext.AuthJobs
            .AsNoTracking()
            .Include(x => x.Department)
            .AsQueryable();

        if (departmentId.HasValue)
        {
            query = query.Where(x => x.DepartmentId == departmentId.Value);
        }

        var jobs = await query
            .OrderBy(x => x.Department.Name)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return Ok(jobs.Select(ToResponse).ToList());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AuthJobResponse>> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var job = await _dbContext.AuthJobs
            .AsNoTracking()
            .Include(x => x.Department)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (job is null)
        {
            return NotFound();
        }

        return Ok(ToResponse(job));
    }

    [HttpPost]
    public async Task<ActionResult<AuthJobResponse>> CreateAsync([FromBody] CreateAuthJobRequest request, CancellationToken cancellationToken)
    {
        var name = NormalizeRequired(request.Name);
        var code = NormalizeRequired(request.Code)?.ToUpperInvariant();

        if (name is null)
        {
            return BadRequest(CreateValidationProblemDetails(nameof(request.Name), "Name is required."));
        }

        if (code is null)
        {
            return BadRequest(CreateValidationProblemDetails(nameof(request.Code), "Code is required."));
        }

        var department = await _dbContext.AuthDepartments.FirstOrDefaultAsync(x => x.Id == request.DepartmentId, cancellationToken);
        if (department is null)
        {
            return BadRequest(CreateValidationProblemDetails(nameof(request.DepartmentId), "Department was not found."));
        }

        var existsByCode = await _dbContext.AuthJobs.AnyAsync(x => x.Code == code, cancellationToken);
        if (existsByCode)
        {
            return Conflict(new { error = "job_code_exists", message = "Job code already exists in current tenant." });
        }

        var job = new AuthJob
        {
            DepartmentId = request.DepartmentId,
            Name = name,
            Code = code,
            Description = NormalizeOptional(request.Description),
            IsActive = request.IsActive ?? true
        };

        _dbContext.AuthJobs.Add(job);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _dbContext.Entry(job).Reference(x => x.Department).LoadAsync(cancellationToken);

        return Created($"/api/auth/jobs/{job.Id}", ToResponse(job));
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<AuthJobResponse>> UpdateAsync(Guid id, [FromBody] UpdateAuthJobRequest request, CancellationToken cancellationToken)
    {
        var job = await _dbContext.AuthJobs
            .Include(x => x.Department)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (job is null)
        {
            return NotFound();
        }

        if (request.Name is not null)
        {
            var nextName = NormalizeRequired(request.Name);
            if (nextName is null)
            {
                return BadRequest(CreateValidationProblemDetails(nameof(request.Name), "Name cannot be empty."));
            }

            job.Name = nextName;
        }

        if (request.Code is not null)
        {
            var nextCode = NormalizeRequired(request.Code)?.ToUpperInvariant();
            if (nextCode is null)
            {
                return BadRequest(CreateValidationProblemDetails(nameof(request.Code), "Code cannot be empty."));
            }

            var existsByCode = await _dbContext.AuthJobs.AnyAsync(x => x.Id != id && x.Code == nextCode, cancellationToken);
            if (existsByCode)
            {
                return Conflict(new { error = "job_code_exists", message = "Job code already exists in current tenant." });
            }

            job.Code = nextCode;
        }

        if (request.DepartmentId.HasValue && request.DepartmentId.Value != job.DepartmentId)
        {
            var department = await _dbContext.AuthDepartments.FirstOrDefaultAsync(x => x.Id == request.DepartmentId.Value, cancellationToken);
            if (department is null)
            {
                return BadRequest(CreateValidationProblemDetails(nameof(request.DepartmentId), "Department was not found."));
            }

            job.DepartmentId = request.DepartmentId.Value;
        }

        if (request.Description is not null)
        {
            job.Description = NormalizeOptional(request.Description);
        }

        if (request.IsActive.HasValue)
        {
            job.IsActive = request.IsActive.Value;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        await _dbContext.Entry(job).Reference(x => x.Department).LoadAsync(cancellationToken);

        return Ok(ToResponse(job));
    }

    private static AuthJobResponse ToResponse(AuthJob job)
    {
        return new AuthJobResponse(
            job.Id,
            job.DepartmentId,
            job.Department.Name,
            job.Name,
            job.Code,
            job.Description,
            job.IsActive,
            DateTime.SpecifyKind(job.CreatedAtUtc, DateTimeKind.Utc),
            job.UpdatedAtUtc.HasValue ? DateTime.SpecifyKind(job.UpdatedAtUtc.Value, DateTimeKind.Utc) : null);
    }

    private static ValidationProblemDetails CreateValidationProblemDetails(string field, string message)
    {
        return new ValidationProblemDetails(new Dictionary<string, string[]>
        {
            [field] = [message]
        });
    }

    private static string? NormalizeRequired(string? value)
    {
        var normalized = value?.Trim();
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }

    private static string? NormalizeOptional(string? value)
    {
        var normalized = value?.Trim();
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }
}

public sealed class CreateAuthJobRequest
{
    [Required]
    public Guid DepartmentId { get; init; }

    [Required, MaxLength(128)]
    public string Name { get; init; } = string.Empty;

    [Required, MaxLength(32)]
    public string Code { get; init; } = string.Empty;

    [MaxLength(512)]
    public string? Description { get; init; }

    public bool? IsActive { get; init; }
}

public sealed class UpdateAuthJobRequest
{
    public Guid? DepartmentId { get; init; }

    [MaxLength(128)]
    public string? Name { get; init; }

    [MaxLength(32)]
    public string? Code { get; init; }

    [MaxLength(512)]
    public string? Description { get; init; }

    public bool? IsActive { get; init; }
}

public sealed record AuthJobResponse(
    Guid Id,
    Guid DepartmentId,
    string DepartmentName,
    string Name,
    string Code,
    string? Description,
    bool IsActive,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);
