using CMMS.Api.Auth;
using CMMS.Domain.Auth;
using CMMS.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace CMMS.Api.Controllers;

[ApiController]
[Route("api/auth/users")]
[Authorize(Policy = AuthorizationPolicies.AdminMasterOnly)]
public sealed class UsersController(AppDbContext dbContext) : ControllerBase
{
    private static readonly Regex LocaleRegex = new("^[a-z]{2}-[A-Z]{2}$", RegexOptions.Compiled);
    private readonly AppDbContext _dbContext = dbContext;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AuthUserResponse>>> ListAsync(CancellationToken cancellationToken)
    {
        var users = await _dbContext.AuthUsers
            .AsNoTracking()
            .Include(x => x.Profile)
            .OrderBy(x => x.Email)
            .ToListAsync(cancellationToken);

        return Ok(users.Select(x => ToResponse(x, maskSensitiveData: true)).ToList());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AuthUserResponse>> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var user = await _dbContext.AuthUsers
            .AsNoTracking()
            .Include(x => x.Profile)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (user is null)
        {
            return NotFound();
        }

        return Ok(ToResponse(user, maskSensitiveData: false));
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

        var profileValidationErrors = ValidateProfileRequest(request.Profile, nameof(request.Profile));
        if (profileValidationErrors.Count > 0)
        {
            return BadRequest(new ValidationProblemDetails(profileValidationErrors));
        }

        var user = new AuthUser
        {
            Email = email,
            PasswordHash = PasswordHasher.HashPassword(request.Password),
            Role = role,
            IsActive = request.IsActive ?? true
        };

        user.Profile = MapProfileRequest(request.Profile, user.Id);
        _dbContext.AuthUsers.Add(user);
        AddAuditLog(user, "user_created", new
        {
            role = user.Role,
            isActive = user.IsActive,
            profile = BuildAuditProfileSnapshot(user.Profile)
        });

        await _dbContext.SaveChangesAsync(cancellationToken);
        return Created($"/api/auth/users/{user.Id}", ToResponse(user, maskSensitiveData: false));
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<AuthUserResponse>> UpdateAsync(Guid id, [FromBody] UpdateAuthUserRequest request, CancellationToken cancellationToken)
    {
        var user = await _dbContext.AuthUsers
            .Include(x => x.Profile)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (user is null)
        {
            return NotFound();
        }

        var changedFields = new Dictionary<string, object?>();

        if (request.Role is not null)
        {
            var role = NormalizeRole(request.Role);
            if (role is null)
            {
                return BadRequest(CreateValidationProblemDetails(nameof(request.Role), "Role is invalid."));
            }

            if (!string.Equals(user.Role, role, StringComparison.OrdinalIgnoreCase))
            {
                changedFields["role.from"] = user.Role;
                changedFields["role.to"] = role;
                user.Role = role;
            }
        }

        if (request.IsActive.HasValue && user.IsActive != request.IsActive.Value)
        {
            changedFields["isActive.from"] = user.IsActive;
            changedFields["isActive.to"] = request.IsActive.Value;
            user.IsActive = request.IsActive.Value;
        }

        if (request.Profile is not null)
        {
            var profileValidationErrors = ValidateProfileRequest(request.Profile, nameof(request.Profile));
            if (profileValidationErrors.Count > 0)
            {
                return BadRequest(new ValidationProblemDetails(profileValidationErrors));
            }

            var profile = user.Profile ?? new AuthUserProfile { AuthUserId = user.Id };
            profile.TenantId = user.TenantId;

            MapProfileIntoEntity(profile, request.Profile, changedFields);

            if (user.Profile is null)
            {
                user.Profile = profile;
                _dbContext.AuthUserProfiles.Add(profile);
            }
        }

        if (changedFields.Count > 0)
        {
            AddAuditLog(user, "user_updated", changedFields);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return Ok(ToResponse(user, maskSensitiveData: false));
    }

    [HttpPost("{id:guid}/reset-password")]
    public async Task<ActionResult<AuthUserResponse>> ResetPasswordAsync(Guid id, [FromBody] ResetAuthUserPasswordRequest request, CancellationToken cancellationToken)
    {
        var user = await _dbContext.AuthUsers
            .Include(x => x.Profile)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
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
        user.AccessFailedCount = 0;
        user.LockoutEndUtc = null;
        AddAuditLog(user, "password_reset", new { by = GetActor() });

        await _dbContext.SaveChangesAsync(cancellationToken);
        return Ok(ToResponse(user, maskSensitiveData: false));
    }

    private AuthUserProfile MapProfileRequest(UserProfileInputRequest profileRequest, Guid authUserId)
    {
        var profile = new AuthUserProfile
        {
            AuthUserId = authUserId
        };

        MapProfileIntoEntity(profile, profileRequest, new Dictionary<string, object?>());
        return profile;
    }

    private static void MapProfileIntoEntity(AuthUserProfile profile, UserProfileInputRequest source, IDictionary<string, object?> changedFields)
    {
        ApplyChange(profile.FullName, source.FullName.Trim(), "profile.fullName", changedFields, value => profile.FullName = value);
        ApplyChange(profile.DisplayName, NormalizeOptional(source.DisplayName), "profile.displayName", changedFields, value => profile.DisplayName = value);
        ApplyChange(profile.PhoneE164, NormalizePhone(source.PhoneE164), "profile.phoneE164", changedFields, value => profile.PhoneE164 = value);
        ApplyChange(profile.JobTitle, NormalizeOptional(source.JobTitle), "profile.jobTitle", changedFields, value => profile.JobTitle = value);
        ApplyChange(profile.Department, NormalizeOptional(source.Department), "profile.department", changedFields, value => profile.Department = value);
        ApplyChange(profile.EmployeeCode, NormalizeOptional(source.EmployeeCode), "profile.employeeCode", changedFields, value => profile.EmployeeCode = value);
        ApplyChange(profile.ManagerAuthUserId, source.ManagerAuthUserId, "profile.managerAuthUserId", changedFields, value => profile.ManagerAuthUserId = value);
        ApplyChange(profile.TimeZone, NormalizeOptional(source.TimeZone), "profile.timeZone", changedFields, value => profile.TimeZone = value);
        ApplyChange(profile.Locale, NormalizeOptional(source.Locale), "profile.locale", changedFields, value => profile.Locale = value);
        ApplyChange(profile.AvatarUrl, NormalizeOptional(source.AvatarUrl), "profile.avatarUrl", changedFields, value => profile.AvatarUrl = value);
        ApplyChange(profile.EmergencyContactName, NormalizeOptional(source.EmergencyContactName), "profile.emergencyContactName", changedFields, value => profile.EmergencyContactName = value);
        ApplyChange(profile.EmergencyContactPhoneE164, NormalizePhone(source.EmergencyContactPhoneE164), "profile.emergencyContactPhoneE164", changedFields, value => profile.EmergencyContactPhoneE164 = value);
        ApplyChange(profile.BirthDate, source.BirthDate, "profile.birthDate", changedFields, value => profile.BirthDate = value);
        ApplyChange(profile.HireDate, source.HireDate, "profile.hireDate", changedFields, value => profile.HireDate = value);
        ApplyChange(profile.MetadataJson, NormalizeMetadataJson(source.MetadataJson), "profile.metadataJson", changedFields, value => profile.MetadataJson = value);
    }

    private void AddAuditLog(AuthUser user, string eventType, object payload)
    {
        _dbContext.AuthUserAuditLogs.Add(new AuthUserAuditLog
        {
            AuthUserId = user.Id,
            EventType = eventType,
            ChangedBy = GetActor(),
            ChangedFieldsJson = JsonSerializer.Serialize(payload)
        });
    }

    private string GetActor()
    {
        return User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Email)
            ?? "unknown";
    }

    private static Dictionary<string, string[]> ValidateProfileRequest(UserProfileInputRequest request, string prefix)
    {
        var errors = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            errors[$"{prefix}.fullName"] = ["FullName is required."];
        }

        if (!string.IsNullOrWhiteSpace(request.PhoneE164) && NormalizePhone(request.PhoneE164) is null)
        {
            errors[$"{prefix}.phoneE164"] = ["PhoneE164 must be in E.164 format."];
        }

        if (!string.IsNullOrWhiteSpace(request.EmergencyContactPhoneE164) && NormalizePhone(request.EmergencyContactPhoneE164) is null)
        {
            errors[$"{prefix}.emergencyContactPhoneE164"] = ["EmergencyContactPhoneE164 must be in E.164 format."];
        }

        if (!string.IsNullOrWhiteSpace(request.Locale) && !LocaleRegex.IsMatch(request.Locale.Trim()))
        {
            errors[$"{prefix}.locale"] = ["Locale must use xx-YY pattern (e.g., pt-BR)."];
        }

        if (!string.IsNullOrWhiteSpace(request.TimeZone))
        {
            try
            {
                _ = TimeZoneInfo.FindSystemTimeZoneById(request.TimeZone.Trim());
            }
            catch
            {
                errors[$"{prefix}.timeZone"] = ["TimeZone is invalid."];
            }
        }

        if (!string.IsNullOrWhiteSpace(request.MetadataJson) && !IsValidJson(request.MetadataJson))
        {
            errors[$"{prefix}.metadataJson"] = ["MetadataJson must contain valid JSON."];
        }

        return errors;
    }

