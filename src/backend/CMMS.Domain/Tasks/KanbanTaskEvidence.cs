namespace CMMS.Domain.Tasks;

public sealed class KanbanTaskEvidence
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public DateTime CapturedAtUtc { get; set; }
    public string Source { get; set; } = "manual";
}
