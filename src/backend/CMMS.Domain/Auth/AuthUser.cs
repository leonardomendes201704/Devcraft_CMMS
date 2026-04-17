using CMMS.Domain.Common;

namespace CMMS.Domain.Auth;

public sealed class AuthUser : AuditableTenantEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = AuthRoles.Technician;
    public bool IsActive { get; set; } = true;
}
