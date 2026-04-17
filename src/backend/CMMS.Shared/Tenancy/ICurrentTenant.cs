namespace CMMS.Shared.Tenancy;

public interface ICurrentTenant
{
    Guid? TenantId { get; }
    string? TenantCode { get; }
    bool IsResolved { get; }
}
