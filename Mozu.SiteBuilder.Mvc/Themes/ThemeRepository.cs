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
using System.Threading.Tasks;

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
        Task<Theme> GetTheme(ThemeSelection name);

        Task<Theme> GetThemeSlim(ThemeSelection name);

        DateTime GetLastWriteTime(string theme, string fileName);

        /// <summary>
        /// Finds a theme by name.
        /// If the theme is not found, returns the system default theme.
        /// </summary>
        Task<Theme> GetThemeOrDefault(ThemeSelection name);

        /// <summary>
        /// Returns the system default theme.
        /// </summary>
        Task<Theme> GetDefaultTheme();

       // string[] GetLocalThemePaths();

        string[] GetLocalThemesIds();
        void FixupPaths(Theme theme);

        Task  ValidateLatest(Theme theme);
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
        static ConcurrentDictionary<string, WeakReference<Theme>> _lookups = new ConcurrentDictionary<string, WeakReference<Theme>>();


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
                AddToCache(_theme.Id, _theme, false);
            }
            
            
        }

        public async  Task ValidateLatest(Theme theme)
        {
            var themeJson = theme.FileListing.GetFileInfo("theme.json", true);
            if ( themeJson == null)
            {
                return;
            }

            if (!await _themeMetaDataProvider.IsLatest(theme.Id, theme.TimeStamp).ConfigureAwait(false))
            {
                var themePath = new FileInfo(themeJson.FullPath).Directory.FullName;
                var fileListings = await _themeMetaDataProvider.GetThemeFileListing(themePath, theme.Id).ConfigureAwait(false);

                theme.FileListing = fileListings;
                theme.TimeStamp = fileListings.TimeStamp;
                theme.Hash = fileListings.Hash;

            }
        }

        private Theme GetFromCache ( string key )
        {
            return _cache.Get<Theme>(key, CacheScope.Global, StorefrontCacheTypes.CatalogIndependent);
        }

        private void AddToCache(string key, Theme theme, bool isSlim)
        {
            if(!isSlim && theme != null)
            {
                _lookups[theme.Id] = new WeakReference<Theme>(theme);
            }
            
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
            .GetValueOrDefault(_settings.CoreSettings.ScaleUnitId.IndexOf("sb", StringComparison.OrdinalIgnoreCase) == -1));

        public DateTime GetLastWriteTime(string themeId, string virtPath)
        {
            if (!UseFileSystemCaching)
            {
                return DateTime.MinValue;
            }
            WeakReference<Theme> weakTheme;
            Theme theme;
            if ( _lookups.TryGetValue(themeId, out weakTheme) && weakTheme.TryGetTarget(out theme))
            {
                var fileInfo= theme?.FileListing.GetFileInfo(virtPath, true);
                if (fileInfo!=null)
                {
                    return fileInfo.TimsStamp;
                }
            }
            return DateTime.MinValue;
            
        }

        /// <summary>
        /// Finds a theme by name.
        /// </summary>
        /// <exception cref="ThemeNotFoundException">If the theme is not found.</exception>        
        public Task<Theme> GetTheme(ThemeSelection selection)
        {
            return GetThemeInternal(selection.Id, new Stack<string>());
        }

        public async Task<Theme> GetThemeSlim(ThemeSelection selection)
        {
            var key = "GetThemeSlim_" + selection.Id;
            var theme = GetFromCache(key);
            //var theme = _themeSlims.GetOrAdd(selection.Id, CreateThemeSlim);
            if ( theme == null )
            {
                theme = await CreateThemeSlim(selection.Id).ConfigureAwait(false);

            }
            if (theme ==  null)
            {
                // if dir is written after initially asked the 
                theme = await CreateThemeSlim(selection.Id).ConfigureAwait(false);
                AddToCache(key, theme, true);
            }
            if (object.Equals(theme , NullTheme))
            {
                return null;
            }

            return theme;
        }
        static Theme NullTheme = new Theme();

        async Task<Theme> CreateThemeSlim(string themeId)
        {
            var tmd = await _themeMetaDataProvider.GetThemeSlim(themeId).ConfigureAwait(false);
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
        async Task<Theme> GetThemeInternal(string name, Stack<string> inheritChain)
        {
          
            var themeName = name ?? Constants.DefaultTheme;
            var key = "GetTheme_" + themeName;
            var theme = GetFromCache(key);

            if (theme == null)
            {
                //todo:phipps add locking back in 
                //lock( System.String.Intern(key))
                //{
                //    theme = GetFromCache(key);
                //    if (theme == null)
                //    {
                //        theme = await CreateTheme(themeName, inheritChain).ConfigureAwait(false);
                //        AddToCache(key, theme, false);
                //    }
                //}


               
                if (theme == null)
                {
                    theme = await CreateTheme(themeName, inheritChain).ConfigureAwait(false);
                    AddToCache(key, theme, false);
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
        private async Task<Theme> CreateTheme(string name, Stack<string> inheritChain)
        {
            // make sure that a theme isn't somehow trying to inherit from itself.
            if (inheritChain.Contains(name, StringComparer.OrdinalIgnoreCase))
                throw new ThemeInheritanceRecursionException(string.Format("Theme {0} cannot be its own ancestor. Stack: {1}", name, string.Join(" // ", inheritChain)));

            var tmd = await _themeMetaDataProvider.GetTheme(name).ConfigureAwait(false);
            if (tmd == null) return null;
            
            var parentName = tmd.Configuration.About.Extends;
            Theme parent = null;
            if (!string.IsNullOrEmpty(parentName))
            {
                inheritChain.Push(name);
                parent = await GetThemeInternal(parentName, inheritChain).ConfigureAwait(false);
                inheritChain.Pop();
            }
            
            var ret = ThemeFactory.Build(tmd, parent);
      
            return ret;
        }

      


        /// <summary>
        /// Finds a theme by name.
        /// If the theme is not found, returns the system default theme.
        /// </summary>
        public async Task<Theme> GetThemeOrDefault(ThemeSelection selection )
        {
            try
            {
                if ( selection != null && !string.IsNullOrEmpty(selection.Id ))
                {
                    var theme =  await GetTheme(selection).ConfigureAwait(false);
                    if (theme == null)
                    {
                        theme = await GetDefaultTheme().ConfigureAwait(false);
                    }
                    return theme;
                }
                return await GetDefaultTheme().ConfigureAwait(false);
            }
            catch (ThemeNotFoundException)
            {
                return await GetDefaultTheme().ConfigureAwait(false);
            }
        }

        /// <summary>
        /// Returns the system default theme.
        /// </summary>
        public Task<Theme> GetDefaultTheme()
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
