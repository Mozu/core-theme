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


        /// <summary>
        /// Finds an addon by name.
        /// </summary>
        Theme GetAddon(string id );

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

        string GetLocalAddonPath();

        Theme ApplyAddons(Theme Theme, string[] addonsIds);
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
        const string DefaultTheme = "Core5";
        private static ConcurrentDictionary<string, Theme> _themes = new ConcurrentDictionary<string, Theme>(StringComparer.OrdinalIgnoreCase);
        private static ConcurrentDictionary<string, Theme> _addons = new ConcurrentDictionary<string, Theme>(StringComparer.OrdinalIgnoreCase);
        private static List<FileSystemWatcher> _watchers;
        
        public static readonly  ThemeSelection DefaultThemeSelection = new ThemeSelection()
                                                             {
                                                                 Id = DefaultTheme
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

        public Theme GetAddon(string name)
        {
            return _addons.GetOrAdd(name, ThemeFactory.Build(_themeMetaDataProvider.GetAddon(name), null));
           
        }



        public Theme ApplyAddons(Theme theme, string[] addonsIds)
        {
            Theme outTheme = theme;
            for (int i = addonsIds.Length - 1; i > 0; i--)
            {
                var addon = GetAddon(addonsIds[i]);
                if (addon != null)
                {
                    outTheme = ThemeFactory.Build(addon.Source , outTheme);
                }
                 
                
            }
            return outTheme;
           
        }



        /// <summary>
        /// Returns a theme if it is already loaded. If the theme is not loaded, attempts to loads theme metadata 
        /// from the filesystem and uses ThemeFactory to build it.
        /// If the theme extends another theme, it will make a recursive call to find and initialize the parent theme.
        /// </summary>
        private Theme GetThemeInternal(string name, Stack<string> inheritChain)
        {
            var t = _themes.GetOrAdd(name, themeName => CreateTheme(themeName, inheritChain));
            
            if (t == null)
                throw new ThemeNotFoundException("Requested theme was not found: " + name);

            return t;
        }

        /// <summary>
        /// Loads theme metadata from the filesystem and uses ThemeFactory to build it.
        /// If the theme extends another theme, it will make a recursive call to find and initialize the parent theme.
        /// </summary>
        private Theme CreateTheme(string name, Stack<string> inheritChain)
        {
            if (_watchers == null)
                InitializeFilesystemWatcher();
            
            // make sure that a theme isn't somehow trying to inherit from itself.
            if (inheritChain.Contains(name, StringComparer.OrdinalIgnoreCase))
                throw new ThemeInheritanceRecursionException(String.Format("Theme {0} cannot be its own ancestor. Stack: {1}", name, String.Join(" // ", inheritChain)));

            var tmd = _themeMetaDataProvider.GetTheme(name);
            if (tmd == null)
                return null;

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
        private void InitializeFilesystemWatcher()
        {
            if (_watchers == null)
            {
                lock (_themes)
                {
                    if (_watchers == null)
                    {
                        var watchers = new List<FileSystemWatcher>();
                        foreach (string dir in _themeMetaDataProvider.ThemePaths)
                        {
                            if (Directory.Exists(dir))
                            {
                                watchers.Add(CreateWatcher(dir));
                            }
                            else
                            {
                                throw new FileNotFoundException(String.Format("Cannot create watcher for theme path: \"{0}\" make sure it exists and the web process has access to it", dir));
                            }
                        }
                        System.Threading.Thread.MemoryBarrier();
                        _watchers = watchers;
                        //foreach (var dir in _themeMetaDataProvider.AddonPaths)
                        //{
                        //    if (Directory.Exists(dir))
                        //    {
                        //        _watchers.Add(CreateWatcher(dir));          
                        //    }

                        //}
                    }
                }
            }
        }

        private void watcher_Changed(object sender, FileSystemEventArgs e)
        {
            // replace _themes object instead of .Clear() to prevent the case of another thread Add()ing to the stale object right after clear.
            _themes = new ConcurrentDictionary<string, Theme>();
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

            return watcher;
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
            return GetTheme(new ThemeSelection() {Id = DefaultTheme});
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
