using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.SiteBuilder.Mvc.Theme.Exceptions;
using Mozu.SiteBuilder.Mvc.Theme.Factories;
using Mozu.SiteBuilder.Mvc.Theme.Providers;

namespace Mozu.SiteBuilder.Mvc.Theme.Repositories
{
    /// <summary>
    /// A repository and factory for <code>ITheme</code>
    /// At startup, traverses the local 'Themes' directory and 
    /// instantiates themes based on their theme.xml descriptor.
    /// 
    /// This class is intended to be treated as a singleton 
    /// by the dependency injection framework.
    /// </summary>
    internal class ThemeRepository : IThemeRepository
    {
        private const string DEFAULT_THEME = "Core3";
        private IList<ITheme> _themes;
        private readonly IThemeMetaDataProvider _themeProvider;

        public bool IsInitialized { get; private set; }

        /// <summary>
        /// Public constructor.
        /// </summary>
        /// <param name="themeProvider"></param>
        public ThemeRepository(IThemeMetaDataProvider themeProvider)
        {
            _themeProvider = themeProvider;
        }

        /// <summary>
        /// Called by the DI framework before this repository is used for the first time.
        /// For each theme provided by <code>themeProvider</code>, delegates to a <code>ThemeInfoFactory</code>
        /// </summary>
        public void Initialize()
        {
           
            using (ThemeFactory fac = new ThemeFactory())
            {
                foreach (IThemeMetaData meta in _themeProvider.GetThemes())
                {
                    fac.AddTheme(meta);
                }

                _themes = fac.GetThemes();
            }

            IsInitialized = true;
        }

        /// <summary>
        /// Finds a theme by name.
        /// </summary>
        /// <exception cref="ThemeNotFoundException">If the theme is not found.</exception>        
        public ITheme GetTheme(string name)
        {
            try
            {
                return _themes.First(t => t.Name == name);
            }
            catch (Exception e)
            {
                throw new ThemeNotFoundException("Requested theme was not found: " + name, e);
            }
        }

        /// <summary>
        /// Finds a theme by name.
        /// If the theme is not found, returns the system default theme.
        /// </summary>
        public ITheme GetThemeOrDefault(string name)
        {
            try
            {
                return GetTheme(name ?? DEFAULT_THEME);
            }
            catch (ThemeNotFoundException)
            {
                return GetDefaultTheme();
            }
        }

        /// <summary>
        /// Returns all themes.
        /// </summary>
        public IEnumerable<ITheme> GetAll()
        {
            return _themes;
        }

        /// <summary>
        /// Returns the system default theme.
        /// </summary>
        public ITheme GetDefaultTheme()
        {
            return GetTheme(DEFAULT_THEME);
        }
    }
}
