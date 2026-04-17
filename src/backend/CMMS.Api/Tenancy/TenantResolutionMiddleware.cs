namespace CMMS.Api.Tenancy;

public sealed class TenantResolutionMiddleware(RequestDelegate next, ILogger<TenantResolutionMiddleware> logger)
{
    public const string TenantCodeHeader = "X-Tenant-Code";
    public const string TenantIdHeader = "X-Tenant-Id";
    public const string TenantIdItemKey = "TenantId";

    private readonly RequestDelegate _next = next;
    private readonly ILogger<TenantResolutionMiddleware> _logger = logger;

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path.StartsWithSegments("/health") ||
            context.Request.Path.StartsWithSegments("/swagger"))
        {
            await _next(context);
            return;
        }

        var tenantIdHeader = context.Request.Headers[TenantIdHeader].ToString();
        if (!Guid.TryParse(tenantIdHeader, out var tenantId))
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new
            {
                error = "tenant_resolution_failed",
                message = $"Header {TenantIdHeader} is required and must be a valid GUID."
            });
            return;
        }

        context.Items[TenantIdItemKey] = tenantId;
        using (_logger.BeginScope(new Dictionary<string, object?>
        {
            ["TenantId"] = tenantId,
            ["TenantCode"] = context.Request.Headers[TenantCodeHeader].ToString()
        }))
        {
            await _next(context);
        }
    }
}
