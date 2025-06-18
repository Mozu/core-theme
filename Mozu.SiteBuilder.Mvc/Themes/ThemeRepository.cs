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
using Microsoft.Extensions.Logging;
using Mozu.SiteBuilder.Mvc;

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
        
        /// <summary>
        /// Invalidates cache for a specific theme
        /// </summary>
        void InvalidateTheme(string themeId);
        
        /// <summary>
        /// Invalidates all theme caches
        /// </summary>
        void InvalidateAllThemes();
        
        /// <summary>
        /// Gets the count of cached themes
        /// </summary>
        int GetCachedThemeCount();
        
        /// <summary>
        /// Checks if a theme is currently cached
        /// </summary>
        bool IsThemeCached(string themeId);
        
        /// <summary>
        /// Pre-loads commonly used themes into cache
        /// </summary>
        Task WarmupCache(IEnumerable<string> themeIds);
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
        static ConcurrentDictionary<string, AsyncSemaphore> _themeLocks = new ConcurrentDictionary<string, AsyncSemaphore>();

        IThemeCache _cache;
        ISettings _settings;

        public static readonly ThemeSelection DefaultThemeSelection = new ThemeSelection()
        {
            Id = Constants.DefaultTheme
        };

        readonly IThemeMetaDataProvider _themeMetaDataProvider;
        readonly ILogger<ThemeRepository> _logger;

        /// <summary>
        /// Public constructor.
        /// </summary>
        /// <param name="themeProvider"></param>
        public ThemeRepository(IThemeMetaDataProvider themeMetaDataProvider, IThemeCache cache , ISettings settings , ILogger<ThemeRepository> logger)
        {
            if (themeMetaDataProvider == null)
            {
                throw new ArgumentNullException(nameof(themeMetaDataProvider));
            }
            if (cache == null)
            {
                throw new ArgumentNullException(nameof(cache));
            }
            if (settings == null)
            {
                throw new ArgumentNullException(nameof(settings));
            }
            
            _themeMetaDataProvider = themeMetaDataProvider;
            if (logger == null)
            {
                throw new ArgumentNullException(nameof(logger));
            }
            _logger = logger;
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
                
                // Invalidate cache since theme has been updated
                InvalidateTheme(theme.Id);
            }
        }

        private Theme GetFromCache ( string key )
        {
            var theme = _cache.Get<Theme>(key, CacheScope.Global, StorefrontCacheTypes.CatalogIndependent);
            
            // Log cache hit/miss for monitoring
            if (theme != null)
            {
                _logger.LogInformation($"Theme cache HIT for key: {key}");
            }
            else
            {
                _logger.LogInformation($"Theme cache MISS for key: {key}");
            }
            
            return theme;
        }

        private void AddToCache(string key, Theme theme, bool isSlim)
        {
            if (!isSlim && theme != null)
            {
                _lookups[theme.Id] = new WeakReference<Theme>(theme);
            }
            
            // Store all themes (both slim and full) in distributed cache
            if (theme != null)
            {
                _cache.Set(key, theme, CacheScope.Global, StorefrontCacheTypes.CatalogIndependent);
                _logger.LogInformation($"Theme cached with key: {key}");
            }
        }
        
        /// <summary>
        /// Helper method to ensure consistent cache key generation
        /// </summary>
        private static string GenerateThemeCacheKey(string themeId, bool isSlim)
        {
            var prefix = isSlim ? "GetThemeSlim_" : "GetTheme_";
            return prefix + themeId;
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
            var key = GenerateThemeCacheKey(selection.Id, true);
            var theme = GetFromCache(key);
            
            if (theme == null)
            {
                // Use async locking to prevent concurrent processing of the same theme
                var semaphore = _themeLocks.GetOrAdd(key, _ => new AsyncSemaphore(1));
                
                await semaphore.WaitAsync().ConfigureAwait(false);
                try
                {
                    // Double-check cache after acquiring lock
                    theme = GetFromCache(key);
                    if (theme == null)
                    {
                        theme = await CreateThemeSlim(selection.Id).ConfigureAwait(false);
                        AddToCache(key, theme, true);
                    }
                }
                finally
                {
                    semaphore.Release();
                }
            }
            
            if (object.Equals(theme, NullTheme))
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
            var key = GenerateThemeCacheKey(themeName, false);
            var theme = GetFromCache(key);

            if (theme == null)
            {
                // Use async locking to prevent concurrent processing of the same theme
                var semaphore = _themeLocks.GetOrAdd(key, _ => new AsyncSemaphore(1));
                
                await semaphore.WaitAsync().ConfigureAwait(false);
                try
                {
                    // Double-check cache after acquiring lock
                    theme = GetFromCache(key);
                    if (theme == null)
                    {
                        theme = await CreateTheme(themeName, inheritChain).ConfigureAwait(false);
                        AddToCache(key, theme, false);
                    }
                }
                finally
                {
                    semaphore.Release();
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
        
        /// <summary>
        /// Invalidates cache for a specific theme
        /// </summary>
        public void InvalidateTheme(string themeId)
        {
            if (string.IsNullOrEmpty(themeId))
                return;

            // Remove from weak reference cache
            _lookups.TryRemove(themeId, out _);

            // Create cache keys that might exist for this theme
            var fullThemeKey = GenerateThemeCacheKey(themeId, false);
            var slimThemeKey = GenerateThemeCacheKey(themeId, true);

            // Note: IStorefrontCache doesn't have a direct Remove method,
            // but setting to null effectively invalidates the entry
            _cache.Set(fullThemeKey, null, CacheScope.Global, StorefrontCacheTypes.CatalogIndependent);
            _cache.Set(slimThemeKey, null, CacheScope.Global, StorefrontCacheTypes.CatalogIndependent);
            
            _logger.LogInformation($"Invalidated theme cache for: {themeId}");
        }

        /// <summary>
        /// Invalidates all theme caches
        /// </summary>
        public void InvalidateAllThemes()
        {
            // Clear weak reference cache
            _lookups.Clear();
            
            _logger.LogInformation("Invalidated all theme caches");

            // Note: For a complete invalidation, we would need access to the underlying
            // cache provider to clear by pattern or tag. This is a basic implementation
            // that at least clears the in-memory weak references.
            // In a production system, consider implementing cache tags or patterns
            // for more efficient bulk invalidation.
        }

        /// <summary>
        /// Gets the count of themes currently in the weak reference cache
        /// </summary>
        public int GetCachedThemeCount()
        {
            return _lookups.Count;
        }

        /// <summary>
        /// Checks if a theme is currently cached (in weak reference cache)
        /// </summary>
        public bool IsThemeCached(string themeId)
        {
            if (string.IsNullOrEmpty(themeId))
                return false;
                
            return _lookups.TryGetValue(themeId, out var weakRef) && 
                   weakRef.TryGetTarget(out _);
        }

        /// <summary>
        /// Pre-loads commonly used themes into cache for better performance
        /// </summary>
        public async Task WarmupCache(IEnumerable<string> themeIds)
        {
            if (themeIds == null)
                return;

            var tasks = themeIds.Select(async themeId =>
            {
                try
                {
                    await GetThemeSlim(new ThemeSelection { Id = themeId }).ConfigureAwait(false);
                    _logger.LogInformation($"Warmed up theme cache for: {themeId}");
                }
                catch (Exception ex)
                {
                    // Ignore individual theme loading failures during warmup
                    _logger.LogWarning(ex, $"Failed to warm up theme cache for: {themeId}");
                }
            });

            await Task.WhenAll(tasks).ConfigureAwait(false);
        }
    }
}
