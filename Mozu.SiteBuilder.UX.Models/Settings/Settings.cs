using Mozu.SiteSettings.Order.Contracts;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;

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
        private readonly string _currenthostAndPrefix;

        public SiteDomains(string currenthostAndPrefix, List<SiteDomain> all)
        {
            _currenthostAndPrefix = currenthostAndPrefix;
            All = all;
        }

        public SiteDomain Current
        {
            get
            {
                if (_current == null)
                {
                    var currentHost = new Uri(_currenthostAndPrefix).Host;
                    _current = All.FirstOrDefault(x => string.Equals(_currenthostAndPrefix, x.DomainName, StringComparison.OrdinalIgnoreCase));
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

        public int SiteId { get; set; }
    }

    public class CheckoutSettings
    {
        public string CustomerCheckoutType { get; set; }

        public string PaymentProcessingFlowType { get; set; }

        public bool PayByMail { get; set; }

        public bool UseOverridePriceToCalculateDiscounts { get; set; }

        public bool IsPayPalEnabled { get; set; }

        public PurchaseOrderSettings PurchaseOrder { get; set; }

        public Dictionary<string, string> SupportedCards { get; set; }

        public VisaCheckoutSettings VisaCheckout { get; set; }

        public List<ExternalPaymentWorkflowSettings> ExternalPaymentWorkflowSettings { get; set; }

        public Dictionary<string, string> SupportedGiftCards { get; set; }

        public PaymentSettings PaymentSettings { get; set; }
    }

    public class ExternalPaymentWorkflowSettings
    {
        public string Name { get; set; }
        public string Namespace { get; set; }
        public string FullyQualifiedName { get; set; }
        public bool IsEnabled { get; set; }
        public List<ThirdPartyCredentialField> Credentials { get; set; }
    }

    public class ThirdPartyCredentialField
    {
        public string DisplayName { get; set; }
        public string APIName { get; set; }
        public string Value { get; set; }
        public string InputType { get; set; }
        public List<VocabularyValue> VocabularyValues { get; set; }
    }

    public class VocabularyValue
    {
        public string Key { get; set; }

        public List<LocalizedContent> Contents { get; set; }
    }

    public class LocalizedContent
    {
        public string LocaleCode { get; set; }

        public string Value { get; set; }
    }

    public class PurchaseOrderSettings
    {
        public bool IsEnabled { get; set; }
        public bool AllowSplitPayment { get; set; }
        public List<CustomField> CustomFields { get; set; }
        public List<PaymentTerm> PaymentTerms { get; set; }
    }

    public class CustomField
    {
        public string Code { get; set; }
        public string Label { get; set; }
        public bool IsEnabled { get; set; }
        public bool IsRequired { get; set; }
        public int SequenceNumber { get; set; }
    }

    public class PaymentTerm
    {
        public string Description { get; set; }
        public int SequenceNumber { get; set; }
        public string Code { get; set; }
    }

    /// <summary>
    /// Holds Visa Checkout specific settings
    /// </summary>
    public class VisaCheckoutSettings
    {
        public bool IsEnabled { get; set; }
        public string ClientId { get; set; }
        public string ApiKey { get; set; }
    }

    public class EmailTransactionSettings
    {
        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? BackInStock { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? OrderChanged { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? OrderShipped { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? OrderFulfillmentDetailsChanged { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? ShopperLoginCreated { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? ShopperPasswordReset { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? ReturnCreated { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? ReturnAuthorized { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? ReturnUpdated { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? ReturnRejected { get; set; }

        /// <summary>
        /// There is no corresponding template for this in the Core theme.
        /// </summary>
        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? ReturnCancelled { get; set; }

        /// <summary>
        /// This controls "email/product-return-received" in the Core theme.
        /// </summary>
        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? ReturnClosed { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? RefundCreated { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? StoreCreditCreated { get; set; }

        /// <summary>
        /// The corresponding topic is not currently used by Mozu.
        /// </summary>
        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? StoreCreditUpdated { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? GiftCardCreated { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? OrderCancellation { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? Backorder { get; set; }

        //[JsonProperty(NullValueHandling = NullValueHandling.Include)]
        //public bool? BackorderUpdate { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? ShipmentConfirmation { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? OrderPickupReady { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? OrderPickupReminder { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? ShipmentBackorderDateChanged { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? ShipmentItemCanceled { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? ShipmentAssigned { get; set; }


        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? TransferShipmentCreated { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? TransferShipmentShipped { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? PartialPickupReady { get; set; }
        [JsonProperty(NullValueHandling = NullValueHandling.Include)]
        public bool? TransferShipmentCreatedByFulfiller { get; set; } 
        
    }

    [DataContract]
    public class GeneralSettings
    {
        public GeneralSettings()
        {
            //ViewModeToggles = new ViewModeToggles();
        }
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

        [DataMember/*(Name = "senderEmailAlias")*/]
        public string SenderEmailAlias { get; set; }

        [DataMember/*(Name = "channelId")*/]
        public string ChannelId { get; set; }

        [DataMember/*(Name = "channelId")*/]
        public string CdnCacheBustKey { get; set; }

        [DataMember/*(Name = "channelId")*/]
        public string MissingImageSubstitute { get; set; }

        [DataMember]
        public string BccEmailAddress { get; set; }

        [DataMember/*(Name = "replyToEmail")*/]
        public string ReplyToEmailAddress { get; set; }

        [DataMember(EmitDefaultValue = true)]
        public EmailTransactionSettings SupressedEmailTransactions { get; set; }

        [DataMember(EmitDefaultValue = false/*, Name = "logoPath"*/)]
        public string LogoPath { get; set; }

        [DataMember(EmitDefaultValue = false/*, Name = "logoText"*/)]
        public string LogoText { get; set; }

        [DataMember(EmitDefaultValue = false/*, Name = "favIconMobilePath"*/)]
        public string FavIconMobilePath { get; set; }

        [DataMember(EmitDefaultValue = false/*, Name = "favIconPath"*/)]
        public string FavIconPath { get; set; }

        //[DataMember(Name = "themeStr")]
        //[Obsolete("Theme doesn't mean what it used to mean. You probably want DesktopTheme.")]
        public string ThemeStr { get; set; }

        [DataMember/*(Name = "mobileThemeStr")*/]
        public string MobileThemeStr { get; set; }

        public ThemeSelection MobileTheme { get; set; }

        [DataMember/*(Name = "desktopTheme")*/]
        public ThemeSelection DesktopTheme { get; set; }

        [DataMember/*(Name = "tabletTheme")*/]
        public ThemeSelection TabletTheme { get; set; }

        [DataMember/*(Name = "googleAnalyticsId")*/]
        public string GoogleAnalyticsCode { get; set; }

        [DataMember/*(Name = "googleAnalyticsEnabled")*/]
        public bool? IsGoogleAnalyticsEnabled { get; set; }

        [DataMember/*(Name = "googleAnalyticsEcomEnabled")*/]
        public bool? IsGoogleAnalyticsEcommerceEnabled { get; set; }

        [DataMember/*(Name = "isWishlistCreationEnabled")*/]
        public bool? IsWishlistCreationEnabled { get; set; }

        [DataMember/*(Name = "IsMultishipEnabled")*/]
        public bool? IsMultishipEnabled { get; set; }

        [DataMember/*(Name = "allowInvalidAddresses")*/]
        public bool? AllowInvalidAddresses { get; set; }

        [DataMember/*(Name = "isAddressValidationEnabled")*/]
        public bool? IsAddressValidationEnabled { get; set; }

        [DataMember]
        public bool? IsRequiredLoginForLiveEnabled { get; set; }

        [DataMember]
        public bool? IsRequiredLoginForStagingEnabled { get; set; }

        [DataMember]
        public string CustomCdnHostName { get; set; }

        [DataMember]
        public List<EmailTypeSettingVM> EmailTypes { get; set; }

        [DataMember]
        public bool? EnforceSitewideSSL { get; set; }

        public CheckoutSettings CheckoutSetting { get; set; }
    }

    public class ViewModeToggles
    {
        [DataMember]
        public bool? EnforceSitewideSSL { get; set; }
        [DataMember]
        public bool IsRequiredLoginForLiveEnabled { get; set; }
        [DataMember]
        public bool IsRequiredLoginForStagingEnabled { get; set; }
    }

    public class ThemeSelection
    {
        public string Id { get; set; }
        public string Location { get; set; }
        public List<string> Addons { get; set; }
    }
}