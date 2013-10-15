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
            var settings = (await _checkoutSettingsWebApiClient.GetCheckoutSettings()).ReadAsSync();
            var settings2 = _checkoutSettingsWebApiClient.GetThirdPartyPaymentWorkflows();

            var ret = Mapper.Map<CheckoutSettings>(settings);

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
            var pSetting = Mapper.Map<PaymentSettings>(settingReq);
            var  tasks = new List<Task>();
            DC.Gateway gateWay = null;
            var currentGatewayRes = (await _checkoutSettingsWebApiClient.GetActiveGatewayForCountry("us"));
            if (currentGatewayRes.ResponseMessage.IsSuccessStatusCode)
            {
                gateWay = currentGatewayRes.ReadAsSync();
            }
            if (gateWay != null)
            {
                var posted = pSetting.Gateways.First();
                if (gateWay.GatewayAccount.GatewayDefinitionId == posted.GatewayAccount.GatewayDefinitionId)
                {
                    var res0 = (await _checkoutSettingsWebApiClient.UpdateGateway(gateWay.GatewayAccount.Id, posted));
                }
                else
                {
                    var res0 = (await _checkoutSettingsWebApiClient.CreateGateway(  posted));
                }
            }
            else
            {
                var posted = pSetting.Gateways.First();
                var res0 = (await _checkoutSettingsWebApiClient.CreateGateway(posted));
            }

            var ret = (await _checkoutSettingsWebApiClient.UpdatePaymentSettings(pSetting)).ReadAsSync();
            var ret1 = (await _checkoutSettingsWebApiClient.UpdateCustomerCheckoutSettings( new Mozu.SiteSettings.Order.Contracts.CustomerCheckoutSettings()
                                                                                                {
                                                                                                   CustomerCheckoutType = settingReq.CustomerCheckoutType  
                                                                                                })).ReadAsSync();



            var ret2 = (await _checkoutSettingsWebApiClient.UpdateOrderProcessingSettings( new Mozu.SiteSettings.Order.Contracts.OrderProcessingSettings()  
            {
                 PaymentProcessingFlowType = settingReq.PaymentProcessingFlowType 
            })).ReadAsSync();

            var getRes = await GetSettings();
            return getRes;
        }






        public class CheckoutSettingsDefinitions 
        {
            public List<GatewayDefinition> GatewayDefinitions { get; set; }
            public List<DC.ExternalPaymentWorkflowDefinition> ExternalPaymentWorkflowDefinitions { get; set; }
        }

        /// <summary>
        /// Returns the PCIaaS gateway definitions
        /// </summary>
        /// <returns>Array of gateway definitions</returns>
        [HttpGetRoute(UriTemplate = "definition/read")]
        public async Task<Response<CheckoutSettingsDefinitions>> GetDefinitions()
        {
            var gatewaysTask = _checkoutSettingsWebApiClient.GetGatewayDefinitions();
            var workflowsTask = _checkoutSettingsWebApiClient.GetThirdPartyPaymentWorkflows();

            await Task.WhenAll(new Task[] { gatewaysTask, workflowsTask });
            var gateways = gatewaysTask.Result.ReadAsSync();
            var workflows = workflowsTask.Result.ReadAsSync();

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

            var ret = new CheckoutSettingsDefinitions {
                GatewayDefinitions = mapped,
                ExternalPaymentWorkflowDefinitions = workflows
            };

            return Single2(ret);
        }
    }
}
