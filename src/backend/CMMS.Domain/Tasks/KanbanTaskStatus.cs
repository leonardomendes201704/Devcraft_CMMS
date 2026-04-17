namespace CMMS.Domain.Tasks;

public static class KanbanTaskStatus
{
    public const string New = "new";
    public const string Active = "active";
    public const string Resolved = "resolved";
    public const string Closed = "closed";

    public static readonly HashSet<string> Allowed =
    [
        New,
        Active,
        Resolved,
        Closed
    ];
}
