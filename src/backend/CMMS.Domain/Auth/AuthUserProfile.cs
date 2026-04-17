using CMMS.Domain.Common;

namespace CMMS.Domain.Auth;

public sealed class AuthUserProfile : AuditableTenantEntity
{
    public Guid AuthUserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? PhoneE164 { get; set; }
    public string? JobTitle { get; set; }
    public string? Department { get; set; }
    public string? EmployeeCode { get; set; }
    public Guid? ManagerAuthUserId { get; set; }
    public string? TimeZone { get; set; }
    public string? Locale { get; set; }
    public string? AvatarUrl { get; set; }
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhoneE164 { get; set; }
    public DateTime? BirthDate { get; set; }
    public DateTime? HireDate { get; set; }
    public string MetadataJson { get; set; } = "{}";

    public AuthUser AuthUser { get; set; } = null!;
}
