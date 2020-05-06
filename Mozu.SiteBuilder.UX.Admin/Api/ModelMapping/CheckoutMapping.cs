using AutoMapper;
using System.Linq;
using System.Collections.Generic;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout;
using DCss = Mozu.SiteSettings.Order.Contracts;
using DCp = Mozu.PaymentService.Contracts;
using System;
using Newtonsoft.Json.Linq;

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

        //TODO: We should move this to reference service.
      
        //todo delte
       

        public CheckoutMapping()
        {
            CreateMap<DCss.CheckoutSettings, CheckoutSettings>()
                .ForMember(x => x.Id, op => op.Ignore())
                .ForMember(x => x.PaymentProcessingFlowType, op => op.ResolveUsing(dc => (dc.OrderProcessingSettings != null)
                    ? dc.OrderProcessingSettings.PaymentProcessingFlowType
                    : null))
                .ForMember(x => x.GiftCardProcessingType, op => op.ResolveUsing(dc => (dc.OrderProcessingSettings != null)
                    ? dc.OrderProcessingSettings.GiftCardProcessingType
                    : null))
                .ForMember(x => x.CustomerCheckoutType, op => op.ResolveUsing(dc => (dc.CustomerCheckoutSettings != null)
                    ? dc.CustomerCheckoutSettings.CustomerCheckoutType
                    : null))
                //todo: confirm false default when null Greg Murray on 2014-01-27 
                .ForMember(x => x.PayByMail, op => op.ResolveUsing(dc => (dc.PaymentSettings != null)
                    ? dc.PaymentSettings.PayByMail
                    : false))
                .ForMember(x => x.CardGatewayMap, op => op.ResolveUsing(dc =>
                {
                    if (dc.PaymentSettings.Gateways != null && dc.PaymentSettings.Gateways.Count > 0)
                    {
                        return dc.PaymentSettings.Gateways
                            .Where(g => g.GatewayAccount != null && g.SupportedCards.Count > 0)
                            .SelectMany(g => g.SiteGatewaySupportedCards, (g, c) => new CardGateway()
                            {
                                GatewayId = g.GatewayAccount.Id,
                                CardType = c.CardTypeId,
                                PaymentType = c.PaymentType,
                                IsEnabled = true,
                                GatewayName = g.GatewayAccount.Name
                               
                            })
                            .ToList();
                    }
                    else
                    {
                        return new List<CardGateway>();
                    }
                }))
                .ForMember(x => x.PurchaseOrder, op => op.ResolveUsing(dc => dc.PaymentSettings.PurchaseOrder))
    
                //TODO: remove when old admin goes away.
                .ForMember(x => x.Gateway, op => op.ResolveUsing(dc =>
                {
                    if (dc.PaymentSettings.Gateways != null && dc.PaymentSettings.Gateways.Count > 0)
                    {
                        var sourceGateway = dc.PaymentSettings.Gateways.FirstOrDefault(g => g.GatewayAccount != null && g.GatewayAccount.IsActive);
                        return sourceGateway != null ? Mapper.Map<Gateway>(sourceGateway) : new Gateway();
                    }
                    else
                    {
                        return new Gateway();
                    }
                }))
                .ForMember(x => x.ExternalPaymentWorkflows, op => op.ResolveUsing(dc => (dc.PaymentSettings != null)
                    ? dc.PaymentSettings.ExternalPaymentWorkflowDefinitions
                    : null))
                .ForMember(x=>x.ThirdPartyPaymentSettings, op=>op.ResolveUsing(y=>y.OrderProcessingSettings?.ThirdPartyPaymentSettings));
               

            CreateMap<DCss.Gateway, Gateway>()
                .ForMember(x => x.AreGatewayCredentialFieldsSet, op => op.ResolveUsing(dc => dc.AreGatewayCredentialFieldsSet))
                .ForMember(x => x.SupportedCards, op => op.ResolveUsing(dc => dc.SupportedCards))
                .ForMember(x => x.CountryCode, op => op.ResolveUsing(dc => (dc.GatewayAccount != null) ? dc.GatewayAccount.CountryCode : null))
                .ForMember(x => x.Id, op => op.ResolveUsing(dc => (dc.GatewayAccount != null) ? dc.GatewayAccount.Id : null))
                .ForMember(x => x.BinPatterns, op => op.ResolveUsing(dc => (dc.GatewayAccount != null)
                    ? dc.GatewayAccount.BinPatterns
                    : null))
                .ForMember(x => x.GatewayDefinitionId, op => op.ResolveUsing(dc => (dc.GatewayAccount != null) 
                    ? dc.GatewayAccount.GatewayDefinitionId 
                    : null))
                .ForMember(x => x.Credentials, op => op.ResolveUsing(dc => {
                    var creds = new JObject();
                    if (dc.GatewayAccount != null && dc.GatewayAccount.CredentialFields != null)
                    {
                        foreach (var field in dc.GatewayAccount.CredentialFields)
                            creds.Add(field.Name, (JToken)field.Value);
                    }
                    return creds;
                }))
                .ForMember(x=>x.SupportsGiftCardProcessing, op=>op.ResolveUsing(dc=> dc.GatewayDefinition?.Features?.Any(x=>x.EqualsIgnoreCase("giftcards"))))
                //ignore
                .ForMember(x => x.IsActive, op => op.Ignore())

                .ForMember(x => x.Name, op => op.Ignore()) // only mapped from tenant gateway
                ;


            CreateMap<CheckoutSettings, DCss.CheckoutSettings>()
                .ForMember(dc => dc.CustomerCheckoutSettings, op => op.ResolveUsing(( CheckoutSettings x) => x))
                .ForMember(dc => dc.OrderProcessingSettings, op => op.ResolveUsing( (CheckoutSettings x) => x))
                .ForMember(dc => dc.PaymentSettings, op => op.ResolveUsing(( CheckoutSettings x) => x))
                ;

            CreateMap<CheckoutSettings, DCss.PaymentSettings>()
                .ConvertUsing(x => {
                    var ps = new DCss.PaymentSettings
                    {
                        PayByMail = x.PayByMail,
                        Gateways = new List<DCss.Gateway>(),
                        ExternalPaymentWorkflowDefinitions = x.ExternalPaymentWorkflows,
                        PurchaseOrder = x.PurchaseOrder
                    };

                    if (x.CardGatewayMap != null)
                    {
                        var cardsLookByGateway = x.CardGatewayMap.Where(m => m.IsEnabled && !string.IsNullOrEmpty(m.GatewayId)).ToLookup(m => m.GatewayId);
                        foreach (var g in cardsLookByGateway)
                        {
                            ps.Gateways.Add(new DCss.Gateway
                            {
                                GatewayAccount = new DCp.GatewayAccount { Id = g.Key },
                                SiteGatewaySupportedCards = g.Select(cm => new DCp.SiteGatewaySupportedCard
                                {
                                    CardTypeId = cm.CardType,
                                    ProcessingGatewayAccountId = !string.IsNullOrEmpty(cm.ProcessingGatewayId)?cm.ProcessingGatewayId:null
                                } ).ToList()
                            });
                        }
                    }


                    //TODO: remove when old admin goes away.
                    if (x.Gateway != null)
                        ps.Gateways.Add(Mapper.Map<DCss.Gateway>(x.Gateway));

                    return ps;
                });

            CreateMap<CheckoutSettings, DCss.CustomerCheckoutSettings>()
                .ForMember(dc => dc.CustomerCheckoutType, op => op.ResolveUsing(x => x.CustomerCheckoutType))
                .ForMember(dc => dc.AuditInfo, op => op.Ignore())
                ;

            CreateMap<CheckoutSettings, DCss.OrderProcessingSettings>()
                .ForMember(dc => dc.PaymentProcessingFlowType, op => op.ResolveUsing(x => x.PaymentProcessingFlowType))
                .ForMember(dc => dc.UseOverridePriceToCalculateDiscounts, op => op.Ignore())
                .ForMember(dc => dc.AuditInfo, op => op.Ignore())
                .ForMember(dc => dc.AbandonedOrderThresholdInMinutes, op => op.Ignore()) // todo: xverify - Greg Murray on 2014-08-26
                ;

            CreateMap<Gateway, DCss.Gateway>()
                .ForMember(dc => dc.AreGatewayCredentialFieldsSet, op => op.ResolveUsing(x => x.AreGatewayCredentialFieldsSet))
                .ForMember(dc => dc.SupportedCards, op => op.ResolveUsing(x => x.SupportedCards))
                .ForMember(dc => dc.GatewayDefinition, op => op.Ignore())
                .ForMember(dc => dc.GatewayAccount, op => op.ResolveUsing(x => {
                    var account = new DCp.GatewayAccount {
                        Id = x.Id,
                        IsActive = x.IsActive,
                        CountryCode = x.CountryCode ?? "us",
                        CredentialFields = new List<DCp.GatewayCredentialFieldValue>(),
                        GatewayDefinitionId = x.GatewayDefinitionId 
                    };

                    Action<KeyValuePair<string, Newtonsoft.Json.Linq.JToken>> foo = cred => account.CredentialFields.Add(new DCp.GatewayCredentialFieldValue { Name = cred.Key, Value = (string)cred.Value });
                    if (x.Credentials != null && x.Credentials.HasValues)
                    {
                        foreach (var cred in x.Credentials)
                            account.CredentialFields.Add(new DCp.GatewayCredentialFieldValue { Name = cred.Key, Value = (string)cred.Value });
                    }

                    return account;
                }))
                ;

            // disgusting implicit mappings.
            CreateMap<DCp.GatewayDefinition, GatewayDefinition>()
                //todo: confirm KeyValuePair transformation Greg Murray on 2014-01-24 
                .ForMember(x => x.SupportedCards, op => op.ResolveUsing(dc => dc.SupportedCards));
                ;
            CreateMap<DCp.GatewayCredentialFieldDefinition, GatewayCredentialFieldDefinition>();
            CreateMap<DCp.PreAuthorizeDefinition, PreAuthorizeDefinition>();
            CreateMap<DCp.PreAuthorizeTransactionTypeDataContract, PreAuthorizeTransactionTypeDataContract>();
            //            CreateMap< Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout.GatewayDefinition,GatewayDefinition>();

            CreateMap<DCss.TenantGateway, Gateway>()
                .ForMember(x => x.Id, op => op.ResolveUsing(dc => (dc.GatewayAccount != null) ? dc.GatewayAccount.Id : null))
                .ForMember(x => x.GatewayDefinitionId, op => op.ResolveUsing(dc => (dc.GatewayAccount != null)
                    ? dc.GatewayAccount.GatewayDefinitionId
                    : null))
                .ForMember(x => x.Credentials, op => op.ResolveUsing(dc => {
                    var creds = new JObject();
                    if (dc.GatewayAccount != null && dc.GatewayAccount.CredentialFields != null)
                    {
                        foreach (var field in dc.GatewayAccount.CredentialFields)
                            creds.Add(field.Name, (JToken)field.Value);
                    }
                    return creds;
                }))
                .ForMember(x => x.BinPatterns, op => op.ResolveUsing(dc => (dc.GatewayAccount != null)
                    ? dc.GatewayAccount.BinPatterns
                    : null))
                .ForMember(x => x.GatewayDefinitionName, 
                    op => op.ResolveUsing(dc => (dc.GatewayDefinition != null) ? dc.GatewayDefinition.Name : null))

                .ForMember(x => x.AreGatewayCredentialFieldsSet, opt => opt.Ignore())
                .ForMember(x => x.SupportedCards, opt => opt.Ignore())
                .ForMember(x => x.CountryCode, opt => opt.Ignore())
                .ForMember(x => x.IsActive, opt => opt.Ignore())
                .ForMember(x => x.SupportsGiftCardProcessing, op => op.ResolveUsing(dc => dc.GatewayDefinition?.Features?.Any(x=>x.EqualsIgnoreCase("giftcards"))))
                ;

            CreateMap<Gateway, DCss.TenantGateway>()
                .ForMember(dc => dc.GatewayAccount, op => op.ResolveUsing(x =>
                {
                    var account = new DCp.GatewayAccount
                    {
                        Id = x.Id,
                        IsActive = true,
                        CountryCode = "us",
                        CredentialFields = new List<DCp.GatewayCredentialFieldValue>(),
                        GatewayDefinitionId = x.GatewayDefinitionId
                    };

                    Action<KeyValuePair<string, Newtonsoft.Json.Linq.JToken>> foo = cred => account.CredentialFields.Add(new DCp.GatewayCredentialFieldValue { Name = cred.Key, Value = (string)cred.Value });
                    if (x.Credentials != null && x.Credentials.HasValues)
                    {
                        foreach (var cred in x.Credentials)
                            account.CredentialFields.Add(new DCp.GatewayCredentialFieldValue { Name = cred.Key, Value = (string)cred.Value });
                    }

                    return account;
                }))
                .ForMember(d => d.GatewayDefinition, opt => opt.Ignore())
                ;
        }
    }
}
 