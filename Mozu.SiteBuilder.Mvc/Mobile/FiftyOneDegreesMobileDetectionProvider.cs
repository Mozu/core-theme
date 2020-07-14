using System;
using System.Collections.Concurrent;
using Microsoft.AspNetCore.Http;
using Mozu.AppDev.Contracts.Public;
using Mozu.Core.Logging;
using DeviceDetectorNET;
using DeviceDetectorNET.Cache;
using DeviceDetectorNET.Parser;

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

        /// <summary>
        /// Constructor
        /// </summary>
        public FiftyOneDegreesMobileDetectionProvider(HttpContext context = null)
        {
            _context = context;
            DeviceDetector.SetVersionTruncation(VersionTruncation.VERSION_TRUNCATION_BUILD);
            var uAgent = (string)context?.Request?.Headers["User-Agent"];
            var dd = new DeviceDetector(uAgent);

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
                // handle bots,spiders,crawlers,...
                this.IsCurrentRequestCrawler = true;
            }
            else
            {
               
                
                this.IsCurrentRequestTablet = dd.IsMobile() && (
                    dd.GetModel() == "iPad" ||
                    uAgent?.Contains("tablet", StringComparison.OrdinalIgnoreCase) == true);
                this.IsCurrentRequestMobile = !this.IsCurrentRequestTablet  && dd.IsMobile();


            }
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
