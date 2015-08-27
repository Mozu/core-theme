using System;

namespace Mozu.SiteBuilder.Mvc.Mobile
{
    /// <summary>
    /// Does nothing to provide mobile detection.
    /// Every visitor will be detected as a desktop browser.
    /// </summary>
    public class NoOpMobileDetectionProvider : IMobileDetectionProvider
    {
        public bool IsCurrentRequestMobile
        {
            get { return false; }
        }

        public bool IsCurrentRequestTablet
        {
            get { return false; }
        }

        public bool IsCurrentRequestCrawler
        {
            get { return false; }
        }
    }
}
