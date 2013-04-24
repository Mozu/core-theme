using System;

using Mozu.SiteBuilder.Mvc.Cms;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.UX.Models;
using System.Dynamic;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.UX.Models.Navigation;
using System.Collections.Generic;

namespace Mozu.SiteBuilder.Mvc
{
    public interface ISiteBuilderContext : IEditableContext 
    {
        bool IsDebugMode { get; set; }
        //SiteConfiguration SiteConfiguration { get;  }

        int TenantId { get; set; }
        int? SiteId { get; set; }
        int? SiteGroupId { get; set; }
       
        PageContext PageContext { get; set; }
        ICatalogContext CatalogContext { get; set; }
        ISearchContext SearchContext { get; set; }
        NavigationContext Navigation { get; }
        object this[string key] { get; set; }
        RuntimeConfigurationFieldCollection ThemeSettings { get;  }
        ISettingsRepository Settings { get; }
        void Save();

        IThemeSettingsRepository ThemeSettingsRepository { get; }

        /// <summary>
        /// Returns true if the visitor is using a mobile device.
        /// </summary>
        bool IsVisitorMobile { get; }

        /// <summary>
        /// Returns the current theme.
        /// If the visitor is a mobile visitor and there is a mobile theme 
        /// chosen for the current site, returns the value of <code>MobileTheme</code>.
        /// Otherwise, returns the value of <code>DesktopTheme</code>.
        /// </summary>
        Theme  Theme { get; }

        /// <summary>
        /// Returns the site's desktop theme.
        /// </summary>
        Theme DesktopTheme { get; }

        /// <summary>
        /// Returns the site's mobile theme, if one is set. 
        /// Otherwise returns null.
        /// </summary>
        Theme MobileTheme { get; }

        /// <summary>
        /// Returns the currently set GoogleAnalyticsCode or null if not set.
        /// </summary>
        string GoogleAnalyticsCode { get; }
        bool GoogleAnalyticsEnabled { get; }
        bool GoogleAnalyticsEcommerceEnabled { get; }
    }
}
