using System;
using System.Net;
using System.Net.Http;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.UX.Areas.Misc.Controllers;
using NDjango.Interfaces;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Routing;
using NDjango.FiltersCS.Compatibility;
using Microsoft.Extensions.DependencyInjection;
using Mozu.SiteBuilder.Mvc.Caching;
using Microsoft.Extensions.Logging;
using Mozu.Core.Logging;
using System.Threading.Tasks;
using System.Collections.Concurrent;
using Mozu.SiteBuilder.Mvc;

namespace Mozu.SiteBuilder.UX.Hypr.Tags
{
    /// <summary>
    /// simular to the style filter although instead outputs all the css rules inline.   Used primarily for email templates
    /// </summary>
    [Name("inline_style")]
    public class InlineStyle : SimpleTagBase
    {
        // Static cache for compiled CSS content
        private static readonly ConcurrentDictionary<string, string> _cssCache = new ConcurrentDictionary<string, string>();
        private static readonly ConcurrentDictionary<string, AsyncSemaphore> _cssLocks = new ConcurrentDictionary<string, AsyncSemaphore>();
        
        /// <summary>
        /// Generates a cache key for the CSS path
        /// </summary>
        private static string GenerateCacheKey(string path)
        {
            return $"InlineStyle_CSS_{path}";
        }
        
        /// <summary>
        /// Gets CSS content from cache or generates it if not cached
        /// </summary>
        private async Task<string> GetCachedCssContent(string path, IStorefrontCache cache, IContext context, ILogger<InlineStyle> logger)
        {
            var cacheKey = GenerateCacheKey(path);
            
            // Check distributed cache first
            var cachedContent = cache.Get<string>(cacheKey, CacheScope.Global, StorefrontCacheTypes.CatalogIndependent);
            
            if (cachedContent != null)
            {
                logger.LogInformation($"InlineStyle cache HIT for path: {path}");
                return cachedContent;
            }
            
            // Check in-memory cache
            if (_cssCache.TryGetValue(path, out var memoryCached))
            {
                logger.LogInformation($"InlineStyle memory cache HIT for path: {path}");
                return memoryCached;
            }
            
            logger.LogInformation($"InlineStyle cache MISS for path: {path}");
            
            // Use async locking to prevent concurrent processing of the same CSS file
            var semaphore = _cssLocks.GetOrAdd(path, _ => new AsyncSemaphore(1));
            
            await semaphore.WaitAsync().ConfigureAwait(false);
            try
            {
                // Double-check cache after acquiring lock
                cachedContent = cache.Get<string>(cacheKey, CacheScope.Global, StorefrontCacheTypes.CatalogIndependent);
                if (cachedContent != null)
                {
                    return cachedContent;
                }
                
                if (_cssCache.TryGetValue(path, out memoryCached))
                {
                    return memoryCached;
                }
                
                // Generate CSS content
                var cssContent = await GenerateCssContent(path, context, logger).ConfigureAwait(false);
                
                // Store in both caches
                if (!string.IsNullOrEmpty(cssContent))
                {
                    _cssCache[path] = cssContent;
                    cache.Set(cacheKey, cssContent, CacheScope.Global, StorefrontCacheTypes.CatalogIndependent);
                    logger.LogInformation($"InlineStyle cached content for path: {path}");
                }
                
                return cssContent ?? string.Empty;
            }
            finally
            {
                semaphore.Release();
            }
        }
        
        /// <summary>
        /// Generates CSS content by processing the stylesheet
        /// </summary>
        private async Task<string> GenerateCssContent(string path, IContext context, ILogger<InlineStyle> logger)
        {
            try
            {
                var fact = ActivatorUtilities.CreateFactory(typeof(ResourceController), Type.EmptyTypes);
                var controller = (ResourceController)fact(context.ViewContext().LifetimeScope, arguments: null);
                controller.ControllerContext.HttpContext = context.HttpContext();
                
                if (!(controller.Stylesheets(path) is ResourceController.MozuVirtualFileResult result))
                {
                    return "/* error rendering stylesheet " + path + " */";
                }

                using var stream = new System.IO.MemoryStream();
                result.WriteFile(stream);
                stream.Position = 0;
                using var sr = new System.IO.StreamReader(stream, System.Text.Encoding.UTF8);
                return await sr.ReadToEndAsync().ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error generating CSS content for path: {path}");
                return "/* error rendering stylesheet */";
            }
        }
        protected override IEnumerable<WalkResult> ProcessTag(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunction)
        {
            try
            {
                var cache = context.Resolve<IStorefrontCache>();
                var path = (string)arguments[0].Value;
                var logger = context.Resolve<ILogger<InlineStyle>>();
                
                // Use async method to get cached CSS content
                var cssContentTask = GetCachedCssContent(path, cache, context, logger);
                var cssContent = cssContentTask.GetAwaiter().GetResult(); // Sync wait for compatibility with the interface
                
                return new[] { WalkResultHelpers.Buffer(cssContent) };
            }
            catch (Exception ex)
            {
                var logger = context.Resolve<ILogger<InlineStyle>>();
                logger.LogError(ex, $"Error in ProcessTag for InlineStyle");
                return new[] { WalkResultHelpers.Buffer("/* error rendering stylesheet */") };
            }
        }
        
        /// <summary>
        /// Invalidates cache for a specific CSS path
        /// </summary>
        public static void InvalidateCssCache(string path, ILogger<InlineStyle> logger = null)
        {
            if (string.IsNullOrEmpty(path))
                return;
                
            // Remove from in-memory cache
            _cssCache.TryRemove(path, out _);
            
            // Note: For distributed cache invalidation, you would need access to IStorefrontCache
            // This method is primarily for clearing the in-memory cache
            if (logger != null)
                logger.LogInformation($"Invalidated CSS cache for path: {path}");
            else
                LoggingService.LoggerFor<InlineStyle>().Info($"Invalidated CSS cache for path: {path}");
        }
        
        /// <summary>
        /// Invalidates distributed cache for a specific CSS path using IStorefrontCache
        /// </summary>
        public static void InvalidateCssCache(string path, IStorefrontCache cache, ILogger<InlineStyle> logger = null)
        {
            if (string.IsNullOrEmpty(path))
                return;
                
            // Remove from in-memory cache
            _cssCache.TryRemove(path, out _);
            
            // Remove from distributed cache by setting to null
            var cacheKey = GenerateCacheKey(path);
            cache.Set(cacheKey, null, CacheScope.Global, StorefrontCacheTypes.CatalogIndependent);
            
            if (logger != null)
                logger.LogInformation($"Invalidated CSS cache (both memory and distributed) for path: {path}");
            else
                LoggingService.LoggerFor<InlineStyle>().Info($"Invalidated CSS cache (both memory and distributed) for path: {path}");
        }
        
        /// <summary>
        /// Clears all cached CSS content
        /// </summary>
        public static void ClearAllCssCache(ILogger<InlineStyle> logger = null)
        {
            _cssCache.Clear();
            
            if (logger != null)
                logger.LogInformation("Cleared all CSS cache");
            else
                LoggingService.LoggerFor<InlineStyle>().Info("Cleared all CSS cache");
        }
        
        /// <summary>
        /// Gets the count of cached CSS entries
        /// </summary>
        public static int GetCachedCssCount()
        {
            return _cssCache.Count;
        }
        
        /// <summary>
        /// Checks if a CSS path is currently cached in memory
        /// </summary>
        public static bool IsCssCached(string path)
        {
            return !string.IsNullOrEmpty(path) && _cssCache.ContainsKey(path);
        }
    }
}