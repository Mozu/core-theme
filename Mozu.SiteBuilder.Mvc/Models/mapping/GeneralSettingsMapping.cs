using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using AutoMapper;
using Mozu.SiteBuilder.UX.Models.Settings;
using Newtonsoft.Json;
using Newtonsoft.Json.Bson;
using Stact.Routing.Nodes;
using DC = Mozu.SiteSettings.Order.Contracts;

namespace Mozu.SiteBuilder.Mvc.Models.ModelMapping
{
    public class GeneralSettingsMapping : Profile
    {
        public override string ProfileName
        {
            get { return GetType().FullName; }
        }

        protected override void Configure()
        {
          //  Mapper.CreateMap<Mozu.SiteSettings.General.Contracts.GeneralSettings, UX.Models.Settings.GeneralSettings>();
            Mapper.CreateMap<Mozu.Tenant.Contracts.Domain , SiteDomain>();
            
            Mapper.CreateMap<DC.CheckoutSettings, UX.Models.Settings.CheckoutSettings>()
                  .ForMember(x => x.CustomerCheckoutType, opt => opt.ResolveUsing(x => x.CustomerCheckoutSettings.CustomerCheckoutType))
                  .ForMember(x => x.IsPayPalEnabled, opt => opt.ResolveUsing(x => x.PaymentSettings.ExternalPaymentWorkflowDefinitions != null && x.PaymentSettings.ExternalPaymentWorkflowDefinitions.Any(expwd => String.Equals(expwd.Name, DC.Constants.ThirdPartyPayment.PAYPAL_EXPRESS, System.StringComparison.OrdinalIgnoreCase) && expwd.IsEnabled)))
                  .ForMember(x => x.PayByMail, opt => opt.ResolveUsing(x => x.PaymentSettings.PayByMail))
                  .ForMember(x => x.PaymentProcessingFlowType, opt => opt.ResolveUsing(x => x.OrderProcessingSettings.PaymentProcessingFlowType))
                  .ForMember(x => x.SupportedCards, opt => opt.ResolveUsing(x => (x.PaymentSettings.Gateways ?? Enumerable.Empty<DC.Gateway>()).Where(g => g.GatewayAccount != null && g.GatewayAccount.IsActive).Select(g => g.SupportedCards.ToDictionary(card => card)).FirstOrDefault() ?? new Dictionary<string, string>()))
                  .ForMember(x => x.UseOverridePriceToCalculateDiscounts, opt => opt.ResolveUsing(x => x.OrderProcessingSettings.UseOverridePriceToCalculateDiscounts));




            Mapper.CreateMap<Mozu.Reference.Contracts.TimeZone, UX.Models.Settings.TimeZone>()
                .ForMember(x => x.Selected, op => op.Ignore());

          

            Mapper.CreateMap<Mozu.SiteSettings.General.Contracts.GeneralSettings, UX.Models.Settings.GeneralSettings>()
                //ignores
                .ForMember(m => m.AdjustForDaylightSavingTime, op => op.Ignore())
                .ForMember(m => m.AllowAllIPs, op => op.Ignore())
                .ForMember(m => m.IsWishlistCreationEnabled, op => op.ResolveUsing(x => x.IsWishlistCreationEnabled))
              
                .ForMember(m => m.ChannelId, op => op.Ignore())
                .ForMember(m => m.TemplateSiteId, op => op.ResolveUsing(dc => dc.TemplateSiteId))
                .ForMember(m => m.DesktopTheme, opt => opt.ResolveUsing(x =>
                {
                    if (!string.IsNullOrEmpty(x.Theme))
                    {
                        return Deserialize(x.Theme);
                          

                    }
                    return new ThemeSelection()
                    {

                    }; 
                }))
                .ForMember(m => m.MobileTheme, opt => opt.ResolveUsing(x =>
                {
                    if (!string.IsNullOrEmpty(x.MobileTheme))
                    {
                        return Deserialize(x.MobileTheme);
                    }
                    return null;
                }))
                .ForMember(m => m.TabletTheme, opt => opt.ResolveUsing(x =>
                {
                    if (!string.IsNullOrEmpty(x.TabletTheme))
                    {
                        return Deserialize(x.TabletTheme);
                    }
                    return null;
                }));

            //   .ForMember(x => x.IPBlocks, o => o.ResolveUsing(x => x.IPBlocks != null ? x.IPBlocks.Items : new List<Mozu.SiteSettings.General.Contracts.IPBlock>()));
            Mapper.CreateMap<UX.Models.Settings.GeneralSettings, Mozu.SiteSettings.General.Contracts.GeneralSettings>()
                //ignores
                .ForMember(dc => dc.IsMozuWebSite, op => op.Ignore())
                .ForMember(dc => dc.IsWishlistCreationEnabled, op => op.ResolveUsing(x => x.IsWishlistCreationEnabled))
                .ForMember(dc => dc.TaxableTerritories, op => op.Ignore())
                .ForMember(dc => dc.AuditInfo, op => op.Ignore())
                .ForMember(dc => dc.Theme, op => op.ResolveUsing(x => Serialize(x.DesktopTheme)))
                .ForMember(dc => dc.MobileTheme, op => op.ResolveUsing(x => (x.MobileTheme == null || string.IsNullOrEmpty(x.MobileTheme.Id)) ? null : Serialize(x.MobileTheme)))
                .ForMember(dc => dc.TabletTheme, op => op.ResolveUsing(x => (x.TabletTheme == null || string.IsNullOrEmpty(x.TabletTheme.Id)) ? null : Serialize(x.TabletTheme)))
                .ForMember(dc => dc.TemplateSiteId, op => op.ResolveUsing(x => x.TemplateSiteId));
           
        }
        static Regex isBase64 = new Regex("^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$");
        static ThemeSelection  Deserialize(string val)
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
            return  Convert.ToBase64String(ms.ToArray());


        }
    }
}