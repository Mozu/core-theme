using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Mozu.SiteBuilder.UX.Models.Settings;


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

            Mapper.CreateMap<Mozu.SiteSettings.Order.Contracts.CheckoutSettings, UX.Models.Settings.CheckoutSettings>()
                  .ForMember(x => x.CustomerCheckoutType, opt => opt.ResolveUsing(x => x.CustomerCheckoutSettings.CustomerCheckoutType))
                  .ForMember(x => x.IsPayPalEnabled, opt => opt.ResolveUsing(x => x.PaymentSettings.ExternalPaymentWorkflowDefinitions != null && x.PaymentSettings.ExternalPaymentWorkflowDefinitions.Count > 0 && x.PaymentSettings.ExternalPaymentWorkflowDefinitions.FirstOrDefault().IsEnabled))
                  .ForMember(x => x.PayByMail, opt => opt.ResolveUsing(x => x.PaymentSettings.PayByMail))
                  .ForMember(x => x.PaymentProcessingFlowType, opt => opt.ResolveUsing(x => x.OrderProcessingSettings.PaymentProcessingFlowType))
                  .ForMember(x => x.UseOverridePriceToCalculateDiscounts, opt => opt.ResolveUsing(x => x.OrderProcessingSettings.UseOverridePriceToCalculateDiscounts));

           
        }
    }
}