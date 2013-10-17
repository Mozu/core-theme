using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout;
using DC = Mozu.SiteSettings.Order.Contracts;
using DCp = Mozu.PaymentService.Contracts;
using Mozu.SiteSettings.Order.Contracts.Clients;
using GatewayCredentialFieldValue = Mozu.PaymentService.Contracts.GatewayCredentialFieldValue;
using PaymentSettings = Mozu.SiteSettings.Order.Contracts.PaymentSettings;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/checkoutsettings", SuppressDescriptorGeneration = true)]
    public class CheckoutSettingsController : BaseController
    {
        private readonly ICheckoutSettingsWebApiClient _checkoutSettingsWebApiClient;

        /// <summary>
        /// Constructor.
        /// </summary>
        public CheckoutSettingsController(ICheckoutSettingsWebApiClient checkoutSettingsWebApiClient)
        {
            _checkoutSettingsWebApiClient = checkoutSettingsWebApiClient;
        }

        /// <summary>
        /// Returns the active checkout settings
        /// </summary>
        /// <returns></returns>
        [HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<CheckoutSettings>> GetSettings()
        {
            var dcSettings = (await _checkoutSettingsWebApiClient.GetCheckoutSettings()).ReadAsSync();

            var ret = Mapper.Map<CheckoutSettings>(dcSettings);

            // mock data
            if (ret.ExternalPaymentWorkflows == null || ret.ExternalPaymentWorkflows.Count == 0)
            {
                ret.ExternalPaymentWorkflows = new List<DC.ExternalPaymentWorkflowDefinition> {
                    new DC.ExternalPaymentWorkflowDefinition {
                         Name = "Paypal Express",
                         IsEnabled = true,
                         Credentials = new List<DC.ThirdPartyCredentialField> {
                             new DC.ThirdPartyCredentialField { APIName="bradley", DisplayName="login or something", Value="foo" },
                             new DC.ThirdPartyCredentialField { APIName="foster", DisplayName="secret key", Value="illuminati" }
                         }
                    }
                };
            }

            return Single2(ret);
        } 

        /// <summary>
        /// Updates the active checkout settings
        /// </summary>
        /// <param name="setting">The checkout settings</param>
        /// <returns>The active checkout settings</returns>
        [HttpPostRoute(UriTemplate = "update")]
        public async Task<Response<CheckoutSettings>> UpdateSettings(CheckoutSettings settingReq)
        {
            var dcPaymentSettings = Mapper.Map<DC.PaymentSettings>(settingReq);
            var dcCheckoutSettings = Mapper.Map<DC.CustomerCheckoutSettings>(settingReq);
            var dcOrderProcessingSettings = Mapper.Map<DC.OrderProcessingSettings>(settingReq);

            DC.Gateway gateway = null;
            var currentGatewayRes = (await _checkoutSettingsWebApiClient.GetActiveGatewayForCountry("us"));
            if (currentGatewayRes.ResponseMessage.IsSuccessStatusCode)
            {
                gateway = currentGatewayRes.ReadAsSync();
            }

            var posted = dcPaymentSettings.Gateways.First();
            if (gateway != null && gateway.GatewayAccount.GatewayDefinitionId == posted.GatewayAccount.GatewayDefinitionId)
            {
                await _checkoutSettingsWebApiClient.UpdateGateway(gateway.GatewayAccount.Id, posted);
            }
            else
            {
                await _checkoutSettingsWebApiClient.CreateGateway(posted);
            }

            var tasks = new Task[] {
                _checkoutSettingsWebApiClient.UpdatePaymentSettings(dcPaymentSettings),
                _checkoutSettingsWebApiClient.UpdateCustomerCheckoutSettings(dcCheckoutSettings),
                _checkoutSettingsWebApiClient.UpdateOrderProcessingSettings(dcOrderProcessingSettings)
            };

            await Task.WhenAll(tasks);
            var newSettings = await GetSettings();

            return newSettings;
        }



        /// <summary>
        /// Returns the PCIaaS gateway definitions
        /// </summary>
        /// <returns>Array of gateway definitions</returns>
        [HttpGetRoute(UriTemplate = "gatewaydefinitions/read")]
        public async Task<Response<List<GatewayDefinition>>> GetGatewayDefinitions()
        {
            var gateways = (await _checkoutSettingsWebApiClient.GetGatewayDefinitions()).ReadAsSync();

            var mapped = Mapper.Map<List<GatewayDefinition>>(gateways).OrderBy(x => x.Name).ToList();
            mapped.ForEach(x =>
                {
                    
                    if (x.SupportedCards == null || x.SupportedCards.Count == 0)
                    {
                        x.SupportedCards = new List<KeyValuePair<string, string>>()
                                               {
                                                   new KeyValuePair<string, string>("VISA", "VISA"),
                                                   new KeyValuePair<string, string>("AMEX", "American Express"),
                                                   new KeyValuePair<string, string>("MC", "MasterCard"),
                                                   new KeyValuePair<string, string>("DISCOVER", "Discover"),
                                               };
                    }
                });

            return List2(mapped);
        }

        /// <summary>
        /// Returns the other definitions
        /// </summary>
        /// <returns>Array of gateway definitions</returns>
        [HttpGetRoute(UriTemplate = "externaldefinitions/read")]
        public async Task<Response<List<DC.ExternalPaymentWorkflowDefinition>>> GetExternalDefinitions()
        {
            var workflows = (await _checkoutSettingsWebApiClient.GetThirdPartyPaymentWorkflows()).ReadAsSync();

            return List2(workflows);
        }
}
}
