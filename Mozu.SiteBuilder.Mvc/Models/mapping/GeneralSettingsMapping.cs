using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Mozu.SiteBuilder.UX.Models.Settings;
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
            Mapper.CreateMap<Mozu.SiteSettings.General.Contracts.GeneralSettings, UX.Models.Settings.GeneralSettings>();
            Mapper.CreateMap<Mozu.Tenant.Contracts.Domain , SiteDomain>();
            
            Mapper.CreateMap<DC.CheckoutSettings, UX.Models.Settings.CheckoutSettings>()
                  .ForMember(x => x.CustomerCheckoutType, opt => opt.ResolveUsing(x => x.CustomerCheckoutSettings.CustomerCheckoutType))
                  .ForMember(x => x.IsPayPalEnabled, opt => opt.ResolveUsing(x => x.PaymentSettings.ExternalPaymentWorkflowDefinitions != null && x.PaymentSettings.ExternalPaymentWorkflowDefinitions.Any(expwd => String.Equals(expwd.Name, DC.Constants.ThirdPartyPayment.PAYPAL_EXPRESS, System.StringComparison.OrdinalIgnoreCase) && expwd.IsEnabled)))
                  .ForMember(x => x.PayByMail, opt => opt.ResolveUsing(x => x.PaymentSettings.PayByMail))
                  .ForMember(x => x.PaymentProcessingFlowType, opt => opt.ResolveUsing(x => x.OrderProcessingSettings.PaymentProcessingFlowType))
                  .ForMember(x => x.SupportedCards, opt => opt.ResolveUsing(x => (x.PaymentSettings.Gateways ?? Enumerable.Empty<DC.Gateway>()).Where(g => g.GatewayAccount != null && g.GatewayAccount.IsActive).Select(g => g.SupportedCards.ToDictionary(card => card)).FirstOrDefault() ?? new Dictionary<string, string>()))
                  .ForMember(x => x.UseOverridePriceToCalculateDiscounts, opt => opt.ResolveUsing(x => x.OrderProcessingSettings.UseOverridePriceToCalculateDiscounts));

           
        }
    }
}