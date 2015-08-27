using System;

namespace Mozu.SiteBuilder.Mvc.Mobile
{
    /// <summary>
    /// Provides mobile detection capabilities for the current HttpRequest.
    /// </summary>
    public interface IMobileDetectionProvider
    {
        /// <summary>
        /// Returns true if the initiator of the current HTTP request is a mobile device.
        /// </summary>
        bool IsCurrentRequestMobile { get; }
        
        /// <summary>
        /// Returns true if the initiator of the current HTTP request is a tablet device.
        /// </summary>
        bool IsCurrentRequestTablet { get; }

        bool IsCurrentRequestCrawler { get; }

    }
}
