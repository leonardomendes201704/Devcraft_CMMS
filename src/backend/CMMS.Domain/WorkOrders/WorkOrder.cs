using CMMS.Domain.Common;

namespace CMMS.Domain.WorkOrders;

public sealed class WorkOrder : AuditableTenantEntity
{
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = "Open";
    public DateTime? DueDateUtc { get; set; }
}
