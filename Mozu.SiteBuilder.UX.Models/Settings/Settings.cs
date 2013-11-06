using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Settings
{
    public interface IWebToolsSetting
    {
    }

    [DataContract]
    public class WebmasterToolsSettings : ModelBase, IWebToolsSetting
    {
        [DataMember(Name = "metaTag")]
        public string MetaTag { get; set; }
    }

    [DataContract]
    public class RobotsTxtSettings : ModelBase, IWebToolsSetting
    {
        [DataMember(Name = "content")]
        public string Content { get; set; }
    }

    [DataContract]
    public class PaymentSettings
    {
        [DataMember(Name = "supportedCards")]
        public List<KeyValuePair<string, string>> SupportedCards { get; set; }
    }

   
    public class CheckoutSettings
    {

        public string CustomerCheckoutType { get; set; }


        public string PaymentProcessingFlowType { get; set; }


        public bool PayByMail { get; set; }


        public bool UseOverridePriceToCalculateDiscounts { get; set; }

       
    
        public bool IsPayPalEnabled { get; set; }




    }

    [DataContract]
    public class SettingsContainer
    {
        [DataMember(Name = "general")]
        public GeneralSettings General { get; set; }
    }

   

    [DataContract]
    public class GeneralSettings
    {
        /// <summary>
        ///     "Theme" has been overridden in the UI to contain both the desktop and possibly mobile theme concatenated in one string.
        /// </summary>
        private string _theme;

        //moved to site def in tenant. not editable
        //[DataMember(Name = "isMozuWebSite")]
        //public bool IsMozuWebSite { get; set; }

        [DataMember(Name = "templateSiteId")]
        public int? TemplateSiteId { get; set; }

        [DataMember(Name = "websiteName")]
        public string WebsiteName { get; set; }

        [DataMember(Name = "timeZone")]
        public string SiteTimeZone { get; set; }

        [DataMember(Name = "timeFormat")]
        public string SiteTimeFormat { get; set; }

        [DataMember(Name = "daylightSaving")]
        public bool AdjustForDaylightSavingTime { get; set; }

        [DataMember(Name = "allowAllIps")]
        public bool AllowAllIPs { get; set; }


        [DataMember(Name = "senderEmail")]
        public string SenderEmailAddress { get; set; }

        [DataMember(Name = "senderEmailName")]
        public string SenderEmailAddressName
        {
            get { return "Mr. Not Inservicesyet"; }
            set { }
        }


        [DataMember(Name = "channelId")]
        public string ChannelId { get; set; }


        [DataMember(Name = "replyToEmail")]
        public string ReplyToEmailAddress { get; set; }


        [DataMember(EmitDefaultValue = false, Name = "logoPath")]
        public string LogoPath { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "logoText")]
        public string LogoText { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "favIconMobilePath")]
        public string FavIconMobilePath { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "favIconPath")]
        public string FavIconPath { get; set; }

        [DataMember(Name = "theme")]
        [Obsolete("Theme doesn't mean what it used to mean. You probably want DesktopTheme.")]
        public string Theme
        {
            get { return _theme; }
            set { _theme = value; }
        }


        [DataMember(Name = "mobileTheme")]
        public string MobileTheme { get; set; }


        [DataMember(Name = "googleAnalyticsId")]
        public string GoogleAnalyticsCode { get; set; }

        [DataMember(Name = "googleAnalyticsEnabled")]
        public bool? IsGoogleAnalyticsEnabled { get; set; }

        [DataMember(Name = "googleAnalyticsEcomEnabled")]
        public bool? IsGoogleAnalyticsEcommerceEnabled { get; set; }

        public string DesktopTheme
        {
            get { return _theme; }
            set { _theme = value; }
        }
    }
}