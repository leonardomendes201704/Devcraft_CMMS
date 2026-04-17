using CMMS.Shared.Tenancy;
using CMMS.Domain.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CMMS.Api.Controllers;

[ApiController]
[Route("api/bootstrap")]
[Authorize(Policy = AuthorizationPolicies.AdminMasterOnly)]
public sealed class BootstrapController(ICurrentTenant currentTenant) : ControllerBase
{
    private readonly ICurrentTenant _currentTenant = currentTenant;

    [HttpGet("tenant")]
    public IActionResult GetTenantContext()
    {
        return Ok(new
        {
            tenantId = _currentTenant.TenantId,
            tenantCode = _currentTenant.TenantCode,
            isResolved = _currentTenant.IsResolved,
            utcNow = DateTime.UtcNow
        });
    }
}
