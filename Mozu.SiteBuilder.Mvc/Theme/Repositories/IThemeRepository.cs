using System;
using System.Collections.Generic;

namespace Mozu.SiteBuilder.Mvc.Theme.Repositories
{
    public interface IThemeRepository
    {
        /// <summary>
        /// Finds a theme by name.
        /// </summary>
        /// <exception cref="ThemeNotFoundException">If the theme is not found.</exception>        
        ITheme GetTheme(string name);

        /// <summary>
        /// Finds a theme by name.
        /// If the theme is not found, returns the system default theme.
        /// </summary>
        ITheme GetThemeOrDefault(string name);

        /// <summary>
        /// Returns all themes.
        /// </summary>
        IEnumerable<ITheme> GetAll();

        /// <summary>
        /// Returns the system default theme.
        /// </summary>
        ITheme GetDefaultTheme();
    }
}
