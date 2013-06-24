using System;
using System.Collections.Generic;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings;

namespace Mozu.SiteBuilder.Mvc.Themes.Providers
{
    /// <summary>
    /// Defines an abstraction for discovering all theme descriptions from a data store.
    /// </summary>
    internal  interface IThemeMetaDataProvider
    {
        /// <summary>
        /// Searches the underlying data store for themes and creates an <code>IThemeMetaData</code> for every entry it finds.
        /// </summary>
    //    IEnumerable<IThemeMetaData> GetThemes();

        ThemeMetaData GetTheme(string theme, bool forDev);

        IEnumerable<string> ThemePaths { get; }
        string LocalThemePath { get; }

    }
    internal class ThemeMetaData
    {
        public ThemeInformationMetadata ThemeInfo { get; set; }
        public ThemeConfigurationItemCollection ThemeSettings { get; set; }
        public Thumbnail Thumbnail { get; set; }
        public string Id { get; set; }
        public string ThemePath { get; set; }
        

        public ThemeMetaData()
        {
            // TODO: Complete member initialization
        }



        //public string[] FileListing { get; set; }

        public List<Models.CMS.PageTemplateDefinition> PageTypes { get; set; }

        public List<Models.CMS.WidgetDefinition> Widgets { get; set; }

        public ThemeFileSystemInfo[] FileListing { get; set; }
    }


}
