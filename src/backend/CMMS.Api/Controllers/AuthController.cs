using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using CMMS.Domain.Auth;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CMMS.Api.Controllers;

[ApiController]
[Route("api/auth")]
[AllowAnonymous]
public sealed class AuthController(IConfiguration configuration) : ControllerBase
{
    private readonly IConfiguration _configuration = configuration;

    [HttpPost("login")]
    public ActionResult<LoginResponse> Login([FromBody] LoginRequest request)
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

        if (!string.Equals(request.Email?.Trim(), configuredEmail, StringComparison.OrdinalIgnoreCase) ||
            !string.Equals(request.Password, configuredPassword, StringComparison.Ordinal))
        {
            return Unauthorized(new
            {
                error = "invalid_credentials",
                message = "Invalid email or password."
            });
        }

        var issuer = _configuration["Jwt:Issuer"] ?? "Devcraft.CMMS";
        var audience = _configuration["Jwt:Audience"] ?? "Devcraft.CMMS.Web";
        var key = _configuration["Jwt:Key"] ?? "change-this-key-in-real-environments-32-chars-min";
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
        var tenantId = HttpContext.Items.TryGetValue("TenantId", out var tenantObj) && tenantObj is Guid tenant
            ? tenant
            : Guid.Empty;

        var nowUtc = DateTime.UtcNow;
        var expiresUtc = nowUtc.AddHours(8);
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, configuredEmail),
            new(JwtRegisteredClaimNames.Email, configuredEmail),
            new(ClaimTypes.Email, configuredEmail),
            new(ClaimTypes.Role, AuthRoles.AdminMaster),
            new("role", AuthRoles.AdminMaster),
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
            new LoginUserResponse(configuredEmail, AuthRoles.AdminMaster, tenantId)));
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
