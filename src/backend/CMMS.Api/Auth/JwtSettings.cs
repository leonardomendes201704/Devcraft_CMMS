namespace CMMS.Api.Auth;

public sealed class JwtSettings
{
    public string Issuer { get; init; } = "Devcraft.CMMS";
    public string Audience { get; init; } = "Devcraft.CMMS.Web";
    public string Key { get; init; } = string.Empty;
    public int AccessTokenLifetimeHours { get; init; } = 8;
    public int ClockSkewMinutes { get; init; } = 1;
}
