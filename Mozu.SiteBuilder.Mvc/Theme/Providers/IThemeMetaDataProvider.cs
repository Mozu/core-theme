using System;
using System.Collections.Generic;
using Mozu.SiteBuilder.Mvc.Theme;

namespace Mozu.SiteBuilder.Mvc.Theme.Providers
{
    /// <summary>
    /// Defines an abstraction for discovering all theme descriptions from a data store.
    /// </summary>
    internal interface IThemeMetaDataProvider
    {
        /// <summary>
        /// Searches the underlying data store for themes and creates an <code>IThemeMetaData</code> for every entry it finds.
        /// </summary>
    //    IEnumerable<IThemeMetaData> GetThemes();

        IThemeMetaData GetTheme(string theme, bool forDev);

    }
}
