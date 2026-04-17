using CMMS.Domain.Common;

namespace CMMS.Domain.Auth;

public sealed class AuthUserAuditLog : AuditableTenantEntity
{
    public Guid AuthUserId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string? ChangedBy { get; set; }
    public string? ChangedFieldsJson { get; set; }

    public AuthUser AuthUser { get; set; } = null!;
}
