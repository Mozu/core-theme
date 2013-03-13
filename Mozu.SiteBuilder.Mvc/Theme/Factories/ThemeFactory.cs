using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.Mvc.Themes.Exceptions;
using Mozu.SiteBuilder.Mvc.Themes.Providers;
using Mozu.SiteBuilder.Mvc.Themes.Repositories;

namespace Mozu.SiteBuilder.Mvc.Themes.Factories
{
   
    internal class ThemeFactory 
    {
        
        //  private List<Theme> _themes;
        private ThemeConfigurationFactory _configFactory;
        private Dictionary<string, Theme> _stackOverFlowCheckDictionary = new Dictionary<string, Theme>(StringComparer.OrdinalIgnoreCase ); 
        /// <summary>
        /// Public constructor.
        /// </summary>
        public ThemeFactory(  )
        {
            
            //_themes = new List<Theme>();
            _configFactory = new ThemeConfigurationFactory();
        }

        public Theme Build(ThemeMetaData tmd, IThemeRepository repository )
        {
            var theme  = Convert(tmd);
            _stackOverFlowCheckDictionary[tmd.Id ] = theme;
            

            // nothing inherited
            if (String.IsNullOrWhiteSpace(theme.InheritanceString))
            {
                theme.Parent = null;
                theme.InheritanceString = null;
                theme.Configuration = _configFactory.GetMergedConfigurations(theme);
                theme.IsInitialized = true;
                return theme;
            }
            Theme parent;
            if (_stackOverFlowCheckDictionary.TryGetValue(theme.InheritanceString, out parent))
            {
                if (!parent.IsInitialized)
                {
                    throw new ThemeInheritanceRecursionException(string.Format("theme {0} contains recursive parent {1}", theme.Id, theme.InheritanceString));
                }
            }
            else
            {
                parent = repository.GetTheme(theme.InheritanceString);
            }


            if (parent == null)
                throw new ThemeNotFoundException(String.Format("Theme {0} not found.", theme.InheritanceString));


            theme.Parent = parent;

            // set theme's merged configuration
            theme.Configuration = _configFactory.GetMergedConfigurations(theme);

            theme.IsInitialized = true;

            return theme;

        }

        
        /// <summary>
        /// Adds an uninitialized theme to this factory's internal list of themes.
        /// </summary>
        Theme Convert(ThemeMetaData metadata)
        {
            return  new Theme
            {
                Name                = metadata.ThemeInfo.Name,
                Id                  = metadata.ThemeInfo.Id,
                Author              = metadata.ThemeInfo.Author,
                InheritanceString   = metadata.ThemeInfo.Extends,
                IsDesktop           = metadata.ThemeInfo.IsDesktop,
                IsMobile            = metadata.ThemeInfo.IsMobile,
                FileListing         = metadata.FileListing,
                Widgets =metadata.Widgets,
                PageTypes = metadata.PageTypes ,
                Thumbnail           = metadata.Thumbnail,
                ThemePath           = metadata.ThemePath ,
                NodeConfiguration   = metadata.ThemeSettings.Items
            };

        }

        
       
    }
}
