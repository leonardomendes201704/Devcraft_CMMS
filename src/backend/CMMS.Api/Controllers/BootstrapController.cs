using CMMS.Shared.Tenancy;
using Microsoft.AspNetCore.Mvc;

namespace CMMS.Api.Controllers;

[ApiController]
[Route("api/bootstrap")]
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
