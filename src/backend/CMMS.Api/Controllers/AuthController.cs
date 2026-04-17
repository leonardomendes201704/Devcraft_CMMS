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

        if (user is null || !PasswordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
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
