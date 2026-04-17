using CMMS.Domain.Common;

namespace CMMS.Domain.Auth;

public sealed class AuthUser : AuditableTenantEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = AuthRoles.Technician;
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAtUtc { get; set; }
    public int AccessFailedCount { get; set; }
    public DateTime? LockoutEndUtc { get; set; }
    public AuthUserProfile? Profile { get; set; }
    public ICollection<AuthUserAuditLog> AuditLogs { get; set; } = [];
}
