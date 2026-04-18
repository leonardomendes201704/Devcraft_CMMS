using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CMMS.Api.Auth;
using CMMS.Infrastructure.Persistence;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using CMMS.Domain.Auth;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CMMS.Api.Controllers;

[ApiController]
[Route("api/auth")]
[AllowAnonymous]
public sealed class AuthController(IConfiguration configuration, AppDbContext dbContext) : ControllerBase
{
    private readonly IConfiguration _configuration = configuration;
    private readonly AppDbContext _dbContext = dbContext;

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var configuredEmail = _configuration["Auth:MasterAdminEmail"] ?? "admin@cmms.local";
        var configuredPassword = _configuration["Auth:MasterAdminPassword"] ?? "Naotemsenha0(";
        var passwordValidation = CredentialPolicy.ValidatePassword(configuredPassword);
        if (!passwordValidation.IsValid)
        {
            return Problem(
                statusCode: StatusCodes.Status500InternalServerError,
                title: "invalid_auth_configuration",
                detail: passwordValidation.Error);
        }

        var tenantId = HttpContext.Items.TryGetValue("TenantId", out var tenantObj) && tenantObj is Guid tenant
            ? tenant
            : Guid.Empty;
        if (tenantId == Guid.Empty)
        {
            return Unauthorized(new
            {
                error = "tenant_not_resolved",
                message = "Tenant header is required."
            });
        }

        var normalizedEmail = request.Email?.Trim().ToLowerInvariant() ?? string.Empty;
        var user = await _dbContext.AuthUsers.FirstOrDefaultAsync(x => x.Email == normalizedEmail, cancellationToken);

        // Bootstrap fallback: first login with configured master credentials creates the tenant admin user.
        if (user is null &&
            string.Equals(normalizedEmail, configuredEmail.Trim().ToLowerInvariant(), StringComparison.OrdinalIgnoreCase) &&
            string.Equals(request.Password, configuredPassword, StringComparison.Ordinal))
        {
            user = new AuthUser
            {
                Email = normalizedEmail,
                PasswordHash = PasswordHasher.HashPassword(configuredPassword),
                Role = AuthRoles.AdminMaster,
                IsActive = true
            };
            user.Profile = new AuthUserProfile
            {
                FullName = "Master Admin",
                DisplayName = "Admin",
                Locale = "pt-BR",
                TimeZone = "America/Sao_Paulo"
            };

            _dbContext.AuthUsers.Add(user);
            try
            {
                await _dbContext.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateException)
            {
                // Concurrent bootstrap login can race on unique email index.
                user = await _dbContext.AuthUsers.FirstOrDefaultAsync(x => x.Email == normalizedEmail, cancellationToken);
            }
        }

        if (user is null)
        {
            return Unauthorized(new
            {
                error = "invalid_credentials",
                message = "Invalid email or password."
            });
        }

        if (user.LockoutEndUtc.HasValue && user.LockoutEndUtc.Value > DateTime.UtcNow)
        {
            return Unauthorized(new
            {
                error = "user_locked",
                message = "User is temporarily locked due to failed login attempts."
            });
        }

        if (!PasswordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            user.AccessFailedCount += 1;
            if (user.AccessFailedCount >= 5)
            {
                user.LockoutEndUtc = DateTime.UtcNow.AddMinutes(15);
                user.AccessFailedCount = 0;
            }

            await _dbContext.SaveChangesAsync(cancellationToken);
            return Unauthorized(new
            {
                error = "invalid_credentials",
                message = "Invalid email or password."
            });
        }

        if (!user.IsActive)
        {
            return Unauthorized(new
            {
                error = "user_inactive",
                message = "User is inactive."
            });
        }

        await EnsureTenantCatalogSeedAsync(tenantId, cancellationToken);

        user.LastLoginAtUtc = DateTime.UtcNow;
        user.AccessFailedCount = 0;
        user.LockoutEndUtc = null;
        await _dbContext.SaveChangesAsync(cancellationToken);

