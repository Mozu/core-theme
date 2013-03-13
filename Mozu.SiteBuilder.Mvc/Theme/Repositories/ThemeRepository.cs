using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using Mozu.SiteBuilder.Mvc.Themes.Exceptions;
using Mozu.SiteBuilder.Mvc.Themes.Factories;
using Mozu.SiteBuilder.Mvc.Themes.Providers;

namespace Mozu.SiteBuilder.Mvc.Themes.Repositories
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
        private readonly ThemeFactory _themeFactory;
        private readonly IThemeMetaDataProvider _themeMetaDataProvider;
        private const string DEFAULT_THEME = "Core3";
        private static System.Collections.Concurrent.ConcurrentDictionary<string, Theme> _themes = new ConcurrentDictionary<string, Theme>(StringComparer.OrdinalIgnoreCase);
       

        public bool IsInitialized { get; private set; }

        /// <summary>
        /// Public constructor.
        /// </summary>
        /// <param name="themeProvider"></param>
        public ThemeRepository(ThemeFactory themeFactory , IThemeMetaDataProvider themeMetaDataProvider)
        {
            _themeFactory = themeFactory;
            _themeMetaDataProvider = themeMetaDataProvider;
        }


        /// <summary>
        /// Finds a theme by name.
        /// </summary>
        /// <exception cref="ThemeNotFoundException">If the theme is not found.</exception>        
        public Theme GetTheme(string name)
        {
            var t = _themes.GetOrAdd(name, CreateTheme);
            if (t == null)
            {
                throw new ThemeNotFoundException("Requested theme was not found: " + name);
            }
            return t;

        }

        Theme CreateTheme(string name)
        {
            var tmd = _themeMetaDataProvider.GetTheme(name, true );
            if (tmd == null)
            {
                return null;
            }
            return _themeFactory.Build(tmd, this);
        }


        /// <summary>
        /// Finds a theme by name.
        /// If the theme is not found, returns the system default theme.
        /// </summary>
        public Theme GetThemeOrDefault(string name)
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

        ///// <summary>
        ///// Returns all themes.
        ///// </summary>
        //public IEnumerable<ITheme> GetAll()
        //{
        //    return _themes;
        //}

        /// <summary>
        /// Returns the system default theme.
        /// </summary>
        public Theme GetDefaultTheme()
        {
            return GetTheme(DEFAULT_THEME);
        }
    }
}
