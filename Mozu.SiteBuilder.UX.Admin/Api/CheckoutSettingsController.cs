using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout;
using Mozu.SiteSettings.Order.Contracts.Clients;
using Mozu.Tenant.Contracts.Clients;
using DC = Mozu.SiteSettings.Order.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/checkoutsettings", SuppressDescriptorGeneration = true)]
    public class CheckoutSettingsController : BaseController
    {
        private readonly ICheckoutSettingsWebApiClient _checkoutSettingsWebApiClient;
        private readonly IApiContext _context;
        private readonly ITenantsWebApiClient _tenantClient;

        /// <summary>
        /// Constructor.
        /// </summary>
        public CheckoutSettingsController(ICheckoutSettingsWebApiClient checkoutSettingsWebApiClient, ITenantsWebApiClient tenantClient, IApiContext context)
        {
            _checkoutSettingsWebApiClient = checkoutSettingsWebApiClient;
            _context = context;
            _tenantClient = tenantClient.CloneWithoutUserClaims();
        }

        /// <summary>
        /// Returns the active checkout settings
        /// </summary>
        /// <returns></returns>
        [HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<CheckoutSettings>> GetSettings()
        {
            string currCountryCode = await GetCountryCodeForSite();
            var dcSettings = (await _checkoutSettingsWebApiClient.GetCheckoutSettings()).ReadAsSync();

            // filter out all gateways not from our current country code.
            dcSettings.PaymentSettings.Gateways = (
                from g in dcSettings.PaymentSettings.Gateways
                where g.GatewayAccount != null
                where g.GatewayAccount.IsActive
                where currCountryCode.Equals(g.GatewayAccount.CountryCode, StringComparison.InvariantCultureIgnoreCase)
                select g
            ).ToList();
            var ret = Mapper.Map<CheckoutSettings>(dcSettings);
            return Single2(ret);
        }

        /// <summary>
        /// Returns the active checkout settings
        /// </summary>
        /// <returns></returns>
        [HttpGetRoute(UriTemplate = "cards/list")]
        public async Task<Response<List<KeyValuePair<string, string>>>> GetCards()
        {
            var currCountryCode = await GetCountryCodeForSite();
            var dcGateway = (await _checkoutSettingsWebApiClient.CloneWithoutUserClaims().GetActiveGatewayForCountry(currCountryCode)).ReadAsSync();
            var ret = dcGateway.SupportedCards.Select(x => new KeyValuePair<string, string>(x, x)) .ToList();
            return List2(ret);
        }

        /// <summary>
        /// Updates the active checkout settings
        /// </summary>
        /// <param name="settingReq">The checkout settings</param>
        /// <returns>The active checkout settings</returns>
        [HttpPostRoute(UriTemplate = "update")]
        public async Task<Response<CheckoutSettings>> UpdateSettings(CheckoutSettings settingReq)
        {
            var dcPaymentSettings = Mapper.Map<DC.PaymentSettings>(settingReq);
            var dcCheckoutSettings = Mapper.Map<DC.CustomerCheckoutSettings>(settingReq);
            var dcOrderProcessingSettings = Mapper.Map<DC.OrderProcessingSettings>(settingReq);

            var currCountryCode = await GetCountryCodeForSite();
            var gateway = await GetGatewayForCountry(currCountryCode);

            var posted = dcPaymentSettings.Gateways.First();
            posted.GatewayAccount.CountryCode = currCountryCode; // 2014-10-7 chusk: according to Wallis, we are fine with locking down gateways to Site Country codes

            await UpdateSettings(gateway, posted, dcPaymentSettings, dcOrderProcessingSettings, dcCheckoutSettings);

            var newSettings = await GetSettings();
            return newSettings;
        }

        private async Task UpdateSettings(DC.Gateway gateway, DC.Gateway posted, DC.PaymentSettings dcPaymentSettings, DC.OrderProcessingSettings dcOrderProcessingSettings, DC.CustomerCheckoutSettings dcCheckoutSettings)
        {
            var tasks = new List<Task>();
            if (gateway != null && gateway.GatewayAccount.GatewayDefinitionId == posted.GatewayAccount.GatewayDefinitionId)
            {
                tasks.Add(_checkoutSettingsWebApiClient.UpdateGateway(gateway.GatewayAccount.Id, posted));
            }
            else
            {
                tasks.Add(_checkoutSettingsWebApiClient.CreateGateway(posted));
            }

            tasks.Add(_checkoutSettingsWebApiClient.UpdatePaymentSettings(dcPaymentSettings));
            tasks.Add(_checkoutSettingsWebApiClient.UpdateOrderProcessingSettings(dcOrderProcessingSettings));
            tasks.Add(_checkoutSettingsWebApiClient.UpdateCustomerCheckoutSettings(dcCheckoutSettings));
            await Task.WhenAll(tasks);

            tasks.ForEach(x =>
            {
                var y = (dynamic) x;


                var serviceClientResponse = y.Result;


                if (serviceClientResponse.HasException)
                {
                    throw (Exception) serviceClientResponse.ReadException();
                }
            });
        }

        private async Task<string> GetCountryCodeForSite()
        {
            var currsite =
                (await _tenantClient.GetSite(_context.TenantId, _context.SiteId, false, string.Empty)).ReadAsSync();
            var currCountryCode = currsite.CountryCode;
            return currCountryCode;
        }

        private async Task<DC.Gateway> GetGatewayForCountry(string currCountryCode)
        {
            DC.Gateway gateway = null;

            var currentGatewayRes = (await _checkoutSettingsWebApiClient.GetActiveGatewayForCountry(currCountryCode));
            if (currentGatewayRes.ResponseMessage.IsSuccessStatusCode)
            {
                gateway = currentGatewayRes.ReadAsSync();
            }
            return gateway;
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
                    x.SupportedCards = new List<KeyValuePair<string, string>>
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
