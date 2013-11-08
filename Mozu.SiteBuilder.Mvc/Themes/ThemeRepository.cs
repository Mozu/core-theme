using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Mozu.SiteBuilder.Mvc.Themes.Exceptions;
using Mozu.SiteBuilder.Mvc.Themes.Factories;

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
        Theme GetTheme(string name);


        /// <summary>
        /// Finds an addon by name.
        /// </summary>
        Theme GetAddon(string name);

        /// <summary>
        /// Finds a theme by name.
        /// If the theme is not found, returns the system default theme.
        /// </summary>
        Theme GetThemeOrDefault(string name);

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
    internal class ThemeRepository : IThemeRepository
    {
        private readonly ThemeFactory _themeFactory;
        private readonly IThemeMetaDataProvider _themeMetaDataProvider;
        private const string DEFAULT_THEME = "Core4";
        private static System.Collections.Concurrent.ConcurrentDictionary<string, Theme> _themes = new ConcurrentDictionary<string, Theme>(StringComparer.OrdinalIgnoreCase);
        private static System.Collections.Concurrent.ConcurrentDictionary<string, Theme> _addons = new ConcurrentDictionary<string, Theme>(StringComparer.OrdinalIgnoreCase);
        private static List<System.IO.FileSystemWatcher> _watchers = null;
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
            return GetThemeInternal(name, new Stack<string>());
        }

        public Theme GetAddon(string name)
        {
            return _addons.GetOrAdd(name, _themeFactory.Build(_themeMetaDataProvider.GetAddon(name), null));
           
        }



        public Theme ApplyAddons(Theme theme, string[] addonsIds)
        {
            Theme outTheme = theme;
            for (int i = addonsIds.Length - 1; i > 0; i--)
            {
                var addon = GetAddon(addonsIds[i]);
                if (addon != null)
                {
                    outTheme = _themeFactory.Build(addon.Source , outTheme);
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

            return _themeFactory.Build(tmd, parent);
        }

        /// <summary>
        /// Watch the filesystem for changes to themes.
        /// </summary>
        private void InitializeFilesystemWatcher()
        {
            lock (_themes)
            {
                if (_watchers == null)
                {
                    _watchers = new List<FileSystemWatcher>();
                    foreach (string dir in _themeMetaDataProvider.ThemePaths)
                    {
                        _watchers.Add(CreateWatcher(dir));
                    }
                    foreach (var dir in _themeMetaDataProvider.AddonPaths)
                    {
                        if (System.IO.Directory.Exists(dir))
                        {
                            _watchers.Add(CreateWatcher(dir));          
                        }
                        
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

        /// <summary>
        /// Returns the system default theme.
        /// </summary>
        public Theme GetDefaultTheme()
        {
            return GetTheme(DEFAULT_THEME);
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
