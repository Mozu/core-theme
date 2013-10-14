using AutoMapper;
using System.Linq;
using System.Collections.Generic;

using Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout;
using DCss = Mozu.SiteSettings.Order.Contracts;
using DCp = Mozu.PaymentService.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class CheckoutMapping : Profile
    {
        public override string ProfileName
        {
            get
            {
                return this.GetType().FullName;
            }
        }

        protected override void Configure()
        {
            Mapper.CreateMap<DCss.CheckoutSettings, Setting>()
                .BeforeMap( (dc, x) => Mapper.Map<DCss.PaymentSettings, Setting>(dc.PaymentSettings, x) )
                .ForMember(x => x.PaymentProcessingFlowType, op => op.MapFrom(dc => (dc.OrderProcessingSettings ?? new DCss.OrderProcessingSettings()).PaymentProcessingFlowType))
                .ForMember(x => x.CustomerCheckoutType, op => op.MapFrom(dc => (dc.CustomerCheckoutSettings ?? new DCss.CustomerCheckoutSettings()).CustomerCheckoutType))
                ;


            Mapper.CreateMap<DCss.PaymentSettings, Setting>()
                .ConvertUsing(dc =>
                {
                    var ret = new Setting();
                    if (dc == null)
                        return ret;

                    ret.PayByMail = dc.PayByMail;
                    var gateway = dc.Gateways != null && dc.Gateways.Count > 0 ? dc.Gateways.FirstOrDefault(x => x.GatewayAccount != null && x.GatewayAccount.IsActive) : null;

                    if (gateway != null)
                    {
                        ret.SupportedCards = gateway.SupportedCards;
                        if (gateway.GatewayAccount != null)
                        {
                            ret.GatewayDefinitionId = gateway.GatewayAccount.GatewayDefinitionId;
                            ret.AreGatewayCredentialFieldsSet = gateway.AreGatewayCredentialFieldsSet;
                        }
                    }

                    return ret;
                });


            Mapper.CreateMap<Setting, DCss.PaymentSettings>()
                .ConvertUsing(x =>
                {
                    var gatewayAccount = new Mozu.PaymentService.Contracts.GatewayAccount
                    {
                        CountryCode = "US",
                        GatewayDefinitionId = x.GatewayDefinitionId,
                        Id = x.Id,
                        IsActive = true,
                        CredentialFields = new List<DCp.GatewayCredentialFieldValue>()
                    };

                    if (x.Credentials != null && x.Credentials.HasValues)
                    {
                        foreach (var credential in x.Credentials)
                        {
                            gatewayAccount.CredentialFields.Add(new DCp.GatewayCredentialFieldValue() { Name = credential.Key, Value = (string)credential.Value });
                        }
                    }

                    var pSettings = new Mozu.SiteSettings.Order.Contracts.PaymentSettings
                    {
                        Gateways = new List<Mozu.SiteSettings.Order.Contracts.Gateway> { new DCss.Gateway { GatewayAccount = gatewayAccount, SupportedCards = x.SupportedCards } },
                        PayByMail = x.PayByMail.GetValueOrDefault(false)
                    };
                    return pSettings;
                });
        }
    }
}
