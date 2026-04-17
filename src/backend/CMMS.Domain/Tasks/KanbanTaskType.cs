namespace CMMS.Domain.Tasks;

public static class KanbanTaskType
{
    public const string Feature = "feature";
    public const string Bug = "bug";
    public const string Chore = "chore";
    public const string Hardening = "hardening";
    public const string Doc = "doc";
    public const string Test = "test";
    public const string DevOps = "devops";

    public static readonly HashSet<string> Allowed =
    [
        Feature,
        Bug,
        Chore,
        Hardening,
        Doc,
        Test,
        DevOps
    ];
}
