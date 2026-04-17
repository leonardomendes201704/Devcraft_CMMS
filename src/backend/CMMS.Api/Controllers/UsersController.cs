using CMMS.Api.Auth;
using CMMS.Domain.Auth;
using CMMS.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace CMMS.Api.Controllers;

[ApiController]
[Route("api/auth/users")]
[Authorize(Policy = AuthorizationPolicies.AdminMasterOnly)]
public sealed class UsersController(AppDbContext dbContext) : ControllerBase
{
    private readonly AppDbContext _dbContext = dbContext;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AuthUserResponse>>> ListAsync(CancellationToken cancellationToken)
    {
        var users = await _dbContext.AuthUsers
            .AsNoTracking()
            .OrderBy(x => x.Email)
            .ToListAsync(cancellationToken);

        return Ok(users.Select(ToResponse).ToList());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AuthUserResponse>> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var user = await _dbContext.AuthUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (user is null)
        {
            return NotFound();
        }

        return Ok(ToResponse(user));
    }

    [HttpPost]
    public async Task<ActionResult<AuthUserResponse>> CreateAsync([FromBody] CreateAuthUserRequest request, CancellationToken cancellationToken)
    {
        var email = (request.Email ?? string.Empty).Trim().ToLowerInvariant();
        if (email.Length == 0)
        {
            return BadRequest(CreateValidationProblemDetails(nameof(request.Email), "Email is required."));
        }

        var role = NormalizeRole(request.Role);
        if (role is null)
        {
            return BadRequest(CreateValidationProblemDetails(nameof(request.Role), "Role is invalid."));
        }

        var passwordValidation = CredentialPolicy.ValidatePassword(request.Password);
        if (!passwordValidation.IsValid)
        {
            return BadRequest(CreateValidationProblemDetails(nameof(request.Password), passwordValidation.Error ?? "Password is invalid."));
        }

        var exists = await _dbContext.AuthUsers.AnyAsync(x => x.Email == email, cancellationToken);
        if (exists)
        {
            return Conflict(new { error = "user_exists", message = "User email already exists in current tenant." });
        }

        var user = new AuthUser
        {
            Email = email,
            PasswordHash = PasswordHasher.HashPassword(request.Password),
            Role = role,
            IsActive = request.IsActive ?? true
        };

        _dbContext.AuthUsers.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return Created($"/api/auth/users/{user.Id}", ToResponse(user));
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<AuthUserResponse>> UpdateAsync(Guid id, [FromBody] UpdateAuthUserRequest request, CancellationToken cancellationToken)
    {
        var user = await _dbContext.AuthUsers.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (user is null)
        {
            return NotFound();
        }

        if (request.Role is not null)
        {
            var role = NormalizeRole(request.Role);
            if (role is null)
            {
                return BadRequest(CreateValidationProblemDetails(nameof(request.Role), "Role is invalid."));
            }

            user.Role = role;
        }

        if (request.IsActive.HasValue)
        {
            user.IsActive = request.IsActive.Value;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return Ok(ToResponse(user));
    }

    [HttpPost("{id:guid}/reset-password")]
    public async Task<ActionResult<AuthUserResponse>> ResetPasswordAsync(Guid id, [FromBody] ResetAuthUserPasswordRequest request, CancellationToken cancellationToken)
    {
        var user = await _dbContext.AuthUsers.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (user is null)
        {
            return NotFound();
        }

        var passwordValidation = CredentialPolicy.ValidatePassword(request.Password);
        if (!passwordValidation.IsValid)
        {
            return BadRequest(CreateValidationProblemDetails(nameof(request.Password), passwordValidation.Error ?? "Password is invalid."));
        }

        user.PasswordHash = PasswordHasher.HashPassword(request.Password);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return Ok(ToResponse(user));
    }

    private static AuthUserResponse ToResponse(AuthUser user)
    {
        return new AuthUserResponse(
            user.Id,
            user.Email,
            user.Role,
            user.IsActive,
            DateTime.SpecifyKind(user.CreatedAtUtc, DateTimeKind.Utc),
            user.UpdatedAtUtc.HasValue ? DateTime.SpecifyKind(user.UpdatedAtUtc.Value, DateTimeKind.Utc) : null);
    }

    private static string? NormalizeRole(string? role)
    {
        if (string.IsNullOrWhiteSpace(role))
        {
            return null;
        }

        var normalized = role.Trim().ToLowerInvariant();
        return AuthRoles.Allowed.Contains(normalized) ? normalized : null;
    }

    private static ValidationProblemDetails CreateValidationProblemDetails(string field, string message)
    {
        return new ValidationProblemDetails(new Dictionary<string, string[]>
        {
            [field] = [message]
        });
    }
}

public sealed class CreateAuthUserRequest
{
    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; init; } = string.Empty;

    [Required, MaxLength(256)]
    public string Password { get; init; } = string.Empty;

    [Required, MaxLength(64)]
    public string Role { get; init; } = string.Empty;

    public bool? IsActive { get; init; }
}

public sealed class UpdateAuthUserRequest
{
    [MaxLength(64)]
    public string? Role { get; init; }

    public bool? IsActive { get; init; }
}

public sealed class ResetAuthUserPasswordRequest
{
    [Required, MaxLength(256)]
    public string Password { get; init; } = string.Empty;
}

public sealed record AuthUserResponse(
    Guid Id,
    string Email,
    string Role,
    bool IsActive,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);
