using System;
using System.Collections.Concurrent;
using Microsoft.AspNetCore.Http;
using Mozu.AppDev.Contracts.Public;
using Mozu.Core.Logging;
using DeviceDetectorNET;
using DeviceDetectorNET.Cache;
using DeviceDetectorNET.Parser;
using Microsoft.CodeAnalysis;

namespace Mozu.SiteBuilder.Mvc.Mobile
{
     
    /// <summary>
    /// Provides mobile detection using <code>FiftyOne.Foundation.Mobile.Detection.MobileCapabilitiesProvider</code>
    /// For more information, see http://51degrees.mobi and http://51degrees.codeplex.com
    /// </summary>
    public class FiftyOneDegreesMobileDetectionProvider : IMobileDetectionProvider
    {
        static ICache Cache = new CacheImple();
        private readonly HttpContext _context;
        
        class CacheImple : ICache
        {
            ConcurrentDictionary<string,object> _inner = new ConcurrentDictionary<string, object>();
            public CacheImple (){}
            
            public object Fetch(string id)
            {
                if (_inner.TryGetValue(id, out var val))
                {
                    return val;
                }

                return null;
            }

            public bool Contains(string id)
            {
                return _inner.ContainsKey(id);
            }

            public bool Save(string id, object data, int lifeTime = 0)
            {
                _inner[id] = data;
                return true;
            }

            public bool Delete(string id)
            {
                return _inner.TryRemove(id, out var val);
                
            }

            public bool FlushAll()
            {
                _inner.Clear();
                return true;
            }
        }
        static ConcurrentDictionary<string,LookupResult> _lookupCache = new ConcurrentDictionary<string, LookupResult>();
        class LookupResult
        {
            public bool IsBot { get; set; }
            public bool IsCurrentRequestTablet { get; set; }
            public bool IsCurrentRequestMobile { get; set; }
            
        }
        /// <summary>
        /// Constructor
        /// </summary>
        public FiftyOneDegreesMobileDetectionProvider(HttpContext context = null)
        {
            var uAgent = (string)context?.Request?.Headers["User-Agent"];
            LookupResult lookupResult = null;

            if (uAgent != null && !_lookupCache.TryGetValue(uAgent, out lookupResult))
            {
                lookupResult = CreateLookupResult(uAgent);
                _lookupCache[uAgent] = lookupResult;
            }

            if (_lookupCache.Count > 10000)
            {
                _lookupCache.Clear();
            }

            IsCurrentRequestCrawler = lookupResult?.IsBot ?? false;
            IsCurrentRequestMobile = lookupResult?.IsCurrentRequestMobile ?? false;
            IsCurrentRequestTablet = lookupResult?.IsCurrentRequestTablet ?? false;
        }

        LookupResult CreateLookupResult(string userAgent)
        {
            var result = new LookupResult();
            DeviceDetector.SetVersionTruncation(VersionTruncation.VERSION_TRUNCATION_MAJOR);
            var dd = new DeviceDetector(userAgent);
            // OPTIONAL: Set caching method
            // By default static cache is used, which works best within one php process (memory array caching)
            // To cache across requests use caching in files or memcache
            // add using DeviceDetectorNET.Cache;
            dd.SetCache(Cache);
            // OPTIONAL: If called, GetBot() will only return true if a bot was detected  (speeds up detection a bit)
            dd.DiscardBotInformation();
            // OPTIONAL: If called, bot detection will completely be skipped (bots will be detected as regular devices then)
            //  dd.SkipBotDetection();
            dd.Parse();
            if (dd.IsBot())
            {
                result.IsBot = true;
            }
            else
            {                
                result.IsCurrentRequestTablet = dd.IsTablet();
                result.IsCurrentRequestMobile = result.IsCurrentRequestTablet ? false : dd.IsMobile();
            }

            return result;
        }

        /// <summary>
        /// Returns true if the initiator of the current HTTP request is a mobile device.
        /// </summary>
        public bool IsCurrentRequestMobile
        {
            get;
            set;
        }
        
        /// <summary>
        /// Returns true if the initiator of the current HTTP request is a tablet device.
        /// </summary>
        public bool IsCurrentRequestTablet
        {
            get;
            set;
        }

        public bool IsCurrentRequestCrawler
        {
            get;
            set;
        }
    }
}
