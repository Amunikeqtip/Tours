using System.Globalization;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Tours.Web.Server.Options;

namespace Tours.Web.Server.Services;

public interface IBokunClient
{
    Task<IReadOnlyList<BokunPackageSummary>> GetPackagesAsync(int page, int pageSize, CancellationToken cancellationToken = default);
}

public sealed record BokunPackageSummary(
    string Id,
    string Title,
    string Category,
    string Duration,
    decimal PriceFrom,
    decimal Rating,
    string ImageUrl,
    string Summary
);

public sealed class BokunClient : IBokunClient
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly HttpClient _httpClient;
    private readonly BokunOptions _options;
    private readonly ILogger<BokunClient> _logger;

    public BokunClient(HttpClient httpClient, IOptions<BokunOptions> options, ILogger<BokunClient> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<IReadOnlyList<BokunPackageSummary>> GetPackagesAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        EnsureConfigured();

        var path = "/activity.json/search";
        var body = JsonSerializer.Serialize(new
        {
            page = Math.Max(0, page),
            pageSize = Math.Clamp(pageSize, 1, 100)
        }, JsonOptions);

        using var request = CreateSignedRequest(HttpMethod.Post, path, body);
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("Bokun request failed. Status: {Status}. Body: {Body}", (int)response.StatusCode, responseContent);
            var message = responseContent;
            if (message.Length > 600)
            {
                message = $"{message[..600]}...";
            }
            throw new InvalidOperationException($"Bokun returned {(int)response.StatusCode}: {response.ReasonPhrase}. Body: {message}");
        }

        using var doc = JsonDocument.Parse(responseContent);
        return ParsePackages(doc.RootElement);
    }

    private HttpRequestMessage CreateSignedRequest(HttpMethod method, string relativePath, string? jsonBody = null)
    {
        var baseUrl = _options.BaseUrl.TrimEnd('/');
        var requestUri = new Uri($"{baseUrl}{relativePath}");
        var dateHeader = DateTimeOffset.UtcNow.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture);
        var pathToSign = requestUri.PathAndQuery;
        var signature = CreateSignature(dateHeader, _options.AccessKey, method.Method, pathToSign, _options.SecretKey);

        var request = new HttpRequestMessage(method, requestUri);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        request.Headers.Add("X-Bokun-Date", dateHeader);
        request.Headers.Add("X-Bokun-AccessKey", _options.AccessKey);
        request.Headers.Add("X-Bokun-Signature", signature);

        if (!string.IsNullOrWhiteSpace(_options.OctoToken))
        {
            request.Headers.Add("X-Octo-Token", _options.OctoToken);
        }

        if (!string.IsNullOrWhiteSpace(jsonBody))
        {
            request.Content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
        }

        return request;
    }

    private static string CreateSignature(string date, string accessKey, string httpMethod, string pathAndQuery, string secretKey)
    {
        var text = $"{date}{accessKey}{httpMethod.ToUpperInvariant()}{pathAndQuery}";
        using var hmac = new HMACSHA1(Encoding.UTF8.GetBytes(secretKey));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(text));
        return Convert.ToBase64String(hash);
    }

    private void EnsureConfigured()
    {
        if (string.IsNullOrWhiteSpace(_options.BaseUrl) ||
            string.IsNullOrWhiteSpace(_options.AccessKey) ||
            string.IsNullOrWhiteSpace(_options.SecretKey))
        {
            throw new InvalidOperationException("Bokun configuration is missing. Set Bokun:BaseUrl, Bokun:AccessKey, Bokun:SecretKey.");
        }
    }

    private static IReadOnlyList<BokunPackageSummary> ParsePackages(JsonElement root)
    {
        var items = TryGetItemsArray(root);
        if (items.ValueKind != JsonValueKind.Array)
        {
            return Array.Empty<BokunPackageSummary>();
        }

        var list = new List<BokunPackageSummary>();
        foreach (var item in items.EnumerateArray())
        {
            var id = GetString(item, "id", "activityId", "productId");
            var title = GetString(item, "title", "name");
            if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(title))
            {
                continue;
            }

            var category = GetNestedString(item, "category", "name") ??
                           GetNestedString(item, "activityCategory", "name") ??
                           GetString(item, "category") ??
                           "Uncategorized";

            var duration = GetString(item, "duration", "durationType") ?? string.Empty;
            var price = GetDecimal(item, "priceFrom", "adultPrice", "price");
            var rating = GetDecimal(item, "rating", "averageRating");
            var image = GetString(item, "coverImageUrl", "imageUrl") ??
                        GetNestedString(item, "images", "0", "url") ??
                        string.Empty;
            var summary = GetString(item, "shortDescription", "description", "excerpt") ?? string.Empty;

            list.Add(new BokunPackageSummary(
                Id: id,
                Title: title,
                Category: category,
                Duration: duration,
                PriceFrom: price,
                Rating: rating,
                ImageUrl: image,
                Summary: summary
            ));
        }

        return list;
    }

    private static JsonElement TryGetItemsArray(JsonElement root)
    {
        if (root.ValueKind == JsonValueKind.Array)
        {
            return root;
        }

        if (root.ValueKind == JsonValueKind.Object)
        {
            if (root.TryGetProperty("items", out var items) && items.ValueKind == JsonValueKind.Array)
            {
                return items;
            }
            if (root.TryGetProperty("activities", out var activities) && activities.ValueKind == JsonValueKind.Array)
            {
                return activities;
            }
            if (root.TryGetProperty("results", out var results) && results.ValueKind == JsonValueKind.Array)
            {
                return results;
            }
        }

        return default;
    }

    private static string? GetString(JsonElement item, params string[] names)
    {
        foreach (var name in names)
        {
            if (item.ValueKind == JsonValueKind.Object &&
                item.TryGetProperty(name, out var value) &&
                value.ValueKind == JsonValueKind.String)
            {
                return value.GetString();
            }
        }
        return null;
    }

    private static decimal GetDecimal(JsonElement item, params string[] names)
    {
        foreach (var name in names)
        {
            if (item.ValueKind != JsonValueKind.Object || !item.TryGetProperty(name, out var value))
            {
                continue;
            }

            if (value.ValueKind == JsonValueKind.Number && value.TryGetDecimal(out var numeric))
            {
                return numeric;
            }

            if (value.ValueKind == JsonValueKind.String &&
                decimal.TryParse(value.GetString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var parsed))
            {
                return parsed;
            }
        }
        return 0m;
    }

    private static string? GetNestedString(JsonElement item, params string[] segments)
    {
        JsonElement current = item;
        foreach (var segment in segments)
        {
            if (current.ValueKind == JsonValueKind.Array && int.TryParse(segment, out var index))
            {
                if (index < 0 || index >= current.GetArrayLength())
                {
                    return null;
                }
                current = current[index];
                continue;
            }

            if (current.ValueKind != JsonValueKind.Object || !current.TryGetProperty(segment, out var property))
            {
                return null;
            }
            current = property;
        }

        return current.ValueKind == JsonValueKind.String ? current.GetString() : null;
    }
}