    private static bool IsValidJson(string value)
    {
        try
        {
            JsonDocument.Parse(value);
            return true;
        }
        catch
        {
            return false;
        }
    }

    private static void ApplyChange<T>(T current, T next, string fieldName, IDictionary<string, object?> changedFields, Action<T> assign)
    {
        if (EqualityComparer<T>.Default.Equals(current, next))
        {
            return;
        }

        changedFields[$"{fieldName}.from"] = current;
        changedFields[$"{fieldName}.to"] = next;
        assign(next);
    }

    private static string? NormalizeOptional(string? value)
    {
        var normalized = value?.Trim();
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }

    private static string NormalizeMetadataJson(string? metadataJson)
    {
        if (string.IsNullOrWhiteSpace(metadataJson))
        {
            return "{}";
        }

        return metadataJson.Trim();
    }

    private static string? NormalizePhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
        {
            return null;
        }

        var normalized = phone.Trim();
        if (!Regex.IsMatch(normalized, @"^\+[1-9]\d{7,14}$"))
        {
            return null;
        }

        return normalized;
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

    private static object BuildAuditProfileSnapshot(AuthUserProfile profile)
    {
        return new
        {
            profile.FullName,
            profile.DisplayName,
            profile.PhoneE164,
            profile.JobTitle,
            profile.Department,
            profile.EmployeeCode,
            profile.Locale,
            profile.TimeZone
        };
    }

