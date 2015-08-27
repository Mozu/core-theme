using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Configuration;
using Mozu.Core.Logging;

namespace Mozu.SiteBuilder.Mvc.Mobile
{
    /// <summary>
    /// Provides mobile detection using <code>FiftyOne.Foundation.Mobile.Detection.MobileCapabilitiesProvider</code>
    /// For more information, see http://51degrees.mobi and http://51degrees.codeplex.com
    /// </summary>
    public class FiftyOneDegreesMobileDetectionProvider : IMobileDetectionProvider
    {
        private HttpContextBase _context;

        /// <summary>
        /// Constructor
        /// </summary>
        public FiftyOneDegreesMobileDetectionProvider(HttpContextBase context = null)
        {
            _context = context ?? new HttpContextWrapper(HttpContext.Current);
        }

        /// <summary>
        /// Returns true if the initiator of the current HTTP request is a mobile device.
        /// </summary>
        public bool IsCurrentRequestMobile
        {
            get
            {
                return IsMobile(isTablet: false);
            }
        }
        
        /// <summary>
        /// Returns true if the initiator of the current HTTP request is a tablet device.
        /// </summary>
        public bool IsCurrentRequestTablet
        {
            get {
                return IsMobile(isTablet:true);
            }
        }

        private bool IsMobile(bool isTablet)
        {
            if (
                !(HttpCapabilitiesBase.BrowserCapabilitiesProvider is
                    FiftyOne.Foundation.Mobile.Detection.MobileCapabilitiesProvider))
            {
                LoggingService.LoggerFor<FiftyOneDegreesMobileDetectionProvider>()
                    .Error(
                        "BrowserCapabilitiesProvider is not the one provided by FiftyOne.Foundation as expected. Mobile Detection is disabled.");
                return false;
            }
            return _context.Request.Browser.IsMobileDevice &&
                    isTablet == string.Equals(_context.Request.Browser["IsTablet"], "true", StringComparison.OrdinalIgnoreCase);
        }


        public bool IsCurrentRequestCrawler
        {
            get
            {
                return string.Equals(_context.Request.Browser["IsCrawler"], "true", StringComparison.OrdinalIgnoreCase);
            }
        }
    }
}
