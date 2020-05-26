using AutoMapper;
using Mozu.SiteBuilder.UX.Models.Settings;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Dynamic;
using System.Text.RegularExpressions;
using DC = Mozu.SiteSettings.Order.Contracts;
using GDC = Mozu.SiteSettings.General.Contracts;

namespace Mozu.SiteBuilder.Mvc.Models.ModelMapping
{
    public class GeneralSettingsMapping : Profile
    {
        public GeneralSettingsMapping()
        {
            //  CreateMap<Mozu.SiteSettings.General.Contracts.GeneralSettings, UX.Models.Settings.GeneralSettings>();
            CreateMap<Mozu.Tenant.Contracts.Domain, SiteDomain>();

            CreateMap<DC.ThirdPartyCredentialField, UX.Models.Settings.ThirdPartyCredentialField>()
                ;

            CreateMap<DC.LocalizedContent, UX.Models.Settings.LocalizedContent>()
                ;

            CreateMap<DC.VocabularyValue, UX.Models.Settings.VocabularyValue>()
                ;

            CreateMap<DC.ExternalPaymentWorkflowDefinition, ExternalPaymentWorkflowSettings>()
                .ForMember(x => x.Credentials, opt => opt.MapFrom(src => src.Credentials.Where(c => c.IsSensitive.HasValue && !c.IsSensitive.Value)))
                ;

            CreateMap<DC.PurchaseOrderCustomField, CustomField>()
                .ForMember(x => x.IsEnabled, opt => opt.MapFrom(dc => dc.IsEnabled))
                .ForMember(x => x.IsRequired, opt => opt.MapFrom(dc => dc.IsRequired))
                .ForMember(x => x.Code, opt => opt.MapFrom(dc => dc.Code))
                .ForMember(x => x.Label, opt => opt.MapFrom(dc => dc.Label))
                .ForMember(x => x.SequenceNumber, opt => opt.MapFrom(dc => dc.SequenceNumber))
                ;

            CreateMap<CustomField, DC.PurchaseOrderCustomField>()
                .ForMember(dc => dc.IsEnabled, op => op.MapFrom(x => x.IsEnabled))
                .ForMember(dc => dc.IsRequired, op => op.MapFrom(x => x.IsRequired))
                .ForMember(dc => dc.Code, op => op.MapFrom(x => x.Code))
                .ForMember(dc => dc.Label, op => op.MapFrom(x => x.Label))
                .ForMember(dc => dc.SequenceNumber, opt => opt.MapFrom(x => x.SequenceNumber))
                ;

            CreateMap<DC.PurchaseOrderPaymentTerm, PaymentTerm>()
                .ForMember(x => x.SequenceNumber, opt => opt.MapFrom(dc => dc.SequenceNumber))
                .ForMember(x => x.Description, opt => opt.MapFrom(dc => dc.Description))
                .ForMember(x => x.Code, op => op.MapFrom(dc => dc.Code))
                ;

            CreateMap<PaymentTerm, DC.PurchaseOrderPaymentTerm>()
                .ForMember(dc => dc.SequenceNumber, opt => opt.MapFrom(x => x.SequenceNumber))
                .ForMember(dc => dc.Description, opt => opt.MapFrom(x => x.Description))
                .ForMember(dc => dc.Code, op => op.MapFrom(x => x.Code))
                ;

            CreateMap<DC.PurchaseOrderPaymentDefinition, PurchaseOrderSettings>()
                ;

            CreateMap<DC.CheckoutSettings, UX.Models.Settings.CheckoutSettings>()
                .ForMember(x => x.CustomerCheckoutType, opt => opt.MapFrom(x => x.CustomerCheckoutSettings.CustomerCheckoutType))
                .ForMember(x => x.IsPayPalEnabled, opt => opt.MapFrom(x => x.PaymentSettings.ExternalPaymentWorkflowDefinitions != null && x.PaymentSettings.ExternalPaymentWorkflowDefinitions.Any(expwd => string.Equals(expwd.Name, DC.Constants.ThirdPartyPayment.PAYPAL_EXPRESS, System.StringComparison.OrdinalIgnoreCase) && expwd.IsEnabled)))
                .ForMember(x => x.ExternalPaymentWorkflowSettings, opt => opt.MapFrom<GetExternalPaymentWorkflowSettings>())
               .ForMember(x => x.VisaCheckout, opt => opt.MapFrom<GetVisaCheckoutSettings>())
                .ForMember(x => x.PayByMail, opt => opt.MapFrom(x => x.PaymentSettings.PayByMail))
                .ForMember(x => x.PurchaseOrder, opt => opt.MapFrom(x => x.PaymentSettings.PurchaseOrder))
                .ForMember(x => x.PaymentProcessingFlowType, opt => opt.MapFrom(x => x.OrderProcessingSettings.PaymentProcessingFlowType))
                // .ForMember(x => x.SupportedCards, opt => opt.MapFrom(x => (x.PaymentSettings.Gateways ?? Enumerable.Empty<DC.Gateway>()).Where(g => g.GatewayAccount != null && g.GatewayAccount.IsActive).Select(g => g.SupportedCards.ToDictionary(card => card)).FirstOrDefault() ?? new Dictionary<string, string>()))
                .ForMember(x => x.SupportedCards, opt => opt.MapFrom<SupportedCardsWithCountryCodeContextResolver>())
                .ForMember(x => x.UseOverridePriceToCalculateDiscounts, opt => opt.MapFrom(x => x.OrderProcessingSettings.UseOverridePriceToCalculateDiscounts))
                .ForMember(x => x.SupportedGiftCards, opt => opt.MapFrom<SupportedGiftCardsResolver>())
                ;

            CreateMap<Mozu.Reference.Contracts.TimeZone, UX.Models.Settings.TimeZone>()
                .ForMember(x => x.Selected, op => op.Ignore());

            CreateMap<GDC.EmailTypeSetting, EmailTypeSettingVM>()
                .ForMember(m => m.Enabled, op => op.Ignore())
                .ForMember(m => m.OnlyOnApiRequest, op => op.Ignore());

            CreateMap<GDC.GeneralSettings, GeneralSettings>()
                //ignores
                .ForMember(m => m.AdjustForDaylightSavingTime, op => op.Ignore())
                .ForMember(m => m.AllowAllIPs, op => op.Ignore())
                .ForMember(m => m.CdnCacheBustKey, op => op.MapFrom(x => x.CacheSettings != null ? x.CacheSettings.CdnCacheBustKey : null))
                .ForMember(m => m.MissingImageSubstitute, op => op.MapFrom(x => x.MissingImageSubstitute))
                .ForMember(m => m.EmailTypes, op => op.MapFrom(x => x.EmailTypes))
                .ForMember(m => m.CustomCdnHostName, op => op.MapFrom(x => x.CustomCdnHostName))

                //  .ForMember(m => m.CdnCacheBustKey, op => op.MapFrom(x => x.CustomCdnHostName))
                //  .ForMember(m => m.CheckoutSetting, op => op.MapFrom(x => x.CheckoutSetting))
                .ForMember(m => m.IsWishlistCreationEnabled, op => op.MapFrom(x => x.IsWishlistCreationEnabled))
                .ForMember(m => m.IsMultishipEnabled, op => op.MapFrom(x => x.IsMultishipEnabled))
                .ForMember(m => m.SupressedEmailTransactions, op => op.MapFrom(x => x.SupressedEmailTransactions))
                .ForMember(m => m.ChannelId, op => op.Ignore())
                .ForMember(m => m.TemplateSiteId, op => op.MapFrom(dc => dc.TemplateSiteId))
                 .ForMember(m => m.BccEmailAddress, op => op.MapFrom(dc => dc.BccEmailAddress))
                 .ForMember(m => m.DesktopTheme, opt => opt.MapFrom(x => !string.IsNullOrEmpty(x.Theme) ?
                    Deserialize(x.Theme) :
                    new ThemeSelection()
                ))
                .ForMember(m => m.MobileTheme, opt => opt.MapFrom(x => !string.IsNullOrEmpty(x.MobileTheme) ?
                    Deserialize(x.MobileTheme) :
                    null
                ))
                .ForMember(m => m.TabletTheme, opt => opt.MapFrom(x => !string.IsNullOrEmpty(x.TabletTheme) ?
                    Deserialize(x.TabletTheme) :
                    null
                ))
                .ForMember(m => m.IsRequiredLoginForLiveEnabled, opt => opt.MapFrom((GDC.GeneralSettings x) => x.ViewAuthorizations.RequireAuthForLive))
                .ForMember(m => m.EnforceSitewideSSL, opt => opt.MapFrom((GDC.GeneralSettings x) => x.ViewAuthorizations.EnforceSitewideSSL))
                .ForMember(m => m.IsRequiredLoginForStagingEnabled, opt => opt.MapFrom((GDC.GeneralSettings x) => x.ViewAuthorizations.RequireAuthForPending))
                .ForMember(x => x.SliceSearchByDefault, opt => opt.Ignore());
            CreateMap<GDC.General.ViewAuthorizations, GeneralSettings>()
                .ForMember(x => x.IsRequiredLoginForLiveEnabled, opt => opt.MapFrom((GDC.General.ViewAuthorizations y) => y.RequireAuthForLive))
                .ForMember(x => x.EnforceSitewideSSL, opt => opt.MapFrom((GDC.General.ViewAuthorizations y) => y.EnforceSitewideSSL))
                .ForMember(x => x.IsRequiredLoginForStagingEnabled, opt => opt.MapFrom((GDC.General.ViewAuthorizations y) => y.RequireAuthForPending))
                .ForMember(x => x.SliceSearchByDefault, opt => opt.Ignore());
            CreateMap<ViewModeToggles, GDC.General.ViewAuthorizations>()
                .ForMember((GDC.General.ViewAuthorizations va) => va.RequireAuthForLive, op => op.MapFrom((ViewModeToggles vm) => vm.IsRequiredLoginForLiveEnabled))
                 .ForMember((GDC.General.ViewAuthorizations va) => va.EnforceSitewideSSL, op => op.MapFrom((ViewModeToggles vm) => vm.EnforceSitewideSSL))
                .ForMember((GDC.General.ViewAuthorizations va) => va.RequireAuthForPending, op => op.MapFrom((ViewModeToggles vm) => vm.IsRequiredLoginForStagingEnabled));

            CreateMap<GDC.General.ViewAuthorizations, ViewModeToggles>()
                .ForMember((ViewModeToggles vm) => vm.IsRequiredLoginForLiveEnabled, op => op.MapFrom((GDC.General.ViewAuthorizations va) => va.RequireAuthForLive))
                .ForMember((ViewModeToggles vm) => vm.EnforceSitewideSSL, op => op.MapFrom((GDC.General.ViewAuthorizations va) => va.EnforceSitewideSSL))
                .ForMember((ViewModeToggles vm) => vm.IsRequiredLoginForStagingEnabled, op => op.MapFrom((GDC.General.ViewAuthorizations va) => va.RequireAuthForPending));

            CreateMap<GeneralSettings, GDC.General.ViewAuthorizations>()
                .ForMember(x => x.RequireAuthForLive, opt => opt.MapFrom((GeneralSettings gs) => gs.IsRequiredLoginForLiveEnabled))
                .ForMember(x => x.EnforceSitewideSSL, opt => opt.MapFrom((GeneralSettings gs) => gs.EnforceSitewideSSL))
                .ForMember(x => x.RequireAuthForPending, opt => opt.MapFrom((GeneralSettings gs) => gs.IsRequiredLoginForStagingEnabled));

            //   .ForMember(x => x.IPBlocks, o => o.MapFrom(x => x.IPBlocks != null ? x.IPBlocks.Items : new List<Mozu.SiteSettings.General.Contracts.IPBlock>()));
            CreateMap<GeneralSettings, GDC.GeneralSettings>()
                .ForMember(m => m.CacheSettings, op => op.MapFrom(x => new GDC.CacheSettings() { CdnCacheBustKey = x.CdnCacheBustKey }))
                //ignores
                .ForMember(dc => dc.IsMozuWebSite, op => op.Ignore())
                .ForMember(dc => dc.CustomCdnHostName, op => op.MapFrom(x => x.CustomCdnHostName))
                .ForMember(dc => dc.IsWishlistCreationEnabled, op => op.MapFrom(x => x.IsWishlistCreationEnabled))
                .ForMember(dc => dc.MissingImageSubstitute, op => op.MapFrom(x => x.MissingImageSubstitute))
                .ForMember(m => m.BccEmailAddress, op => op.MapFrom(dc => dc.BccEmailAddress))

                .ForMember(dc => dc.TaxableTerritories, op => op.Ignore())
                .ForMember(dc => dc.AuditInfo, op => op.Ignore())
                .ForMember(dc => dc.Theme, op => op.MapFrom(x => Serialize(x.DesktopTheme)))
                .ForMember(dc => dc.MobileTheme, op => op.MapFrom(x => (x.MobileTheme == null || string.IsNullOrEmpty(x.MobileTheme.Id)) ? null : Serialize(x.MobileTheme)))
                .ForMember(dc => dc.TabletTheme, op => op.MapFrom(x => (x.TabletTheme == null || string.IsNullOrEmpty(x.TabletTheme.Id)) ? null : Serialize(x.TabletTheme)))
                .ForMember(dc => dc.TemplateSiteId, op => op.MapFrom(x => x.TemplateSiteId))
                .ForMember(dc => dc.ViewAuthorizations, opt => opt.MapFrom((GeneralSettings x) => Mapper.Map<GDC.General.ViewAuthorizations>(x)));

            CreateMap<Mozu.SiteSettings.General.Contracts.EmailTransactionSettings, EmailTransactionSettings>();
            CreateMap<EmailTransactionSettings, Mozu.SiteSettings.General.Contracts.EmailTransactionSettings>();
        }
        static Regex isBase64 = new Regex("^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$");
        public static ThemeSelection Deserialize(string val)
        {
            if (string.IsNullOrEmpty(val))
            {
                return null;
            }
            if (isBase64.IsMatch(val))
            {
                try
                {
                    var bytes = Convert.FromBase64String(val);
                    var ms = new MemoryStream(bytes);
                    var serializer = JsonSerializer.CreateDefault();

                    var jtr = new JsonTextReader(new StreamReader(ms));

                    return serializer.Deserialize<ThemeSelection>(jtr);
                }
                catch
                {

                }
            }
            return new ThemeSelection() { Id = val };
        }

