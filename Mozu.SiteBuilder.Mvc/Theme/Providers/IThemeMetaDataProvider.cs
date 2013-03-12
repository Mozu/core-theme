using System;
using System.Collections.Generic;
using Mozu.SiteBuilder.Mvc.Theme;
using Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings;

namespace Mozu.SiteBuilder.Mvc.Theme.Providers
{
    /// <summary>
    /// Defines an abstraction for discovering all theme descriptions from a data store.
    /// </summary>
    public  interface IThemeMetaDataProvider
    {
        /// <summary>
        /// Searches the underlying data store for themes and creates an <code>IThemeMetaData</code> for every entry it finds.
        /// </summary>
    //    IEnumerable<IThemeMetaData> GetThemes();

        ThemeMetaData GetTheme(string theme, bool forDev);

    }
    public class ThemeMetaData
    {
        public ThemeInformationMetadata ThemeInfo { get; set; }
        public ConfigurationItemCollection ThemeSettings { get; set; }
        public Thumbnail Thumbnail { get; set; }

        public ThemeMetaData(ThemeInformationMetadata themeInfo, ConfigurationItemCollection themeSettings, Thumbnail thumbnail)
        {
            this.ThemeInfo = themeInfo;
            this.ThemeSettings = themeSettings;
            this.Thumbnail = thumbnail;
        }

        public ThemeMetaData()
        {
            // TODO: Complete member initialization
        }

        public string Id { get; set; }

        public string ThemePath { get; set; }
    }

}
