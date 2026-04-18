using CMMS.Api.Auth;
using CMMS.Domain.Auth;
using CMMS.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace CMMS.Api.Controllers;

[ApiController]
[Route("api/auth/departments")]
[Authorize(Policy = AuthorizationPolicies.AdminMasterOnly)]
public sealed class DepartmentsController(AppDbContext dbContext) : ControllerBase
{
    private readonly AppDbContext _dbContext = dbContext;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AuthDepartmentResponse>>> ListAsync(CancellationToken cancellationToken)
    {
        var departments = await _dbContext.AuthDepartments
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return Ok(departments.Select(ToResponse).ToList());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AuthDepartmentResponse>> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var department = await _dbContext.AuthDepartments
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (department is null)
        {
            return NotFound();
        }

        return Ok(ToResponse(department));
    }

    [HttpPost]
    public async Task<ActionResult<AuthDepartmentResponse>> CreateAsync([FromBody] CreateAuthDepartmentRequest request, CancellationToken cancellationToken)
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

        var existsByCode = await _dbContext.AuthDepartments.AnyAsync(x => x.Code == code, cancellationToken);
        if (existsByCode)
        {
            return Conflict(new { error = "department_code_exists", message = "Department code already exists in current tenant." });
        }

        var department = new AuthDepartment
        {
            Name = name,
            Code = code,
            Description = NormalizeOptional(request.Description),
            IsActive = request.IsActive ?? true
        };

        _dbContext.AuthDepartments.Add(department);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return Created($"/api/auth/departments/{department.Id}", ToResponse(department));
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<AuthDepartmentResponse>> UpdateAsync(Guid id, [FromBody] UpdateAuthDepartmentRequest request, CancellationToken cancellationToken)
    {
        var department = await _dbContext.AuthDepartments.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (department is null)
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

            department.Name = nextName;
        }

        if (request.Code is not null)
        {
            var nextCode = NormalizeRequired(request.Code)?.ToUpperInvariant();
            if (nextCode is null)
            {
                return BadRequest(CreateValidationProblemDetails(nameof(request.Code), "Code cannot be empty."));
            }

            var existsByCode = await _dbContext.AuthDepartments.AnyAsync(x => x.Id != id && x.Code == nextCode, cancellationToken);
            if (existsByCode)
            {
                return Conflict(new { error = "department_code_exists", message = "Department code already exists in current tenant." });
            }

            department.Code = nextCode;
        }

        if (request.Description is not null)
        {
            department.Description = NormalizeOptional(request.Description);
        }

        if (request.IsActive.HasValue)
        {
            department.IsActive = request.IsActive.Value;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return Ok(ToResponse(department));
    }

    private static AuthDepartmentResponse ToResponse(AuthDepartment department)
    {
        return new AuthDepartmentResponse(
            department.Id,
            department.Name,
            department.Code,
            department.Description,
            department.IsActive,
            DateTime.SpecifyKind(department.CreatedAtUtc, DateTimeKind.Utc),
            department.UpdatedAtUtc.HasValue ? DateTime.SpecifyKind(department.UpdatedAtUtc.Value, DateTimeKind.Utc) : null);
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

public sealed class CreateAuthDepartmentRequest
{
    [Required, MaxLength(128)]
    public string Name { get; init; } = string.Empty;

    [Required, MaxLength(32)]
    public string Code { get; init; } = string.Empty;

    [MaxLength(512)]
    public string? Description { get; init; }

    public bool? IsActive { get; init; }
}

public sealed class UpdateAuthDepartmentRequest
{
    [MaxLength(128)]
    public string? Name { get; init; }

    [MaxLength(32)]
    public string? Code { get; init; }

    [MaxLength(512)]
    public string? Description { get; init; }

    public bool? IsActive { get; init; }
}

public sealed record AuthDepartmentResponse(
    Guid Id,
    string Name,
    string Code,
    string? Description,
    bool IsActive,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);
