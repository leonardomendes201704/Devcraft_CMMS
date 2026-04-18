using CMMS.Domain.Common;

namespace CMMS.Domain.Auth;

public sealed class AuthJob : AuditableTenantEntity
{
    public Guid DepartmentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public AuthDepartment Department { get; set; } = null!;
    public ICollection<AuthUserProfile> UserProfiles { get; set; } = new List<AuthUserProfile>();
}