    private static AuthUserResponse ToResponse(AuthUser user, bool maskSensitiveData)
    {
        var profile = user.Profile;
        return new AuthUserResponse(
            user.Id,
            user.Email,
            user.Role,
            user.IsActive,
            DateTime.SpecifyKind(user.CreatedAtUtc, DateTimeKind.Utc),
            user.UpdatedAtUtc.HasValue ? DateTime.SpecifyKind(user.UpdatedAtUtc.Value, DateTimeKind.Utc) : null,
            user.LastLoginAtUtc.HasValue ? DateTime.SpecifyKind(user.LastLoginAtUtc.Value, DateTimeKind.Utc) : null,
            profile is null
                ? null
                : new AuthUserProfileResponse(
                    profile.AuthUserId,
                    profile.FullName,
                    profile.DisplayName,
                    maskSensitiveData ? MaskPhone(profile.PhoneE164) : profile.PhoneE164,
                    profile.JobTitle,
                    profile.Department,
                    profile.EmployeeCode,
                    profile.ManagerAuthUserId,
                    profile.TimeZone,
                    profile.Locale,
                    profile.AvatarUrl,
                    profile.EmergencyContactName,
                    maskSensitiveData ? MaskPhone(profile.EmergencyContactPhoneE164) : profile.EmergencyContactPhoneE164,
                    profile.BirthDate,
                    profile.HireDate,
                    profile.MetadataJson));
    }

    private static string? MaskPhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone) || phone.Length < 4)
        {
            return phone;
        }

        var tail = phone[^4..];
        return $"***{tail}";
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

    [Required]
    public UserProfileInputRequest Profile { get; init; } = new();
}

public sealed class UpdateAuthUserRequest
{
    [MaxLength(64)]
    public string? Role { get; init; }

    public bool? IsActive { get; init; }
    public UserProfileInputRequest? Profile { get; init; }
}

public sealed class UserProfileInputRequest
{
    [Required, MaxLength(256)]
    public string FullName { get; init; } = string.Empty;

    [MaxLength(256)]
    public string? DisplayName { get; init; }

    [MaxLength(32)]
    public string? PhoneE164 { get; init; }

    [MaxLength(128)]
    public string? JobTitle { get; init; }

    [MaxLength(128)]
    public string? Department { get; init; }

    [MaxLength(64)]
    public string? EmployeeCode { get; init; }

    public Guid? ManagerAuthUserId { get; init; }

    [MaxLength(64)]
    public string? TimeZone { get; init; }

    [MaxLength(16)]
    public string? Locale { get; init; }

    [MaxLength(2048)]
    public string? AvatarUrl { get; init; }

    [MaxLength(256)]
    public string? EmergencyContactName { get; init; }

    [MaxLength(32)]
    public string? EmergencyContactPhoneE164 { get; init; }

    public DateTime? BirthDate { get; init; }
    public DateTime? HireDate { get; init; }

    [MaxLength(24000)]
    public string? MetadataJson { get; init; }
}

public sealed class ResetAuthUserPasswordRequest
{
    [Required, MaxLength(256)]
    public string Password { get; init; } = string.Empty;
}

public sealed record AuthUserProfileResponse(
    Guid AuthUserId,
    string FullName,
    string? DisplayName,
    string? PhoneE164,
    string? JobTitle,
    string? Department,
    string? EmployeeCode,
    Guid? ManagerAuthUserId,
    string? TimeZone,
    string? Locale,
    string? AvatarUrl,
    string? EmergencyContactName,
    string? EmergencyContactPhoneE164,
    DateTime? BirthDate,
    DateTime? HireDate,
    string MetadataJson);

public sealed record AuthUserResponse(
    Guid Id,
    string Email,
    string Role,
    bool IsActive,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    DateTime? LastLoginAtUtc,
    AuthUserProfileResponse? Profile);
