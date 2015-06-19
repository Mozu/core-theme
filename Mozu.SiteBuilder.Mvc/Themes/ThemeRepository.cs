using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.Themes.Exceptions;
using Mozu.SiteBuilder.Mvc.Themes.Factories;
using Mozu.SiteBuilder.UX.Models.Settings;

namespace Mozu.SiteBuilder.Mvc.Themes
{
    /// <summary>
    /// A repository and factory for <code>ITheme</code>
    /// </summary>
    public interface IThemeRepository
    {
        /// <summary>
        /// Finds a theme by name.
        /// </summary>
        Theme GetTheme(ThemeSelection name);



        Theme GetThemeSlim(ThemeSelection name);


    

        /// <summary>
        /// Finds a theme by name.
        /// If the theme is not found, returns the system default theme.
        /// </summary>
        Theme GetThemeOrDefault(ThemeSelection name);

        /// <summary>
        /// Returns the system default theme.
        /// </summary>
        Theme GetDefaultTheme();

        string GetLocalThemePath();

       

 
    }
    
    /// <summary>
    /// A repository and factory for <code>ITheme</code>
    /// At startup, traverses the local 'Themes' directory and 
    /// instantiates themes based on their theme.xml descriptor.
    /// 
    /// This class is intended to be treated as a singleton 
    /// by the dependency injection framework.
    /// </summary>
     class ThemeRepository : IThemeRepository
    {
        private readonly IThemeMetaDataProvider _themeMetaDataProvider;
        
        private static ConcurrentDictionary<string, Theme> _themes = new ConcurrentDictionary<string, Theme>(StringComparer.OrdinalIgnoreCase);
        private static ConcurrentDictionary<string, Theme> _themeSlims = new ConcurrentDictionary<string, Theme>(StringComparer.OrdinalIgnoreCase);

       
        private static ConcurrentDictionary<string, FileSystemWatcher> _watchers = new ConcurrentDictionary<string, FileSystemWatcher>(StringComparer.OrdinalIgnoreCase);
        
        public static readonly  ThemeSelection DefaultThemeSelection = new ThemeSelection()
                                                             {
                                                                 Id = Mozu.SiteBuilder.Mvc.Constants.DefaultTheme 
                                                             };
        
        /// <summary>
        /// Public constructor.
        /// </summary>
        /// <param name="themeProvider"></param>
        public ThemeRepository(IThemeMetaDataProvider themeMetaDataProvider)
        {
            _themeMetaDataProvider = themeMetaDataProvider;
        }


        /// <summary>
        /// Finds a theme by name.
        /// </summary>
        /// <exception cref="ThemeNotFoundException">If the theme is not found.</exception>        
        public Theme GetTheme(ThemeSelection selection )
        {
            return GetThemeInternal(selection.Id , new Stack<string>());
        }

        public Theme GetThemeSlim(ThemeSelection selection)
        {
            return _themeSlims.GetOrAdd(selection.Id, (s) =>
            {
                var tmd=_themeMetaDataProvider.GetThemeSlim(s);
                if (tmd == null)
                {
                    return null;
                    
                }
                return ThemeFactory.Build(tmd, null);
            });




            // food//GetThemeSlim
        }
       



        /// <summary>
        /// Returns a theme if it is already loaded. If the theme is not loaded, attempts to loads theme metadata 
        /// from the filesystem and uses ThemeFactory to build it.
        /// If the theme extends another theme, it will make a recursive call to find and initialize the parent theme.
        /// </summary>
        private Theme GetThemeInternal(string name, Stack<string> inheritChain)
        {
            var t = _themes.GetOrAdd(name??Mozu.SiteBuilder.Mvc.Constants.DefaultTheme , themeName => CreateTheme(themeName, inheritChain));
            
            if (t == null)
                throw new ThemeNotFoundException("Requested theme was not found: " + name);

            _watchers.GetOrAdd(t.ThemePath, CreateWatcher);
            return t;
        }




        /// <summary>
        /// Loads theme metadata from the filesystem and uses ThemeFactory to build it.
        /// If the theme extends another theme, it will make a recursive call to find and initialize the parent theme.
        /// </summary>
        private Theme CreateTheme(string name, Stack<string> inheritChain)
        {
           
            
            // make sure that a theme isn't somehow trying to inherit from itself.
            if (inheritChain.Contains(name, StringComparer.OrdinalIgnoreCase))
                throw new ThemeInheritanceRecursionException(String.Format("Theme {0} cannot be its own ancestor. Stack: {1}", name, String.Join(" // ", inheritChain)));

            var tmd = _themeMetaDataProvider.GetTheme(name);
            if (tmd == null)
                return null;
            
            _watchers.GetOrAdd( tmd.ThemePath , CreateWatcher);

          
            string parentName = tmd.Configuration.About.Extends;
            Theme parent = null;
            if (!String.IsNullOrEmpty(parentName))
            {
                inheritChain.Push(name);
                parent = GetThemeInternal(parentName, inheritChain);
                inheritChain.Pop();
            }

            return ThemeFactory.Build(tmd, parent);
        }


      

        /// <summary>
        /// Watch the filesystem for changes to themes.
        /// </summary>
        

        private void watcher_Changed(object sender, FileSystemEventArgs e)
        {
            // replace _themes object instead of .Clear() to prevent the case of another thread Add()ing to the stale object right after clear.
            _themes = new ConcurrentDictionary<string, Theme>();
            _themeSlims = new ConcurrentDictionary<string, Theme>();

            _addons = new ConcurrentDictionary<string, Theme>();
        }

        private FileSystemWatcher CreateWatcher(string path)
        {
            var watcher = new FileSystemWatcher(path)
            {
                IncludeSubdirectories = true,
                EnableRaisingEvents = true
            };

            watcher.Changed += watcher_Changed;
            watcher.Created += watcher_Changed;
            watcher.Deleted += watcher_Changed;
            watcher.Renamed += watcher_Changed;
            watcher.Error += watcher_Error;
            return watcher;
        }

        void watcher_Error(object sender, ErrorEventArgs e)
        {
            FileSystemWatcher errordWatcher = sender as FileSystemWatcher;
            var key = _watchers.Where(x => x.Value == errordWatcher).Select(x=>x.Key).FirstOrDefault();
            Mozu.Core.Logging.LoggingService.LoggerFor<ThemeRepository>().Warn(string.Format("error in fileSystemWatcher [{0}]", key), e);
            if ( key != null)
            {
                _watchers.TryRemove( key, out errordWatcher);
            }
        }

        /// <summary>
        /// Finds a theme by name.
        /// If the theme is not found, returns the system default theme.
        /// </summary>
        public Theme GetThemeOrDefault(ThemeSelection selection )
        {
            try
            {
                if ( selection != null && !string.IsNullOrEmpty(selection.Id ))
                {
                    return GetTheme(selection);
                }
                return GetDefaultTheme();
            }
            catch (ThemeNotFoundException)
            {
                return GetDefaultTheme();
            }
        }

        /// <summary>
        /// Returns the system default theme.
        /// </summary>
        public Theme GetDefaultTheme()
        {
            return GetTheme(new ThemeSelection() { Id = Mozu.SiteBuilder.Mvc.Constants.DefaultTheme });
        }

        public string GetLocalThemePath()
        {
            return _themeMetaDataProvider.LocalThemePath;
        }

        public string GetLocalAddonPath()
        {
            return _themeMetaDataProvider.LocalAddonPath;
        }






        
    }
}
