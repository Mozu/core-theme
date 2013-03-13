using System;
using System.Collections.Generic;

namespace Mozu.SiteBuilder.Mvc.Themes.Repositories
{
    public interface IThemeRepository
    {
        /// <summary>
        /// Finds a theme by name.
        /// </summary>
        Theme GetTheme(string name);

        /// <summary>
        /// Finds a theme by name.
        /// If the theme is not found, returns the system default theme.
        /// </summary>
        Theme GetThemeOrDefault(string name);

        ///// <summary>
        ///// Returns all themes.
        ///// </summary>
        //IEnumerable<ITheme> GetAll();

        /// <summary>
        /// Returns the system default theme.
        /// </summary>
        Theme GetDefaultTheme();
    }
}
