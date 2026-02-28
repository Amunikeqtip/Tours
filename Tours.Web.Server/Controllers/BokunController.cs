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
        catch (BokunApiException ex)
        {
            _logger.LogError(ex, "Bokun API error while fetching packages.");
            return Problem(
                title: "Bokun packages request failed",
                detail: ex.Details,
                statusCode: ex.StatusCode >= 400 && ex.StatusCode < 600 ? ex.StatusCode : StatusCodes.Status502BadGateway);
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

    [HttpGet("packages/{id}")]
    public async Task<ActionResult<BokunPackageDetails>> GetPackageDetails(
        [FromRoute] string id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var item = await _bokunClient.GetPackageDetailsAsync(id, cancellationToken);
            if (item is null)
            {
                return NotFound();
            }
            return Ok(item);
        }
        catch (BokunApiException ex)
        {
            _logger.LogError(ex, "Bokun API error while fetching package details for {PackageId}.", id);
            return Problem(
                title: "Bokun package details request failed",
                detail: ex.Details,
                statusCode: ex.StatusCode >= 400 && ex.StatusCode < 600 ? ex.StatusCode : StatusCodes.Status502BadGateway);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch Bokun package details for {PackageId}.", id);
            return Problem(
                title: "Bokun package details request failed",
                detail: ex.Message,
                statusCode: StatusCodes.Status502BadGateway);
        }
    }

    [HttpGet("packages/{id}/availability")]
    public async Task<ActionResult<BokunPackageAvailabilityResponse>> GetPackageAvailability(
        [FromRoute] string id,
        [FromQuery] DateOnly? start = null,
        [FromQuery] DateOnly? end = null,
        [FromQuery] string currency = "USD",
        [FromQuery] bool includeSoldOut = false,
        CancellationToken cancellationToken = default)
    {
        var startDate = start ?? DateOnly.FromDateTime(DateTime.UtcNow.Date);
        var endDate = end ?? startDate.AddDays(60);
        if (endDate < startDate)
        {
            return BadRequest(new { message = "end date must be greater than or equal to start date." });
        }

        try
        {
            var result = await _bokunClient.GetPackageAvailabilityAsync(id, startDate, endDate, currency, includeSoldOut, cancellationToken);
            if (result is null)
            {
                return NotFound();
            }
            return Ok(result);
        }
        catch (BokunApiException ex)
        {
            _logger.LogError(ex, "Bokun API error while fetching availability for package {PackageId}.", id);
            return Problem(
                title: "Bokun availability request failed",
                detail: ex.Details,
                statusCode: ex.StatusCode >= 400 && ex.StatusCode < 600 ? ex.StatusCode : StatusCodes.Status502BadGateway);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch availability for package {PackageId}.", id);
            return Problem(
                title: "Bokun availability request failed",
                detail: ex.Message,
                statusCode: StatusCodes.Status502BadGateway);
        }
    }

    [HttpPost("checkout/options")]
    public async Task<ActionResult<BokunCheckoutOptionsResponse>> GetCheckoutOptions(
        [FromBody] BokunCheckoutSelectionRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await _bokunClient.GetCheckoutOptionsAsync(request, cancellationToken);
            return Ok(result);
        }
        catch (BokunApiException ex)
        {
            _logger.LogError(ex, "Bokun API error while fetching checkout options.");
            return Problem(
                title: "Bokun checkout options request failed",
                detail: ex.Details,
                statusCode: ex.StatusCode >= 400 && ex.StatusCode < 600 ? ex.StatusCode : StatusCodes.Status502BadGateway);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch Bokun checkout options.");
            return Problem(
                title: "Bokun checkout options request failed",
                detail: ex.Message,
                statusCode: StatusCodes.Status502BadGateway);
        }
    }

    [HttpPost("checkout/submit")]
    public async Task<ActionResult<BokunCheckoutSubmitResponse>> SubmitCheckout(
        [FromBody] BokunCheckoutSubmitRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await _bokunClient.SubmitCheckoutAsync(request, cancellationToken);
            return Ok(result);
        }
        catch (BokunApiException ex)
        {
            _logger.LogError(ex, "Bokun API error while submitting checkout.");
            return Problem(
                title: "Bokun checkout submit failed",
                detail: ex.Details,
                statusCode: ex.StatusCode >= 400 && ex.StatusCode < 600 ? ex.StatusCode : StatusCodes.Status502BadGateway);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to submit Bokun checkout.");
            return Problem(
                title: "Bokun checkout submit failed",
                detail: ex.Message,
                statusCode: StatusCodes.Status502BadGateway);
        }
    }
}
