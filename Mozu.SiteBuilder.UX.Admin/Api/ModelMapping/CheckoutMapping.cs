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
        private static List<KeyValuePair<string, string>> Cards = new List<KeyValuePair<string, string>>
                    {
                        new KeyValuePair<string, string>("VISA", "VISA"),
                        new KeyValuePair<string, string>("AMEX", "American Express"),
                        new KeyValuePair<string, string>("MC", "MasterCard"),
                        new KeyValuePair<string, string>("DISCOVER", "Discover"),
                        new KeyValuePair<string, string>("JCB", "JCB"),
                        new KeyValuePair<string, string>(CARD_TYPE.OTHER, CARD_TYPE.OTHER)
                    };


        private static List<CardGateway> CardGateways()
        {
            var result = Cards.Select(c => new CardGateway { CardType = c.Key, CardDisplay = c.Value, IsEnabled = false }).ToList();
            return result;
        }

        private static List<CardGateway> ToCardGateways(Dictionary<string, DCss.Gateway> cardGateway)
        {
            var result = CardGateways();
            foreach (var card in result)
            {
                if (cardGateway.ContainsKey(card.CardType))
                {
                    var gateway = cardGateway[card.CardType];
                    card.GatewayId = gateway.GatewayAccount.Id;
                    card.IsEnabled = true;
                }
            }
            return result;
        }

        protected override void Configure()
        {
            Mapper.CreateMap<DCss.CheckoutSettings, CheckoutSettings>()
                .ForMember(x => x.Id, op => op.Ignore())
                .ForMember(x => x.PaymentProcessingFlowType, op => op.ResolveUsing(dc => (dc.OrderProcessingSettings != null) 
                    ? dc.OrderProcessingSettings.PaymentProcessingFlowType 
                    : null))
                .ForMember(x => x.CustomerCheckoutType, op => op.ResolveUsing(dc => (dc.CustomerCheckoutSettings != null) 
                    ? dc.CustomerCheckoutSettings.CustomerCheckoutType 
                    : null))
                //todo: confirm false default when null Greg Murray on 2014-01-27 
                .ForMember(x => x.PayByMail, op => op.ResolveUsing(dc => (dc.PaymentSettings != null) 
                    ? dc.PaymentSettings.PayByMail 
                    : false))
                .ForMember(x => x.CardGatewayMap, op => op.ResolveUsing(dc => {
                    if (dc.PaymentSettings.Gateways != null && dc.PaymentSettings.Gateways.Count > 0)
                    {
                        var sourceGateways = dc.PaymentSettings.Gateways.Where(g => g.GatewayAccount != null );
                        var cardGateways = dc.PaymentSettings.Gateways
                            .Where(g => g.SupportedCards.Count > 0)
                            .SelectMany(g => g.SupportedCards, (g, c) => new { c, g })
                            .ToDictionary(cg => cg.c, cg => cg.g);

                        var result = ToCardGateways(cardGateways);
                        return result;
                    }
                    else
                    {
                        return CardGateways();
                    }
                }))
                .ForMember(x => x.PurchaseOrder, op => op.ResolveUsing(dc => dc.PaymentSettings.PurchaseOrder))
                //TODO: remove when old admin goes away.
                .ForMember(x => x.Gateway, op => op.ResolveUsing(dc => {
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
                .ForMember(x => x.IsMultishipEnabled, op => op.Ignore());


            Mapper.CreateMap<DCss.Gateway, Gateway>()
                .ForMember(x => x.AreGatewayCredentialFieldsSet, op => op.ResolveUsing(dc => dc.AreGatewayCredentialFieldsSet))
                .ForMember(x => x.SupportedCards, op => op.ResolveUsing(dc => dc.SupportedCards))
                .ForMember(x => x.CountryCode, op => op.ResolveUsing(dc => (dc.GatewayAccount != null) ? dc.GatewayAccount.CountryCode : null))
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
                //ignore
                .ForMember(x => x.IsActive, op => op.Ignore())

                .ForMember(x => x.Name, op => op.Ignore()) // only mapped from tenant gateway
                ;


            Mapper.CreateMap<CheckoutSettings, DCss.CheckoutSettings>()
                .ForMember(dc => dc.CustomerCheckoutSettings, op => op.ResolveUsing(( CheckoutSettings x) => x))
                .ForMember(dc => dc.OrderProcessingSettings, op => op.ResolveUsing( (CheckoutSettings x) => x))
                .ForMember(dc => dc.PaymentSettings, op => op.ResolveUsing(( CheckoutSettings x) => x))
                ;

            Mapper.CreateMap<CheckoutSettings, DCss.PaymentSettings>()
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
                        var cardsLookByGateway = x.CardGatewayMap.Where(m => m.IsEnabled).ToLookup(m => m.GatewayId);
                        foreach (var g in cardsLookByGateway)
                        {
                            ps.Gateways.Add(new DCss.Gateway
                            {
                                GatewayAccount = new DCp.GatewayAccount { Id = g.Key },
                                SupportedCards = g.Select(cm => cm.CardType).ToList()
                            });
                        }
                    }


                    //TODO: remove when old admin goes away.
                    if (x.Gateway != null)
                        ps.Gateways.Add(Mapper.Map<DCss.Gateway>(x.Gateway));

                    return ps;
                });

            Mapper.CreateMap<CheckoutSettings, DCss.CustomerCheckoutSettings>()
                .ForMember(dc => dc.CustomerCheckoutType, op => op.ResolveUsing(x => x.CustomerCheckoutType))
                .ForMember(dc => dc.AuditInfo, op => op.Ignore())
                ;

            Mapper.CreateMap<CheckoutSettings, DCss.OrderProcessingSettings>()
                .ForMember(dc => dc.PaymentProcessingFlowType, op => op.ResolveUsing(x => x.PaymentProcessingFlowType))
                .ForMember(dc => dc.UseOverridePriceToCalculateDiscounts, op => op.Ignore())
                .ForMember(dc => dc.AuditInfo, op => op.Ignore())
                .ForMember(dc => dc.AbandonedOrderThresholdInMinutes, op => op.Ignore()) // todo: xverify - Greg Murray on 2014-08-26
                ;

            Mapper.CreateMap<Gateway, DCss.Gateway>()
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
            Mapper.CreateMap<DCp.GatewayDefinition, GatewayDefinition>()
                //todo: confirm KeyValuePair transformation Greg Murray on 2014-01-24 
                .ForMember(x => x.SupportedCards, op => op.ResolveUsing(dc => (dc.SupportedCards.IsNullOrEmpty())
                    ? null
                    : dc.SupportedCards.Select(
                        x => new KeyValuePair<string, string>(x.Type, x.FriendlyName)).ToList()))
                ;
            Mapper.CreateMap<DCp.GatewayCredentialFieldDefinition, GatewayCredentialFieldDefinition>();
            Mapper.CreateMap<DCp.PreAuthorizeDefinition, PreAuthorizeDefinition>();
            Mapper.CreateMap<DCp.PreAuthorizeTransactionTypeDataContract, PreAuthorizeTransactionTypeDataContract>();
            //            Mapper.CreateMap< Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout.GatewayDefinition,GatewayDefinition>();

            Mapper.CreateMap<DCss.TenantGateway, Gateway>()
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
                .ForMember(x => x.GatewayDefinitionName, 
                    op => op.ResolveUsing(dc => (dc.GatewayDefinition != null) ? dc.GatewayDefinition.Name : null))

                .ForMember(x => x.AreGatewayCredentialFieldsSet, opt => opt.Ignore())
                .ForMember(x => x.SupportedCards, opt => opt.Ignore())
                .ForMember(x => x.CountryCode, opt => opt.Ignore())
                .ForMember(x => x.IsActive, opt => opt.Ignore())
                ;

            Mapper.CreateMap<Gateway, DCss.TenantGateway>()
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
 