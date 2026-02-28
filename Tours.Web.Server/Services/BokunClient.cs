using System.Globalization;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Options;
using Tours.Web.Server.Options;

namespace Tours.Web.Server.Services;

public interface IBokunClient
{
    Task<IReadOnlyList<BokunPackageSummary>> GetPackagesAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<BokunPackageDetails?> GetPackageDetailsAsync(string id, CancellationToken cancellationToken = default);
    Task<BokunPackageAvailabilityResponse?> GetPackageAvailabilityAsync(
        string id,
        DateOnly startDate,
        DateOnly endDate,
        string currency,
        bool includeSoldOut,
        CancellationToken cancellationToken = default);
    Task<BokunCheckoutOptionsResponse> GetCheckoutOptionsAsync(BokunCheckoutSelectionRequest request, CancellationToken cancellationToken = default);
    Task<BokunCheckoutSubmitResponse> SubmitCheckoutAsync(BokunCheckoutSubmitRequest request, CancellationToken cancellationToken = default);
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

public sealed record BokunPackageDetails(
    string Id,
    string Title,
    string Category,
    string Duration,
    decimal PriceFrom,
    decimal Rating,
    int ReviewCount,
    string Difficulty,
    string Location,
    string Summary,
    string Description,
    string Included,
    string Requirements,
    string Attention,
    string CancellationPolicy,
    IReadOnlyList<string> Highlights,
    IReadOnlyList<string> Includes,
    IReadOnlyList<BokunItineraryStop> Itinerary,
    IReadOnlyList<string> Gallery
);

public sealed record BokunItineraryStop(string Time, string Title, string Detail);

public sealed record BokunPackageAvailabilityResponse(
    string PackageId,
    string Currency,
    long DefaultRateId,
    IReadOnlyList<BokunPricingCategory> PricingCategories,
    IReadOnlyList<BokunAvailabilitySlot> Slots
);

public sealed record BokunPricingCategory(long Id, string Title, string CategoryType, bool IsDefault);

public sealed record BokunAvailabilitySlot(
    string Date,
    string StartTime,
    long StartTimeId,
    long RateId,
    int AvailabilityCount,
    bool SoldOut,
    IReadOnlyList<BokunCategoryPrice> PricesByCategory
);

public sealed record BokunCategoryPrice(long PricingCategoryId, decimal Amount);

public sealed record BokunCheckoutSelectionRequest(
    string PackageId,
    string Date,
    long StartTimeId,
    long? RateId,
    string Currency,
    IReadOnlyList<BokunPassengerSelection> Passengers
);

public sealed record BokunPassengerSelection(long PricingCategoryId, int Quantity);

public sealed record BokunCheckoutOptionsResponse(
    IReadOnlyList<BokunCheckoutOption> Options,
    IReadOnlyList<BokunQuestion> MainContactQuestions
);

public sealed record BokunCheckoutOption(
    string Type,
    string Label,
    decimal Amount,
    string Currency,
    bool PartialPayment,
    IReadOnlyList<string> PaymentMethods,
    IReadOnlyList<BokunQuestion> Questions
);

public sealed record BokunQuestion(
    string QuestionId,
    string Label,
    bool Required,
    string DataType,
    string DataFormat,
    bool SelectFromOptions,
    bool SelectMultiple,
    IReadOnlyList<BokunQuestionOption> AnswerOptions
);

public sealed record BokunQuestionOption(string Value, string Label);

public sealed record BokunCheckoutSubmitRequest(
    BokunCheckoutSelectionRequest Selection,
    BokunMainContact MainContact,
    string? CheckoutOption,
    string? PaymentMethod,
    bool SendNotificationToMainContact,
    bool ShowPricesInNotification
);

public sealed record BokunMainContact(
    string FirstName,
    string LastName,
    string Email,
    string? PersonalIdNumber,
    string? PhoneNumber,
    string? Nationality,
    string? Title,
    string? Gender
);

public sealed record BokunCheckoutSubmitResponse(
    string Status,
    string ConfirmationCode,
    string BookingId,
    string RedirectUrl,
    string Message
);

public sealed class BokunApiException : Exception
{
    public BokunApiException(int statusCode, string message, string? details = null)
        : base(message)
    {
        StatusCode = statusCode;
        Details = details ?? string.Empty;
    }

