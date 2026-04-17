namespace CMMS.Domain.Project;

public sealed class ProjectChangelogEntry
{
    public Guid Id { get; set; }
    public string Version { get; set; } = string.Empty;
    public DateTime ReleaseDateUtc { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Source { get; set; } = "file";
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
