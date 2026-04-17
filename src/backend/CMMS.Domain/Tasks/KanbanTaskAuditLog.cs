using CMMS.Domain.Common;

namespace CMMS.Domain.Tasks;

public sealed class KanbanTaskAuditLog : AuditableTenantEntity
{
    public Guid KanbanTaskId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string? FromStatus { get; set; }
    public string? ToStatus { get; set; }
    public decimal? FromSpentHours { get; set; }
    public decimal? ToSpentHours { get; set; }
    public decimal? TotalSpentHoursAtClose { get; set; }
    public decimal? TotalLeadTimeHoursAtClose { get; set; }

    public KanbanTask? KanbanTask { get; set; }
}
