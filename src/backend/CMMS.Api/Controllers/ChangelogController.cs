using CMMS.Infrastructure.Persistence;
using CMMS.Domain.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMMS.Api.Controllers;

[ApiController]
[Route("api/changelog")]
[Authorize(Policy = AuthorizationPolicies.AdminMasterOnly)]
public sealed class ChangelogController(AppDbContext dbContext) : ControllerBase
{
    private readonly AppDbContext _dbContext = dbContext;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProjectChangelogReleaseResponse>>> ListAsync(CancellationToken cancellationToken)
    {
        var entries = await _dbContext.ProjectChangelogEntries
            .AsNoTracking()
            .OrderByDescending(x => x.ReleaseDateUtc)
            .ThenBy(x => x.Version)
            .ThenBy(x => x.Category)
            .ThenBy(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        var releases = entries
            .GroupBy(x => new { x.Version, Day = x.ReleaseDateUtc.Date })
            .Select(releaseGroup =>
            {
                var sections = releaseGroup
                    .GroupBy(x => x.Category)
                    .Select(section => new ProjectChangelogSectionResponse(
                        section.Key,
                        section.Select(item => new ProjectChangelogItemResponse(
                            item.Id,
                            item.Description,
                            item.Source,
                            DateTime.SpecifyKind(item.CreatedAtUtc, DateTimeKind.Utc)))
                            .ToList()))
                    .ToList();

                return new ProjectChangelogReleaseResponse(
                    releaseGroup.Key.Version,
                    DateOnly.FromDateTime(releaseGroup.Key.Day).ToString("yyyy-MM-dd"),
                    sections);
            })
            .OrderByDescending(x => x.ReleaseDate)
            .ToList();

        return Ok(releases);
    }
}

public sealed record ProjectChangelogItemResponse(
    Guid Id,
    string Description,
    string Source,
    DateTime CreatedAtUtc);

public sealed record ProjectChangelogSectionResponse(
    string Category,
    IReadOnlyList<ProjectChangelogItemResponse> Items);

public sealed record ProjectChangelogReleaseResponse(
    string Version,
    string ReleaseDate,
    IReadOnlyList<ProjectChangelogSectionResponse> Sections);
