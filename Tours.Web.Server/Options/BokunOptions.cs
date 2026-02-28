namespace Tours.Web.Server.Options;

public sealed class BokunOptions
{
    public const string SectionName = "Bokun";

    public string BaseUrl { get; set; } = "https://api.bokun.io";
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string OctoToken { get; set; } = string.Empty;
    public bool UseSandbox { get; set; } = true;
}