    public int StatusCode { get; }
    public string Details { get; }
}

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

    public async Task<BokunPackageDetails?> GetPackageDetailsAsync(string id, CancellationToken cancellationToken = default)
    {
        EnsureConfigured();
        if (string.IsNullOrWhiteSpace(id))
        {
            return null;
        }

        var path = $"/activity.json/{Uri.EscapeDataString(id)}";
        using var request = CreateSignedRequest(HttpMethod.Get, path);
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("Bokun details request failed. Status: {Status}. Body: {Body}", (int)response.StatusCode, responseContent);
            var message = responseContent.Length > 600 ? $"{responseContent[..600]}..." : responseContent;
            throw new InvalidOperationException($"Bokun returned {(int)response.StatusCode}: {response.ReasonPhrase}. Body: {message}");
        }

        using var doc = JsonDocument.Parse(responseContent);
        return ParsePackageDetails(doc.RootElement);
    }

    public async Task<BokunPackageAvailabilityResponse?> GetPackageAvailabilityAsync(
        string id,
        DateOnly startDate,
        DateOnly endDate,
        string currency,
        bool includeSoldOut,
        CancellationToken cancellationToken = default)
    {
        EnsureConfigured();
        if (string.IsNullOrWhiteSpace(id))
        {
            return null;
        }

        var normalizedCurrency = string.IsNullOrWhiteSpace(currency) ? "USD" : currency.Trim().ToUpperInvariant();
        var detailsPath = $"/activity.json/{Uri.EscapeDataString(id)}?currency={Uri.EscapeDataString(normalizedCurrency)}";
        using var detailsRequest = CreateSignedRequest(HttpMethod.Get, detailsPath);
        using var detailsResponse = await _httpClient.SendAsync(detailsRequest, cancellationToken);
        var detailsContent = await detailsResponse.Content.ReadAsStringAsync(cancellationToken);
        EnsureSuccess(detailsResponse, detailsContent, "Bokun package details request failed.");

        using var detailsDoc = JsonDocument.Parse(detailsContent);
        var detailsRoot = detailsDoc.RootElement;
        var defaultRateId = (long)GetDecimal(detailsRoot, "defaultRateId");
        var pricingCategories = ParsePricingCategories(detailsRoot);

        var includeSoldOutText = includeSoldOut ? "true" : "false";
        var availabilityPath = $"/activity.json/{Uri.EscapeDataString(id)}/availabilities?start={startDate:yyyy-MM-dd}&end={endDate:yyyy-MM-dd}&currency={Uri.EscapeDataString(normalizedCurrency)}&includeSoldOut={includeSoldOutText}";
        using var availabilityRequest = CreateSignedRequest(HttpMethod.Get, availabilityPath);
        using var availabilityResponse = await _httpClient.SendAsync(availabilityRequest, cancellationToken);
        var availabilityContent = await availabilityResponse.Content.ReadAsStringAsync(cancellationToken);
        EnsureSuccess(availabilityResponse, availabilityContent, "Bokun availability request failed.");

        using var availabilityDoc = JsonDocument.Parse(availabilityContent);
        var slots = ParseAvailabilitySlots(availabilityDoc.RootElement, defaultRateId);

        return new BokunPackageAvailabilityResponse(
            PackageId: id,
            Currency: normalizedCurrency,
            DefaultRateId: defaultRateId,
            PricingCategories: pricingCategories,
            Slots: slots
        );
    }

    public async Task<BokunCheckoutOptionsResponse> GetCheckoutOptionsAsync(
        BokunCheckoutSelectionRequest request,
        CancellationToken cancellationToken = default)
    {
        EnsureConfigured();
        var payload = BuildBookingRequestPayload(request);
        var path = "/checkout.json/options/booking-request";
        var body = JsonSerializer.Serialize(payload, JsonOptions);

        using var httpRequest = CreateSignedRequest(HttpMethod.Post, path, body);
        using var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
        EnsureSuccess(response, responseContent, "Bokun checkout options request failed.");

        using var doc = JsonDocument.Parse(responseContent);
        return ParseCheckoutOptions(doc.RootElement);
    }

    public async Task<BokunCheckoutSubmitResponse> SubmitCheckoutAsync(
        BokunCheckoutSubmitRequest request,
        CancellationToken cancellationToken = default)
    {
        EnsureConfigured();
        var directBooking = BuildBookingRequestPayload(request.Selection);
        var mainContactAnswers = BuildMainContactAnswers(request.MainContact);

        if (directBooking is not Dictionary<string, object?> dict)
        {
            throw new InvalidOperationException("Invalid booking payload.");
        }

        dict["mainContactDetails"] = mainContactAnswers;

        var payload = new Dictionary<string, object?>
        {
            ["checkoutOption"] = string.IsNullOrWhiteSpace(request.CheckoutOption) ? "CUSTOMER_FULL_PAYMENT" : request.CheckoutOption,
            ["paymentMethod"] = string.IsNullOrWhiteSpace(request.PaymentMethod) ? "RESERVE_FOR_EXTERNAL_PAYMENT" : request.PaymentMethod,
            ["source"] = "DIRECT_REQUEST",
            ["directBooking"] = dict,
            ["sendNotificationToMainContact"] = request.SendNotificationToMainContact,
            ["showPricesInNotification"] = request.ShowPricesInNotification,
            ["currency"] = string.IsNullOrWhiteSpace(request.Selection.Currency) ? "USD" : request.Selection.Currency.Trim().ToUpperInvariant()
        };

        var path = "/checkout.json/submit";
        var responseContent = await PostCheckoutSubmitAsync(path, payload, cancellationToken);

        // If Bokun still rejects phone number, retry once without phoneNumber.
        if (IsPhoneValidationError(responseContent))
        {
            if (dict.TryGetValue("mainContactDetails", out var answersObj) &&
                answersObj is IReadOnlyList<object> answers)
            {
                dict["mainContactDetails"] = RemoveAnswerByQuestionId(answers, "phoneNumber");
                responseContent = await PostCheckoutSubmitAsync(path, payload, cancellationToken);
            }
        }

        using var doc = JsonDocument.Parse(responseContent);
        return ParseCheckoutSubmitResponse(doc.RootElement);
    }

    private async Task<string> PostCheckoutSubmitAsync(
        string path,
        Dictionary<string, object?> payload,
        CancellationToken cancellationToken)
    {
        var body = JsonSerializer.Serialize(payload, JsonOptions);

        using var httpRequest = CreateSignedRequest(HttpMethod.Post, path, body);
        using var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode && !IsPhoneValidationError(responseContent))
        {
            EnsureSuccess(response, responseContent, "Bokun checkout submit request failed.");
        }

        if (!response.IsSuccessStatusCode && IsPhoneValidationError(responseContent))
        {
            _logger.LogWarning("Bokun rejected phone number format. Retrying submit without phoneNumber.");
        }

        return responseContent;
    }

    private static bool IsPhoneValidationError(string responseContent)
    {
        if (string.IsNullOrWhiteSpace(responseContent))
        {
            return false;
        }

        return responseContent.Contains("\"questionId\":\"phoneNumber\"", StringComparison.OrdinalIgnoreCase) &&
               responseContent.Contains("Not a valid phone number", StringComparison.OrdinalIgnoreCase);
    }

    private static IReadOnlyList<object> RemoveAnswerByQuestionId(IReadOnlyList<object> answers, string questionId)
    {
        var filtered = new List<object>();
        foreach (var entry in answers)
        {
            if (entry is Dictionary<string, object?> dict &&
                dict.TryGetValue("questionId", out var idValue) &&
                idValue is string id &&
                string.Equals(id, questionId, StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            filtered.Add(entry);
        }

        return filtered;
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

    private void EnsureSuccess(HttpResponseMessage response, string responseContent, string contextMessage)
    {
        if (response.IsSuccessStatusCode)
        {
            return;
        }

        _logger.LogWarning("{Context} Status: {Status}. Body: {Body}", contextMessage, (int)response.StatusCode, responseContent);
        var message = responseContent;
        if (message.Length > 600)
        {
            message = $"{message[..600]}...";
        }

        throw new BokunApiException((int)response.StatusCode, $"{contextMessage} {(int)response.StatusCode}: {response.ReasonPhrase}", message);
    }

    private static IReadOnlyList<BokunPricingCategory> ParsePricingCategories(JsonElement detailsRoot)
    {
        if (!detailsRoot.TryGetProperty("pricingCategories", out var categories) || categories.ValueKind != JsonValueKind.Array)
        {
            return Array.Empty<BokunPricingCategory>();
        }

        var result = new List<BokunPricingCategory>();
        foreach (var item in categories.EnumerateArray())
        {
            var id = (long)GetDecimal(item, "id");
            if (id <= 0)
            {
                continue;
            }

            result.Add(new BokunPricingCategory(
                Id: id,
                Title: GetString(item, "fullTitle", "title") ?? $"Category {id}",
                CategoryType: GetString(item, "ticketCategory") ?? "OTHER",
                IsDefault: GetBoolean(item, "defaultCategory")
            ));
        }

        return result;
    }

    private static IReadOnlyList<BokunAvailabilitySlot> ParseAvailabilitySlots(JsonElement root, long defaultRateId)
    {
        if (root.ValueKind != JsonValueKind.Array)
        {
            return Array.Empty<BokunAvailabilitySlot>();
        }

        var result = new List<BokunAvailabilitySlot>();
        foreach (var slot in root.EnumerateArray())
        {
            var startTimeId = (long)GetDecimal(slot, "startTimeId");
            if (startTimeId <= 0)
            {
                continue;
            }

            var dateIso = ParseEpochDate(slot);
            if (string.IsNullOrWhiteSpace(dateIso))
            {
                continue;
            }

            var rateId = ResolveRateId(slot, defaultRateId);
            var prices = ParseRateCategoryPrices(slot, rateId);

            result.Add(new BokunAvailabilitySlot(
                Date: dateIso,
                StartTime: GetString(slot, "startTime") ?? "00:00",
                StartTimeId: startTimeId,
                RateId: rateId,
                AvailabilityCount: (int)GetDecimal(slot, "availabilityCount"),
                SoldOut: GetBoolean(slot, "soldOut", "unavailable"),
                PricesByCategory: prices
            ));
        }

        return result
            .OrderBy(x => x.Date, StringComparer.Ordinal)
            .ThenBy(x => x.StartTime, StringComparer.Ordinal)
            .ToArray();
    }

    private static string ParseEpochDate(JsonElement slot)
    {
        if (slot.ValueKind == JsonValueKind.Object && slot.TryGetProperty("date", out var value))
        {
            long epoch;
            if (value.ValueKind == JsonValueKind.Number && value.TryGetInt64(out epoch))
            {
                return DateFromEpoch(epoch);
            }

            if (value.ValueKind == JsonValueKind.String && long.TryParse(value.GetString(), out epoch))
            {
                return DateFromEpoch(epoch);
            }
        }

        return string.Empty;
    }

    private static string DateFromEpoch(long epoch)
    {
        // Bokun may return milliseconds or seconds.
        var dateTime = epoch > 99_999_999_999
            ? DateTimeOffset.FromUnixTimeMilliseconds(epoch)
            : DateTimeOffset.FromUnixTimeSeconds(epoch);
        return dateTime.UtcDateTime.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
    }

    private static long ResolveRateId(JsonElement slot, long defaultRateId)
    {
        if (defaultRateId > 0)
        {
            return defaultRateId;
        }

        if (slot.ValueKind == JsonValueKind.Object &&
            slot.TryGetProperty("rates", out var rates) &&
            rates.ValueKind == JsonValueKind.Array &&
            rates.GetArrayLength() > 0)
        {
            var first = rates[0];
            var id = (long)GetDecimal(first, "id");
            if (id > 0)
            {
                return id;
            }
        }

        return (long)GetDecimal(slot, "defaultRateId");
    }

    private static IReadOnlyList<BokunCategoryPrice> ParseRateCategoryPrices(JsonElement slot, long rateId)
    {
        if (slot.ValueKind != JsonValueKind.Object ||
            !slot.TryGetProperty("pricesByRate", out var rates) ||
            rates.ValueKind != JsonValueKind.Array)
        {
            return Array.Empty<BokunCategoryPrice>();
        }

        JsonElement chosenRate = default;
        foreach (var rate in rates.EnumerateArray())
        {
            if ((long)GetDecimal(rate, "activityRateId") == rateId)
            {
                chosenRate = rate;
                break;
            }
        }

        if (chosenRate.ValueKind == JsonValueKind.Undefined && rates.GetArrayLength() > 0)
        {
            chosenRate = rates[0];
        }

        if (chosenRate.ValueKind != JsonValueKind.Object ||
            !chosenRate.TryGetProperty("pricePerCategoryUnit", out var categories) ||
            categories.ValueKind != JsonValueKind.Array)
        {
            return Array.Empty<BokunCategoryPrice>();
        }

        var prices = new List<BokunCategoryPrice>();
        foreach (var category in categories.EnumerateArray())
        {
            var categoryId = (long)GetDecimal(category, "id");
            if (categoryId <= 0)
            {
                continue;
            }

            decimal amount = 0m;
            if (category.TryGetProperty("amount", out var amountNode))
            {
                amount = GetDecimal(amountNode, "amount", "value");
                if (amount <= 0m && amountNode.ValueKind == JsonValueKind.Number && amountNode.TryGetDecimal(out var direct))
                {
                    amount = direct;
                }
            }

            prices.Add(new BokunCategoryPrice(categoryId, amount));
        }

        return prices;
    }

    private static BokunCheckoutOptionsResponse ParseCheckoutOptions(JsonElement root)
    {
        var options = new List<BokunCheckoutOption>();
        if (root.TryGetProperty("options", out var optionArray) && optionArray.ValueKind == JsonValueKind.Array)
        {
            foreach (var option in optionArray.EnumerateArray())
            {
                var paymentMethods = Array.Empty<string>();
                if (option.TryGetProperty("paymentMethods", out var methodsNode) &&
                    methodsNode.TryGetProperty("allowedMethods", out var allowed) &&
                    allowed.ValueKind == JsonValueKind.Array)
                {
                    paymentMethods = allowed
                        .EnumerateArray()
                        .Where(x => x.ValueKind == JsonValueKind.String)
                        .Select(x => x.GetString() ?? string.Empty)
                        .Where(x => !string.IsNullOrWhiteSpace(x))
                        .ToArray();
                }

                options.Add(new BokunCheckoutOption(
                    Type: GetString(option, "type") ?? string.Empty,
                    Label: GetString(option, "label") ?? string.Empty,
                    Amount: GetDecimal(option, "amount"),
                    Currency: GetString(option, "currency") ?? string.Empty,
                    PartialPayment: GetBoolean(option, "partialPayment"),
                    PaymentMethods: paymentMethods,
                    Questions: ParseQuestionsArray(option, "questions")
                ));
            }
        }

        var mainContactQuestions = Array.Empty<BokunQuestion>();
        if (root.TryGetProperty("questions", out var questionsNode) &&
            questionsNode.ValueKind == JsonValueKind.Object)
        {
            mainContactQuestions = ParseQuestionsArray(questionsNode, "mainContactDetails");
        }

        return new BokunCheckoutOptionsResponse(options, mainContactQuestions);
    }

    private static BokunCheckoutSubmitResponse ParseCheckoutSubmitResponse(JsonElement root)
    {
        var status = GetNestedString(root, "booking", "status") ?? "UNKNOWN";
        var confirmationCode = GetNestedString(root, "booking", "confirmationCode") ?? string.Empty;
        var bookingId = GetNestedString(root, "booking", "bookingId") ?? string.Empty;
        var redirectUrl = GetNestedString(root, "redirectRequest", "url") ?? string.Empty;
        var message = string.IsNullOrWhiteSpace(confirmationCode)
            ? "Booking submitted."
            : $"Booking created with confirmation code {confirmationCode}.";

        return new BokunCheckoutSubmitResponse(
            Status: status,
            ConfirmationCode: confirmationCode,
            BookingId: bookingId,
            RedirectUrl: redirectUrl,
            Message: message
        );
    }

    private static BokunQuestion[] ParseQuestionsArray(JsonElement parent, string propertyName)
    {
        if (!parent.TryGetProperty(propertyName, out var questions) || questions.ValueKind != JsonValueKind.Array)
        {
            return Array.Empty<BokunQuestion>();
        }

        var result = new List<BokunQuestion>();
        foreach (var question in questions.EnumerateArray())
        {
            var options = Array.Empty<BokunQuestionOption>();
            if (question.TryGetProperty("answerOptions", out var answerOptions) && answerOptions.ValueKind == JsonValueKind.Array)
            {
                options = answerOptions
                    .EnumerateArray()
                    .Select(option => new BokunQuestionOption(
                        Value: GetString(option, "value", "name") ?? string.Empty,
                        Label: GetString(option, "label", "value", "name") ?? string.Empty))
                    .Where(x => !string.IsNullOrWhiteSpace(x.Value))
                    .ToArray();
            }

            result.Add(new BokunQuestion(
                QuestionId: GetString(question, "questionId") ?? string.Empty,
                Label: GetString(question, "label") ?? string.Empty,
                Required: GetBoolean(question, "required"),
                DataType: GetString(question, "dataType") ?? string.Empty,
                DataFormat: GetString(question, "dataFormat") ?? string.Empty,
                SelectFromOptions: GetBoolean(question, "selectFromOptions"),
                SelectMultiple: GetBoolean(question, "selectMultiple"),
                AnswerOptions: options
            ));
        }

        return result.Where(x => !string.IsNullOrWhiteSpace(x.QuestionId)).ToArray();
    }

    private static object BuildBookingRequestPayload(BokunCheckoutSelectionRequest request)
    {
        var rateId = request.RateId.GetValueOrDefault();
        var passengers = (request.Passengers ?? Array.Empty<BokunPassengerSelection>())
            .Where(x => x.PricingCategoryId > 0 && x.Quantity > 0)
            .Select(x => new Dictionary<string, object?>
            {
                ["pricingCategoryId"] = x.PricingCategoryId,
                ["groupSize"] = x.Quantity
            })
            .ToArray();

        var activityBooking = new Dictionary<string, object?>
        {
            ["activityId"] = long.TryParse(request.PackageId, out var parsedId) ? parsedId : request.PackageId,
            ["date"] = request.Date,
            ["startTimeId"] = request.StartTimeId,
            ["passengers"] = passengers
        };

        if (rateId > 0)
        {
            activityBooking["rateId"] = rateId;
        }

        return new Dictionary<string, object?>
        {
            ["activityBookings"] = new[] { activityBooking }
        };
    }

    private static IReadOnlyList<object> BuildMainContactAnswers(BokunMainContact contact)
    {
        var answers = new List<object>();
        AddAnswer(answers, "firstName", contact.FirstName);
        AddAnswer(answers, "lastName", contact.LastName);
        AddAnswer(answers, "email", contact.Email);
        AddAnswer(answers, "personalIdNumber", string.IsNullOrWhiteSpace(contact.PersonalIdNumber) ? "N/A" : contact.PersonalIdNumber);
        // Phone is optional for this integration and Bokun has strict formatting checks.
        // To avoid failed checkouts on optional input, we intentionally do not send phone.
        AddAnswer(answers, "nationality", contact.Nationality);
        AddAnswer(answers, "title", contact.Title);
        AddAnswer(answers, "gender", contact.Gender);
        return answers;
    }

    private static void AddAnswer(List<object> answers, string questionId, string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return;
        }

        answers.Add(new Dictionary<string, object?>
        {
            ["questionId"] = questionId,
            ["values"] = new[] { value.Trim() }
        });
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

    private static BokunPackageDetails? ParsePackageDetails(JsonElement root)
    {
        var id = GetString(root, "id", "activityId", "productId");
        var title = GetString(root, "title", "name");
        if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(title))
        {
            return null;
        }

        var category = FirstArrayString(root, "activityCategories") ??
                       GetString(root, "productCategory", "category") ??
                       "General";
        var duration = GetString(root, "durationText", "duration") ?? string.Empty;
        var price = GetDecimal(root, "nextDefaultPrice", "priceFrom", "price");
        var rating = GetDecimal(root, "reviewRating");
        if (rating <= 0)
        {
            rating = GetNestedDecimal(root, "tripadvisorReview", "rating");
        }
        var reviewCount = (int)GetDecimal(root, "reviewCount");
        if (reviewCount <= 0)
        {
            reviewCount = (int)GetNestedDecimal(root, "tripadvisorReview", "numReviews");
        }

        var difficulty = GetString(root, "difficultyLevel") ?? "EASY";
        var location = GetNestedString(root, "locationCode", "name")
                       ?? GetNestedString(root, "googlePlace", "city")
                       ?? "Victoria Falls";

        var summary = CleanText(GetString(root, "excerpt", "summary") ?? string.Empty);
        var description = CleanText(GetString(root, "description", "summary") ?? string.Empty);
        var included = CleanText(GetString(root, "included") ?? string.Empty);
        var requirements = CleanText(GetString(root, "requirements") ?? string.Empty);
        var attention = CleanText(GetString(root, "attention") ?? string.Empty);
        var cancellationPolicy = GetNestedString(root, "cancellationPolicy", "title") ?? "Operator cancellation terms apply.";

        var highlights = BuildHighlights(root, summary, description);
        var includes = BuildIncludes(included);
        var itinerary = BuildItinerary(root);
        var gallery = BuildGallery(root);

        return new BokunPackageDetails(
            Id: id,
            Title: title,
            Category: category,
            Duration: duration,
            PriceFrom: price,
            Rating: rating,
            ReviewCount: reviewCount,
            Difficulty: difficulty,
            Location: location,
            Summary: summary,
            Description: description,
            Included: included,
            Requirements: requirements,
            Attention: attention,
            CancellationPolicy: cancellationPolicy,
            Highlights: highlights,
            Includes: includes,
            Itinerary: itinerary,
            Gallery: gallery
        );
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

    private static bool GetBoolean(JsonElement item, params string[] names)
    {
        foreach (var name in names)
        {
            if (item.ValueKind != JsonValueKind.Object || !item.TryGetProperty(name, out var value))
            {
                continue;
            }

            if (value.ValueKind == JsonValueKind.True)
            {
                return true;
            }
            if (value.ValueKind == JsonValueKind.False)
            {
                return false;
            }
            if (value.ValueKind == JsonValueKind.String &&
                bool.TryParse(value.GetString(), out var parsed))
            {
                return parsed;
            }
        }
        return false;
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

    private static decimal GetNestedDecimal(JsonElement item, params string[] segments)
    {
        JsonElement current = item;
        foreach (var segment in segments)
        {
            if (current.ValueKind != JsonValueKind.Object || !current.TryGetProperty(segment, out var property))
            {
                return 0m;
            }
            current = property;
        }

        if (current.ValueKind == JsonValueKind.Number && current.TryGetDecimal(out var numeric))
        {
            return numeric;
        }
        if (current.ValueKind == JsonValueKind.String &&
            decimal.TryParse(current.GetString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var parsed))
        {
            return parsed;
        }
        return 0m;
    }

    private static string? FirstArrayString(JsonElement item, string propertyName)
    {
        if (item.ValueKind == JsonValueKind.Object &&
            item.TryGetProperty(propertyName, out var value) &&
            value.ValueKind == JsonValueKind.Array &&
            value.GetArrayLength() > 0)
        {
            var first = value[0];
            return first.ValueKind == JsonValueKind.String ? first.GetString() : null;
        }

        return null;
    }

    private static string CleanText(string htmlOrText)
    {
        if (string.IsNullOrWhiteSpace(htmlOrText))
        {
            return string.Empty;
        }

        var withLines = Regex.Replace(htmlOrText, "(<br\\s*/?>|</p>|</li>|</div>)", "\n", RegexOptions.IgnoreCase);
        var noTags = Regex.Replace(withLines, "<.*?>", string.Empty);
        var decoded = System.Net.WebUtility.HtmlDecode(noTags);
        var lines = decoded
            .Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(x => !string.IsNullOrWhiteSpace(x));
        return string.Join(' ', lines);
    }

    private static IReadOnlyList<string> BuildHighlights(JsonElement root, string summary, string description)
    {
        var list = new List<string>();
        if (root.TryGetProperty("activityCategories", out var cats) && cats.ValueKind == JsonValueKind.Array)
        {
            foreach (var c in cats.EnumerateArray())
            {
                if (c.ValueKind == JsonValueKind.String)
                {
                    list.Add(c.GetString()!.Replace("_", " ", StringComparison.OrdinalIgnoreCase));
                }
            }
        }
        if (list.Count == 0)
        {
            var text = $"{summary} {description}";
            if (text.Contains("guide", StringComparison.OrdinalIgnoreCase)) list.Add("Guided experience");
            if (text.Contains("photo", StringComparison.OrdinalIgnoreCase)) list.Add("Photo opportunities");
            if (text.Contains("local", StringComparison.OrdinalIgnoreCase)) list.Add("Local expertise");
            if (list.Count == 0) list.Add("Curated operator experience");
        }
        return list.Distinct(StringComparer.OrdinalIgnoreCase).Take(6).ToArray();
    }

    private static IReadOnlyList<string> BuildIncludes(string includedText)
    {
        if (string.IsNullOrWhiteSpace(includedText))
        {
            return new[] { "Operator-defined inclusions provided on confirmation." };
        }

        var split = includedText
            .Split(new[] { "•", "✔", ";", "." }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(x => x.Length > 3)
            .Take(8)
            .ToArray();

        return split.Length > 0 ? split : new[] { includedText };
    }

    private static IReadOnlyList<BokunItineraryStop> BuildItinerary(JsonElement root)
    {
        var result = new List<BokunItineraryStop>();
        if (root.TryGetProperty("agendaItems", out var agenda) && agenda.ValueKind == JsonValueKind.Array)
        {
            var idx = 1;
            foreach (var item in agenda.EnumerateArray())
            {
                var title = GetString(item, "title") ?? $"Stop {idx}";
                var detail = CleanText(GetString(item, "excerpt", "body") ?? string.Empty);
                result.Add(new BokunItineraryStop($"{8 + idx:00}:00", title, detail));
                idx++;
            }
        }

        return result.Count > 0
            ? result
            : new[] { new BokunItineraryStop("09:00", "Experience window", "Detailed itinerary is provided by operator confirmation.") };
    }

    private static IReadOnlyList<string> BuildGallery(JsonElement root)
    {
        var list = new List<string>();
        var key = GetNestedString(root, "keyPhoto", "originalUrl");
        if (!string.IsNullOrWhiteSpace(key))
        {
            list.Add(key);
        }

        if (root.TryGetProperty("photos", out var photos) && photos.ValueKind == JsonValueKind.Array)
        {
            foreach (var photo in photos.EnumerateArray())
            {
                var url = GetString(photo, "originalUrl");
                if (!string.IsNullOrWhiteSpace(url))
                {
                    list.Add(url);
                }
            }
        }

        return list.Distinct(StringComparer.OrdinalIgnoreCase).Take(8).ToArray();
    }
}
