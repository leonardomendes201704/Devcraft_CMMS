using CMMS.Domain.Common;

namespace CMMS.Domain.Auth;

public sealed class AuthDepartment : AuditableTenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<AuthJob> Jobs { get; set; } = new List<AuthJob>();
    public ICollection<AuthUserProfile> UserProfiles { get; set; } = new List<AuthUserProfile>();
}
