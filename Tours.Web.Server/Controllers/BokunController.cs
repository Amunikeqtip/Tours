using Microsoft.AspNetCore.Mvc;
using Tours.Web.Server.Services;

namespace Tours.Web.Server.Controllers;

[ApiController]
[Route("api/bokun")]
public class BokunController : ControllerBase
{
    private readonly IBokunClient _bokunClient;
    private readonly ILogger<BokunController> _logger;

    public BokunController(IBokunClient bokunClient, ILogger<BokunController> logger)
    {
        _bokunClient = bokunClient;
        _logger = logger;
    }

    [HttpGet("packages")]
    public async Task<ActionResult<IReadOnlyList<BokunPackageSummary>>> GetPackages(
        [FromQuery] string? q = null,
        [FromQuery] string? category = null,
        [FromQuery] int page = 0,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var items = await _bokunClient.GetPackagesAsync(page, pageSize, cancellationToken);

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToLowerInvariant();
                items = items.Where(x =>
                        x.Title.ToLowerInvariant().Contains(term) ||
                        x.Summary.ToLowerInvariant().Contains(term) ||
                        x.Category.ToLowerInvariant().Contains(term))
                    .ToArray();
            }

            if (!string.IsNullOrWhiteSpace(category))
            {
                var expected = category.Trim();
                items = items.Where(x => string.Equals(x.Category, expected, StringComparison.OrdinalIgnoreCase)).ToArray();
            }

            return Ok(items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch Bokun packages.");
            return Problem(
                title: "Bokun packages request failed",
                detail: ex.Message,
                statusCode: StatusCodes.Status502BadGateway);
        }
    }
}
