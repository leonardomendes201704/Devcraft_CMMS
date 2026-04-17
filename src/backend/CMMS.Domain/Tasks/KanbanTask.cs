using CMMS.Domain.Common;

namespace CMMS.Domain.Tasks;

public sealed class KanbanTask : AuditableTenantEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = KanbanTaskType.Feature;
    public string Module { get; set; } = "General";
    public string Assignee { get; set; } = "Unassigned";
    public decimal EstimateHours { get; set; }
    public decimal SpentHours { get; set; }
    public string Status { get; set; } = KanbanTaskStatus.New;
    public DateTime? ClosedAtUtc { get; set; }
    public decimal? TotalSpentHoursOnClose { get; set; }
    public decimal? TotalLeadTimeHoursOnClose { get; set; }

    public ICollection<KanbanTaskAuditLog> AuditLogs { get; set; } = new List<KanbanTaskAuditLog>();
}
