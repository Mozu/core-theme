using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using Mozu.Core.Api.Descriptor;
using Mozu.Core.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.Models.Settings
{
    [DataContract]
    public class RobotsTxtSettings : ModelBase
    {
        [DataMember(Name = "content")]
        public string Content { get; set; }
    }

    public class SiteDomains
    {
        private SiteDomain _primary;
        private SiteDomain _current;
        private string _currenthostAndPrefix;


        public SiteDomains(string currenthostAndPrefix, List<SiteDomain> all)
        {
         
            this._currenthostAndPrefix = currenthostAndPrefix;
            this.All = all;
        }

        public SiteDomain Current
        {
            get
            {
                if (_current == null)
                {
                    var currentHost = new Uri(_currenthostAndPrefix).Host;
                    _current = All.FirstOrDefault(x => string.Equals(_currenthostAndPrefix, x.DomainName , StringComparison.OrdinalIgnoreCase ));
                    if (_current == null)
                    {
                        _current = Primary;
                    }
                }
                return _current;
            }
        }
        public SiteDomain Primary
        {
            get
            {
                if (_primary == null)
                {
                    _primary = All.FirstOrDefault(x => x.IsPrimary);
                    if (_primary == null)
                    {
                        _primary = All.FirstOrDefault();
                    }
                }
                return _primary;
            }
        }
        public List<SiteDomain> All { get; set; } 
    }
    public class SiteDomain
    {
        public string DomainName { get; set; }


        public bool IsPrimary { get; set; }



        public bool IsSystemAssigned { get; set; }

        public bool IsDomainManaged { get; set; }

    }
   
    public class CheckoutSettings
    {
        public string CustomerCheckoutType { get; set; }

        public string PaymentProcessingFlowType { get; set; }

        public bool PayByMail { get; set; }

        public bool UseOverridePriceToCalculateDiscounts { get; set; }
    
        public bool IsPayPalEnabled { get; set; }

        public Dictionary<string, string> SupportedCards { get; set; }
    }
   

    [DataContract]
    public class GeneralSettings
    {
   
        //moved to site def in tenant. not editable
        //[DataMember(Name = "isMozuWebSite")]
        //public bool IsMozuWebSite { get; set; }

        [DataMember/*(Name = "templateSiteId")*/]
        public int? TemplateSiteId { get; set; }

        [DataMember/*(Name = "websiteName")*/]
        public string WebsiteName { get; set; }

        [DataMember/*(Name = "timeZone")*/]
        public string SiteTimeZone { get; set; }

        [DataMember/*(Name = "timeFormat")*/]
        public string SiteTimeFormat { get; set; }

        [DataMember/*(Name = "daylightSaving")*/]
        public bool AdjustForDaylightSavingTime { get; set; }

        [DataMember/*(Name = "allowAllIps")*/]
        public bool AllowAllIPs { get; set; }


        [DataMember/*(Name = "senderEmail")*/]
        public string SenderEmailAddress { get; set; }

        [DataMember/*(Name = "senderEmailName")*/]
        public string SenderEmailAddressName
        {
            get { return SenderEmailAddress; }
            set { }
        }


        [DataMember/*(Name = "channelId")*/]
        public string ChannelId { get; set; }


        [DataMember/*(Name = "replyToEmail")*/]
        public string ReplyToEmailAddress { get; set; }


        [DataMember(EmitDefaultValue = false/*, Name = "logoPath"*/)]
        public string LogoPath { get; set; }

        [DataMember(EmitDefaultValue = false/*, Name = "logoText"*/)]
        public string LogoText { get; set; }

        [DataMember(EmitDefaultValue = false/*, Name = "favIconMobilePath"*/)]
        public string FavIconMobilePath { get; set; }

        [DataMember(EmitDefaultValue = false/*, Name = "favIconPath"*/)]
        public string FavIconPath { get; set; }



        

        //[DataMember(Name = "themeStr")]
       // [Obsolete("Theme doesn't mean what it used to mean. You probably want DesktopTheme.")]
        public string ThemeStr
        {
            get; set;
        }



     
            
        [DataMember/*(Name = "mobileThemeStr")*/]
        public string MobileThemeStr
        {
            get; set;
        }


        public ThemeSelection MobileTheme
        {
            get; set;
        }
        [DataMember/*(Name = "desktopTheme")*/]
        public ThemeSelection DesktopTheme
        {
            get;
            set;
        }
        
        [DataMember/*(Name = "tabletTheme")*/]
        public ThemeSelection TabletTheme
        {
            get;
            set;
        }

        [DataMember/*(Name = "googleAnalyticsId")*/]
        public string GoogleAnalyticsCode { get; set; }

        [DataMember/*(Name = "googleAnalyticsEnabled")*/]
        public bool? IsGoogleAnalyticsEnabled { get; set; }

        [DataMember/*(Name = "googleAnalyticsEcomEnabled")*/]
        public bool? IsGoogleAnalyticsEcommerceEnabled { get; set; }

        [DataMember/*(Name = "isWishlistCreationEnabled")*/]
        public bool? IsWishlistCreationEnabled { get; set; }

        [DataMember/*(Name = "allowInvalidAddresses")*/]
        public bool? AllowInvalidAddresses { get; set; }

        [DataMember/*(Name = "isAddressValidationEnabled")*/]
        public bool? IsAddressValidationEnabled { get; set; }

         
    }

    public class ThemeSelection
    {
        public string Id { get; set; }
        public string Location { get; set; }

        public List<string> Addons { get; set; }
    }
}