        static string Serialize(ThemeSelection val)
        {
            var ms = new MemoryStream();
            var serializer = JsonSerializer.CreateDefault();
            var sw = new StreamWriter(ms);
            var jtw = new JsonTextWriter(sw);

            serializer.Serialize(jtw, val);
            jtw.Flush();
            return Convert.ToBase64String(ms.ToArray());
        }

        private class GetExternalPaymentWorkflowSettings : IValueResolver<DC.CheckoutSettings, UX.Models.Settings.CheckoutSettings , List<ExternalPaymentWorkflowSettings>>
        {

            public List<ExternalPaymentWorkflowSettings> Resolve(DC.CheckoutSettings source, UX.Models.Settings.CheckoutSettings destination, List<ExternalPaymentWorkflowSettings> destMember, ResolutionContext context)
            {
                if (source == null || source.PaymentSettings == null || source.PaymentSettings.ExternalPaymentWorkflowDefinitions == null)
                {
                    return new List<ExternalPaymentWorkflowSettings>();
                }

                return
                    Mapper.Map<List<ExternalPaymentWorkflowSettings>>(source.PaymentSettings.ExternalPaymentWorkflowDefinitions);

            }
        }

        private class GetVisaCheckoutSettings : IValueResolver<DC.CheckoutSettings, UX.Models.Settings.CheckoutSettings, VisaCheckoutSettings>
        {
            public VisaCheckoutSettings Resolve(DC.CheckoutSettings source, UX.Models.Settings.CheckoutSettings destination, VisaCheckoutSettings destMember, ResolutionContext context)
            {
                var settings = new VisaCheckoutSettings();
                if (source.PaymentSettings.ExternalPaymentWorkflowDefinitions != null)
                {
                    DC.ExternalPaymentWorkflowDefinition externalPayment = source.PaymentSettings
                        .ExternalPaymentWorkflowDefinitions.Find(
                            expwd =>
                                string.Equals(expwd.Name, DC.Constants.ThirdPartyPayment.VISA_CHECKOUT,
                                    System.StringComparison.OrdinalIgnoreCase));
                    if (externalPayment != null)
                    {
                        settings.IsEnabled = externalPayment.IsEnabled;
                        if (externalPayment.Credentials != null)
                        {
                            settings.ClientId = externalPayment.Credentials.Any(data => data.APIName == "CLIENTID")
                                ? externalPayment.Credentials.Find(data => data.APIName == "CLIENTID").Value
                                : string.Empty;

                            settings.ApiKey = externalPayment.Credentials.Any(data => data.APIName == "APIKEY")
                                ? externalPayment.Credentials.Find(data => data.APIName == "APIKEY").Value
                                : string.Empty;

                        }
                    }
                }
                return settings;
            }
        }

