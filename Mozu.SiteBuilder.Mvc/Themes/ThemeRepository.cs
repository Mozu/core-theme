using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.Themes.Exceptions;
using Mozu.SiteBuilder.Mvc.Themes.Factories;
using Mozu.SiteBuilder.UX.Models.Settings;
using Mozu.SiteBuilder.Mvc.Caching;
using Mozu.Core.Settings;

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

        DateTime GetLastWriteTime(string fileName);

        /// <summary>
        /// Finds a theme by name.
        /// If the theme is not found, returns the system default theme.
        /// </summary>
        Theme GetThemeOrDefault(ThemeSelection name);

        /// <summary>
        /// Returns the system default theme.
        /// </summary>
        Theme GetDefaultTheme();

       // string[] GetLocalThemePaths();

        string[] GetLocalThemesIds();
        void FixupPaths(Theme _theme);
    }


    public interface IThemeCache :  IStorefrontCache
    {

    }
    class ThemeCache : StorefrontCache , IThemeCache
    {
        public ThemeCache ( IStorefrontCacheControl cacheControl) :base( new Core.ApiContext(),  null, cacheControl )
        {
            if ( cacheControl == null)
            {
                throw new NotSupportedException();
            }
        }
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
        //  static ConcurrentDictionary<string, Theme> _themes = new ConcurrentDictionary<string, Theme>(StringComparer.OrdinalIgnoreCase);
        //   static ConcurrentDictionary<string, Theme> _themeSlims = new ConcurrentDictionary<string, Theme>(StringComparer.OrdinalIgnoreCase);
        //   static ConcurrentDictionary<string, FileSystemWatcher> _watchers = new ConcurrentDictionary<string, FileSystemWatcher>(StringComparer.OrdinalIgnoreCase);
        static ConcurrentDictionary<string, string> _themeToThemeKey = new ConcurrentDictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        IThemeCache _cache;
        ISettings _settings;

        public static readonly ThemeSelection DefaultThemeSelection = new ThemeSelection()
        {
            Id = Constants.DefaultTheme
        };

        readonly IThemeMetaDataProvider _themeMetaDataProvider;

        /// <summary>
        /// Public constructor.
        /// </summary>
        /// <param name="themeProvider"></param>
        public ThemeRepository(IThemeMetaDataProvider themeMetaDataProvider, IThemeCache cache , ISettings settings )
        {
            _cache = cache;
            _settings = settings;
            _themeMetaDataProvider = themeMetaDataProvider;
        }


        public void FixupPaths(Theme _theme)
        {
            if (! _theme.PathsAreFixed)
            {
                _themeMetaDataProvider.FixPaths(_theme);
                _theme.PathsAreFixed = true;
            }
            
        }
        private Theme GetFromCache ( string key )
        {
            return _cache.Get<Theme>(key, CacheScope.Global, StorefrontCacheTypes.CatalogIndependent);
        }

        private void AddToCache(string key, Theme theme, bool isSlim)
        {
            theme = theme ?? NullTheme;
            var filePaths = (_settings.AppSettingsAsNullableBool("sitebuilder.MonitorThemeChanges") ??
                        _settings.CoreSettings.ScaleUnitId.IndexOf("sb", StringComparison.OrdinalIgnoreCase) > -1  )
                        &&  theme.ThemePath != null 
                        ? new List<string> { theme.ThemePath } 
                        : null;
            _cache.Set(key, theme, CacheScope.Global, StorefrontCacheTypes.CatalogIndependent, (isSlim || Object.Equals( theme, NullTheme)) ? (Func<object,object>)null : CacheCallback, filePaths);
            _themeToThemeKey[key] = theme.Id;

        }
        object CacheCallback(object state)
        {
            var oldTheme = (Theme)state;
            if (oldTheme == null)
            {
                return null;
            }
            return this.CreateTheme(oldTheme.Id, new Stack<string>());

        }

        public bool UseFileSystemCaching => !(_settings.AppSettingsAsNullableBool("sitebuilder.DisableFileSystemCaching")
            .GetValueOrDefault(_settings.CoreSettings.ScaleUnitId.IndexOf("sb", StringComparison.OrdinalIgnoreCase) > -1));

        public DateTime GetLastWriteTime(string fileName)
        {
            if (!UseFileSystemCaching)
            {
                return System.IO.File.GetLastWriteTimeUtc(fileName);
            }
            return DateTime.MinValue;
            //var theme = _themeToThemeKey.Keys.Select( GetFromCache)
            //    .Where( x=> 
            //     x != null &&
            //        x.ThemePath != null
            //        && fileName.StartsWith(x.ThemePath, StringComparison.OrdinalIgnoreCase))
            //    .Select(x => x).FirstOrDefault();
            
            //if (theme != null)
            //{
            //    var vpath = fileName.Substring(theme.ThemePath.Length).TrimStart(new char[] { '\\' });
            //    var info = theme.FileListing.GetFileInfo(vpath, true);
            //    if (info != null)
            //    {
            //        return info.TimsStamp;
            //    }
            //}
            //return File.GetLastWriteTime(fileName);
        }

        /// <summary>
        /// Finds a theme by name.
        /// </summary>
        /// <exception cref="ThemeNotFoundException">If the theme is not found.</exception>        
        public Theme GetTheme(ThemeSelection selection)
        {
            return GetThemeInternal(selection.Id, new Stack<string>());
        }

        public Theme GetThemeSlim(ThemeSelection selection)
        {
            var key = "GetThemeSlim_" + selection.Id;
            var theme = GetFromCache(key);
            //var theme = _themeSlims.GetOrAdd(selection.Id, CreateThemeSlim);
            if ( theme == null )
            {
                theme = CreateThemeSlim(selection.Id);

            }
            if (theme ==  null)
            {
                // if dir is written after initially asked the 
                theme = CreateThemeSlim(selection.Id);
                AddToCache(key, theme, true);
            }
            if (object.Equals(theme , NullTheme))
            {
                return null;
            }

            return theme;
        }
        static Theme NullTheme = new Theme();

        Theme CreateThemeSlim(string themeId)
        {
            var tmd = _themeMetaDataProvider.GetThemeSlim(themeId);
            if (tmd == null)
            {
                return null;
            }
            var ret = ThemeFactory.Build(tmd, null);
        
            return ret;
        }

        /// <summary>
        /// Returns a theme if it is already loaded. If the theme is not loaded, attempts to loads theme metadata 
        /// from the filesystem and uses ThemeFactory to build it.
        /// If the theme extends another theme, it will make a recursive call to find and initialize the parent theme.
        /// </summary>
        Theme GetThemeInternal(string name, Stack<string> inheritChain)
        {
          
            var themeName = name ?? Constants.DefaultTheme;
            var key = "GetTheme_" + themeName;
            var theme = GetFromCache(key);
        
            if (theme == null)
            {
                lock( System.String.Intern(key))
                {
                    theme = GetFromCache(key);
                    if (theme == null)
                    {
                        theme = CreateTheme(themeName, inheritChain);
                        AddToCache(key, theme, false);
                    }
                }
            }
            
            if (object.Equals(theme, NullTheme))
            {
                return null;
            }

            return theme;


        }

       

        /// <summary>
        /// Loads theme metadata from the filesystem and uses ThemeFactory to build it.
        /// If the theme extends another theme, it will make a recursive call to find and initialize the parent theme.
        /// </summary>
        private Theme CreateTheme(string name, Stack<string> inheritChain)
        {
            // make sure that a theme isn't somehow trying to inherit from itself.
            if (inheritChain.Contains(name, StringComparer.OrdinalIgnoreCase))
                throw new ThemeInheritanceRecursionException(string.Format("Theme {0} cannot be its own ancestor. Stack: {1}", name, string.Join(" // ", inheritChain)));

            var tmd = _themeMetaDataProvider.GetTheme(name);
            if (tmd == null) return null;
            
            var parentName = tmd.Configuration.About.Extends;
            Theme parent = null;
            if (!string.IsNullOrEmpty(parentName))
            {
                inheritChain.Push(name);
                parent = GetThemeInternal(parentName, inheritChain);
                inheritChain.Pop();
            }
            
            var ret = ThemeFactory.Build(tmd, parent);
      
            return ret;
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
                    return GetTheme(selection) ??  GetDefaultTheme();
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

        public string[] GetLocalThemesIds()
        {
            List<string> themeIds = new List<string>();
            themeIds.Add(Mozu.SiteBuilder.Mvc.Constants.DefaultTheme);
            var di = new DirectoryInfo(_themeMetaDataProvider.LegacyThemePath+ "//themes");
            if (di.Exists)
            {
                themeIds.AddRange(di.GetDirectories().Select(x => x.Name));
            }
            return themeIds.ToArray();
        }

        //public string[] GetLocalThemePaths()
        //{
        //    return _themeMetaDataProvider.LocalThemePaths;
        //}

        public string GetLocalAddonPath()
        {
            return _themeMetaDataProvider.LocalAddonPath;
        }
    }
}
