using CMMS.Shared.Tenancy;
using System.Security.Claims;

namespace CMMS.Api.Tenancy;

public sealed class HttpCurrentTenant(IHttpContextAccessor contextAccessor) : ICurrentTenant
{
    private readonly IHttpContextAccessor _contextAccessor = contextAccessor;

    public Guid? TenantId
    {
        get
        {
            var context = _contextAccessor.HttpContext;
            if (context?.Items.TryGetValue(TenantResolutionMiddleware.TenantIdItemKey, out var itemValue) == true && itemValue is Guid resolved)
            {
                return resolved;
            }

            var claimValue = context?.User.FindFirstValue("tenant_id");
            return Guid.TryParse(claimValue, out var fromClaim) ? fromClaim : null;
        }
    }

    public string? TenantCode => _contextAccessor.HttpContext?.Request.Headers[TenantResolutionMiddleware.TenantCodeHeader].ToString();

    public bool IsResolved => TenantId.HasValue;
}