        private class SupportedGiftCardsResolver : IValueResolver<object, object, Dictionary<string, string>>
        {
            Dictionary<string, string> IValueResolver<object, object, Dictionary<string, string>>.Resolve(object source, object destination, Dictionary<string, string> destMember, ResolutionContext context)
            {
                List<DC.Gateway> allGateways = ((DC.CheckoutSettings)source).PaymentSettings.Gateways ?? new List<DC.Gateway>(0);
                IEnumerable<DC.Gateway> filteredGateways = from g in allGateways
                                                           where g.GatewayAccount != null && (g.SiteGatewaySupportedCards != null && g.SiteGatewaySupportedCards.Any(x => x.PaymentType.Equals("gc", StringComparison.OrdinalIgnoreCase)))
                                                           select g;


                var cards = filteredGateways != null ? filteredGateways.SelectMany(g => g.SiteGatewaySupportedCards).Where(x => x.PaymentType.Equals("gc", StringComparison.OrdinalIgnoreCase)).Select(x => x.CardTypeId).Distinct().ToDictionary(c => c) : new Dictionary<string, string>();

                return cards;
            }
        }

        /// <summary>
        /// Custom value resolver that respects countryCode as a mapping context option
        /// And will choose a list of supported cards from a gateway in that country only.
        /// </summary>
        private class SupportedCardsWithCountryCodeContextResolver : IValueResolver<object, object, Dictionary<string, string>>
        {
            Dictionary<string, string> IValueResolver<object, object, Dictionary<string, string>>.Resolve(object source, object destination, Dictionary<string, string> destMember, ResolutionContext context)
            {
                List<DC.Gateway> allGateways = ((DC.CheckoutSettings)source).PaymentSettings.Gateways ?? new List<DC.Gateway>(0);
                IEnumerable<DC.Gateway> filteredGateways = from g in allGateways
                                                           where g.GatewayAccount != null && (g.SiteGatewaySupportedCards != null && g.SiteGatewaySupportedCards.Any(x => x.PaymentType.Equals("cc", StringComparison.OrdinalIgnoreCase)))
                                                           select g;

                var cards = filteredGateways != null ? filteredGateways.SelectMany(g => g.SiteGatewaySupportedCards).Where(x => x.PaymentType.Equals("cc", StringComparison.OrdinalIgnoreCase)).Select(x => x.CardTypeId).Distinct().ToDictionary(c => c) : new Dictionary<string, string>();

                return cards;
            }

            /// <summary>
            /// if we are passed a country code as a mapping option
            /// we need to restrict the gateways to that country.
            /// </summary>
            //public ResolutionResult Resolve(ResolutionResult ctx)
            //{
            //    List<DC.Gateway> allGateways = ((DC.CheckoutSettings)ctx.Context.SourceValue).PaymentSettings.Gateways ?? new List<DC.Gateway>(0);
            //    IEnumerable<DC.Gateway> filteredGateways = from g in allGateways
            //                                               where g.GatewayAccount != null
            //                                               select g;

            //    var cards = filteredGateways != null ? filteredGateways.SelectMany(g => g.SupportedCards).Distinct().ToDictionary(c => c) : new Dictionary<string, string>();

            //    return ctx.New(cards, typeof(Dictionary<string, string>));
            //}
        }
    }
}