using Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings;

namespace Mozu.SiteBuilder.Mvc.Theme
{
    internal interface IThemeMetaData
    {
        ThemeInformationMetadata ThemeInfo { get; }
        ConfigurationItemCollection ThemeSettings { get; }
        Thumbnail Thumbnail { get; }
    }
}
