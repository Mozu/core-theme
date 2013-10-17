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
            Mapper.CreateMap<DCss.CheckoutSettings, CheckoutSettings>()
                .ForMember(x => x.Id, op => op.Ignore())
                .ForMember(x => x.PaymentProcessingFlowType, op => op.MapFrom(dc => dc.OrderProcessingSettings.PaymentProcessingFlowType))
                .ForMember(x => x.CustomerCheckoutType, op => op.MapFrom(dc => dc.CustomerCheckoutSettings.CustomerCheckoutType))
                .ForMember(x => x.PayByMail, op => op.MapFrom(dc => dc.PaymentSettings.PayByMail))
                .ForMember(x => x.Gateway, op => op.ResolveUsing(dc => {
                    if (dc.PaymentSettings.Gateways != null && dc.PaymentSettings.Gateways.Count > 0)
                        return Mapper.Map<Gateway>(dc.PaymentSettings.Gateways.First());
                    else 
                        return new Gateway();
                }))
                .ForMember(x => x.ExternalPaymentWorkflows, op => op.MapFrom(dc => dc.PaymentSettings.ExternalPaymentWorkflowDefinitions))
                ;


            Mapper.CreateMap<DCss.Gateway, Gateway>()
                .ForMember(x => x.AreGatewayCredentialFieldsSet, op => op.MapFrom(dc => dc.AreGatewayCredentialFieldsSet))
                .ForMember(x => x.SupportedCards, op => op.MapFrom(dc => dc.SupportedCards))
                .ForMember(x => x.CountryCode, op => op.MapFrom(dc => dc.GatewayAccount.CountryCode))
                .ForMember(x => x.Id, op => op.MapFrom(dc => dc.GatewayAccount.Id))
                .ForMember(x => x.GatewayDefinitionId, op => op.MapFrom(dc => dc.GatewayAccount.GatewayDefinitionId))
                .ForMember(x => x.Credentials, op => op.MapFrom(dc => dc.GatewayAccount.CredentialFields))
                ;


            Mapper.CreateMap<CheckoutSettings, DCss.CheckoutSettings>()
                .ForMember(dc => dc.CustomerCheckoutSettings, op => op.MapFrom(x => x))
                .ForMember(dc => dc.OrderProcessingSettings, op => op.MapFrom(x => x))
                .ForMember(dc => dc.PaymentSettings, op => op.MapFrom(x => x))
                ;

            Mapper.CreateMap<CheckoutSettings, DCss.PaymentSettings>()
                .ConvertUsing(x => {
                    var ps = new DCss.PaymentSettings
                    {
                        PayByMail = x.PayByMail,
                        Gateways = new List<DCss.Gateway>(),
                        ExternalPaymentWorkflowDefinitions = x.ExternalPaymentWorkflows,
                    };

                    if (x.Gateway != null)
                        ps.Gateways.Add(Mapper.Map<DCss.Gateway>(x.Gateway));

                    return ps;
                });

            Mapper.CreateMap<CheckoutSettings, DCss.CustomerCheckoutSettings>()
                .ForMember(dc => dc.CustomerCheckoutType, op => op.MapFrom(x => x.CustomerCheckoutType))
                .ForMember(dc => dc.AuditInfo, op => op.Ignore())
                ;

            Mapper.CreateMap<CheckoutSettings, DCss.OrderProcessingSettings>()
                .ForMember(dc => dc.PaymentProcessingFlowType, op => op.MapFrom(x => x.PaymentProcessingFlowType))
                .ForMember(dc => dc.UseOverridePriceToCalculateDiscounts, op => op.Ignore())
                .ForMember(dc => dc.AuditInfo, op => op.Ignore())
                ;
            Mapper.CreateMap<Gateway, DCss.Gateway>()
                .ForMember(dc => dc.AreGatewayCredentialFieldsSet, op => op.MapFrom(x => x.AreGatewayCredentialFieldsSet))
                .ForMember(dc => dc.SupportedCards, op => op.MapFrom(x => x.SupportedCards))
                .ForMember(dc => dc.GatewayDefinition, op => op.Ignore())
                .ForMember(dc => dc.GatewayAccount, op => op.ResolveUsing(x => {
                    return new DCp.GatewayAccount {
                        Id = x.Id,
                        IsActive = x.IsActive,
                        CountryCode = x.CountryCode,
                        CredentialFields = x.Credentials
                    };
                }))
                ;

            // disgusting implicit mappings.
            Mapper.CreateMap<DCp.GatewayDefinition, GatewayDefinition>();
            Mapper.CreateMap<DCp.GatewayCredentialFieldDefinition, GatewayCredentialFieldDefinition>();
            Mapper.CreateMap<DCp.PreAuthorizeDefinition, PreAuthorizeDefinition>();
            Mapper.CreateMap<DCp.PreAuthorizeTransactionTypeDataContract, PreAuthorizeTransactionTypeDataContract>();
            //            Mapper.CreateMap< Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout.GatewayDefinition,GatewayDefinition>();

        }
    }
}
