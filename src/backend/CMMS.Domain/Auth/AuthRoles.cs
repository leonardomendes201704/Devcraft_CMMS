namespace CMMS.Domain.Auth;

public static class AuthRoles
{
    public const string AdminMaster = "admin_master";
    public const string Admin = "admin";
    public const string Technician = "technician";

    public static readonly IReadOnlySet<string> Allowed =
        new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            AdminMaster,
            Admin,
            Technician
        };
}
