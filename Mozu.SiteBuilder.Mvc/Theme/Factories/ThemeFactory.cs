using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.Theme;
using Mozu.SiteBuilder.Mvc.Theme.Exceptions;

namespace Mozu.SiteBuilder.Mvc.Theme.Factories
{
    /// <summary>
    /// A factory for <code>IThemeInfo</code>
    /// At startup, ThemeInfoRepository traverses the local 'Themes' directory 
    /// and passes those themes to an instance of this factory.
    /// This factory assembles a list of themes with their 
    /// dependency chain instantiated.
    /// </summary>
    internal class ThemeFactory : IDisposable
    {
        private List<Theme> _themes;
        private ThemeConfigurationFactory _configFactory;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public ThemeFactory()
        {
            _themes = new List<Theme>();
            _configFactory = new ThemeConfigurationFactory();
        }
        
        /// <summary>
        /// Adds an uninitialized theme to this factory's internal list of themes.
        /// </summary>
        public void AddTheme(IThemeMetaData metadata)
        {
            Theme newTheme = new Theme
            {
                Name                = metadata.ThemeInfo.Name,
                Author              = metadata.ThemeInfo.Author,
                InheritanceString   = metadata.ThemeInfo.Extends,
                IsDesktop           = metadata.ThemeInfo.IsDesktop,
                IsMobile            = metadata.ThemeInfo.IsMobile,
                Thumbnail           = metadata.Thumbnail,
                NodeConfiguration   = metadata.ThemeSettings.Items
            };

            _themes.Add(newTheme);
        }

        /// <summary>
        /// Initializes any uninitialized themes belonging to this factory and returns a list of initialized themes.
        /// If a theme fails to initialize, it will not be included.
        /// </summary>
        public IList<ITheme> GetThemes()
        {
            // establish inheritance of all themes
            foreach (Theme theme in _themes)
            {
                if (!theme.IsInitialized)
                {
                    try
                    {
                        // initialize theme's inheritance
                        this.InitializeThemeInheritanceStackAndConfiguration(theme);
                    }
                    catch (Exception e)
                    {
                        string errorMessage = String.Format("Unknown error occured attempting to build theme's inheritance stack. Theme will not be available. Theme: {0}. Message: {1}", theme.Name, e.Message);
                        System.Diagnostics.Debug.WriteLine(errorMessage);
                        LoggingService.LoggerFor<ThemeFactory>().Error(errorMessage, e);
                        continue;
                    }
                }
            }

            // remove any themes that were not properly initialized
            _themes.RemoveAll(t => !t.IsInitialized);

            return _themes.ToList<ITheme>();
        }

        /// <summary>
        /// Recursively initialize a theme's inheritance stack and initializes the theme's merged configuration.
        /// </summary>
        /// <exception cref="ThemeNotFoundException">When a parent theme is not found.</exception>
        /// <exception cref="ThemeInheritanceRecursionException">When a theme inheritance cycle is detected.</exception>
        private Theme InitializeThemeInheritanceStackAndConfiguration(Theme theme, Stack<Theme> chain = null)
        {
            // already initialized
            if (theme.IsInitialized)
                return theme;

            string inherits = theme.InheritanceString;

            // nothing inherited
            if (String.IsNullOrWhiteSpace(inherits))
            {
                theme.Parent = null;
                theme.InheritanceString = null;
                theme.Configuration = _configFactory.GetMergedConfigurations(theme);
                theme.IsInitialized = true;
                return theme;
            }

            inherits = inherits.Trim();

            Theme parent = _themes.FirstOrDefault(t => t.Name == inherits);

            if (parent == null)
                throw new ThemeNotFoundException(String.Format("Theme {0} not found.", inherits));

            if (!parent.IsInitialized)
            {
                chain = chain ?? new Stack<Theme>(new[] { theme });

                if (chain.Any(t => t.Name == inherits))
                    throw new ThemeInheritanceRecursionException();
                
                parent = this.InitializeThemeInheritanceStackAndConfiguration(parent, chain);
            }

            // set theme's parent.
            theme.Parent = parent;

            // set theme's merged configuration
            theme.Configuration = _configFactory.GetMergedConfigurations(theme);

            theme.IsInitialized = true;

            return theme;
        }

        /// <summary>
        /// Implements <code>IDisposable</code>
        /// We don't currently have any disposal work to do, but it allows this factory to be wrapped in a using() block.
        /// </summary>
        public void Dispose()
        {
        }
    }
}