        var settings = _configuration.GetSection("Jwt").Get<JwtSettings>() ?? new JwtSettings();
        var issuer = string.IsNullOrWhiteSpace(settings.Issuer) ? "Devcraft.CMMS" : settings.Issuer.Trim();
        var audience = string.IsNullOrWhiteSpace(settings.Audience) ? "Devcraft.CMMS.Web" : settings.Audience.Trim();
        var key = settings.Key;
        var tokenLifetimeHours = Math.Max(1, settings.AccessTokenLifetimeHours);
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var nowUtc = DateTime.UtcNow;
        var expiresUtc = nowUtc.AddHours(tokenLifetimeHours);
        var tokenId = Guid.NewGuid().ToString("N");
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Email),
            new(JwtRegisteredClaimNames.Jti, tokenId),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.NameIdentifier, user.Email),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role),
            new("role", user.Role),
            new("tenant_id", tenantId.ToString())
        };

        var tokenDescriptor = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: nowUtc,
            expires: expiresUtc,
            signingCredentials: credentials);

        var tokenHandler = new JwtSecurityTokenHandler();
        var accessToken = tokenHandler.WriteToken(tokenDescriptor);

        return Ok(new LoginResponse(
            accessToken,
            "Bearer",
            expiresUtc,
            new LoginUserResponse(user.Email, user.Role, tenantId)));
    }

    private async Task EnsureTenantCatalogSeedAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        var hasDepartments = await _dbContext.AuthDepartments.AnyAsync(cancellationToken);
        if (hasDepartments)
        {
            return;
        }

        var utcNow = DateTime.UtcNow;
        var departments = new[]
        {
            new AuthDepartment { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Maintenance", Code = "MAINT", Description = "Maintenance operations and planning", IsActive = true, CreatedAtUtc = utcNow },
            new AuthDepartment { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Operations", Code = "OPS", Description = "Production operations and reliability", IsActive = true, CreatedAtUtc = utcNow },
            new AuthDepartment { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Quality", Code = "QUAL", Description = "Quality assurance and compliance", IsActive = true, CreatedAtUtc = utcNow },
            new AuthDepartment { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Safety", Code = "HSE", Description = "Safety and environmental governance", IsActive = true, CreatedAtUtc = utcNow },
            new AuthDepartment { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Facilities", Code = "FAC", Description = "Building and utilities management", IsActive = true, CreatedAtUtc = utcNow }
        };

        var jobs = new[]
        {
            new AuthJob { Id = Guid.NewGuid(), TenantId = tenantId, DepartmentId = departments[0].Id, Name = "Maintenance Technician", Code = "TECH_MAINT", Description = "Executes preventive and corrective maintenance", IsActive = true, CreatedAtUtc = utcNow },
            new AuthJob { Id = Guid.NewGuid(), TenantId = tenantId, DepartmentId = departments[0].Id, Name = "Maintenance Supervisor", Code = "SUP_MAINT", Description = "Coordinates maintenance teams and priorities", IsActive = true, CreatedAtUtc = utcNow },
            new AuthJob { Id = Guid.NewGuid(), TenantId = tenantId, DepartmentId = departments[1].Id, Name = "Operations Analyst", Code = "ANL_OPS", Description = "Monitors performance and operational KPIs", IsActive = true, CreatedAtUtc = utcNow },
            new AuthJob { Id = Guid.NewGuid(), TenantId = tenantId, DepartmentId = departments[2].Id, Name = "Quality Inspector", Code = "INSP_QUAL", Description = "Performs audits and quality checks", IsActive = true, CreatedAtUtc = utcNow },
            new AuthJob { Id = Guid.NewGuid(), TenantId = tenantId, DepartmentId = departments[3].Id, Name = "Safety Engineer", Code = "ENG_HSE", Description = "Leads risk assessment and safety controls", IsActive = true, CreatedAtUtc = utcNow },
            new AuthJob { Id = Guid.NewGuid(), TenantId = tenantId, DepartmentId = departments[4].Id, Name = "Facilities Coordinator", Code = "COORD_FAC", Description = "Coordinates assets and facility routines", IsActive = true, CreatedAtUtc = utcNow }
        };

        _dbContext.AuthDepartments.AddRange(departments);
        _dbContext.AuthJobs.AddRange(jobs);

        try
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            // Concurrent first-login requests can race on unique code indexes.
        }
    }
}

public sealed class LoginRequest
{
    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; init; } = string.Empty;

    [Required, MaxLength(256)]
    public string Password { get; init; } = string.Empty;
}

public sealed record LoginUserResponse(
    string Email,
    string Role,
    Guid TenantId);

public sealed record LoginResponse(
    string AccessToken,
    string TokenType,
    DateTime ExpiresAtUtc,
    LoginUserResponse User);
