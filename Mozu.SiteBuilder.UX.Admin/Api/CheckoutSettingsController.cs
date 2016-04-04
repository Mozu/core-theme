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
using System.Net.Http;
using System.Net;
using Mozu.SiteBuilder.Mvc.Contexts;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/checkoutsettings", SuppressDescriptorGeneration = true)]
    public class CheckoutSettingsController : BaseController
    {
        private readonly ICheckoutSettingsWebApiClient _checkoutSettingsWebApiClient;
        private readonly IApiContext _context;
        private readonly ITenantsWebApiClient _tenantClient;
        private readonly ITenantAdminSettingsContext _tenantAdminSettingsContext;

        /// <summary>
        /// Constructor.
        /// </summary>
        public CheckoutSettingsController(ICheckoutSettingsWebApiClient checkoutSettingsWebApiClient, ITenantsWebApiClient tenantClient, IApiContext context, ITenantAdminSettingsContext tenantAdminSettingsContext)
        {
            _checkoutSettingsWebApiClient = checkoutSettingsWebApiClient;
            _context = context;
            _tenantClient = tenantClient.CloneWithoutUserClaims();

            _tenantAdminSettingsContext = tenantAdminSettingsContext;
        }

        /// <summary>
        /// Returns the active checkout settings
        /// </summary>
        /// <returns></returns>
        [HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<CheckoutSettings>> GetSettings()
        {
            var dcSettings = (await _checkoutSettingsWebApiClient.GetCheckoutSettings()).ReadAsSync();

            //TODO: remove - to keep old admin working.
            if (!_tenantAdminSettingsContext.EnableBetaAdmin)
            {
                string currCountryCode = await GetCountryCodeForSite();
                // filter out all gateways not from our current country code.
                dcSettings.PaymentSettings.Gateways = (
                    from g in dcSettings.PaymentSettings.Gateways
                    where g.GatewayAccount != null
                    where g.GatewayAccount.IsActive
                    where currCountryCode.Equals(g.GatewayAccount.CountryCode, StringComparison.InvariantCultureIgnoreCase)
                    select g
                ).ToList();
            }

            var ret = Mapper.Map<CheckoutSettings>(dcSettings);
            return Single2(ret);
        }

        /// <summary>
        /// Returns the active checkout settings
        /// </summary>
        /// <returns></returns>
        [HttpGetRoute(UriTemplate = "gateways/read")]
        public async Task<Response<List<Gateway>>> GetGateways()
        {
            var gateways = await (await _checkoutSettingsWebApiClient.GetGateways()).ReadAsAsync();

            var ret = Mapper.Map<List<Gateway>>(gateways);
            return List2(ret);
        }

        [HttpPostRoute(UriTemplate = "gateways/create")]
        public async Task<Response<Gateway>> CreateGateway(Gateway gateway)
        {
            var dcGateway = Mapper.Map<DC.TenantGateway>(gateway);
            var resp = await (await _checkoutSettingsWebApiClient.CreateTenantGateway(dcGateway)).ReadAsAsync();

            var ret = Mapper.Map<Gateway>(resp);
            return Single2(ret);
        }


        [HttpPostRoute(UriTemplate = "gateways/update")]
        public async Task<Response<Gateway>> UpdateGateway(Gateway gateway)
        {
            var dcGateway = Mapper.Map<DC.TenantGateway>(gateway);
            var resp = await (await _checkoutSettingsWebApiClient.UpdateTenantGateway(gateway.Id, dcGateway)).ReadAsAsync();

            var ret = Mapper.Map<Gateway>(resp);
            return Single2(ret);
        }


        [HttpPostRoute(UriTemplate = "gateways/delete")]
        public async Task<Response<Gateway>> DeleteGateway(Gateway gateway)
        {
            await (await _checkoutSettingsWebApiClient.DeleteTenantGateway(gateway.Id)).ReadAsAsync();
            return EmptySingle2<Gateway>();
        }

        /// <summary>
        /// Returns the active checkout settings
        /// </summary>
        /// <returns></returns>
        [HttpGetRoute(UriTemplate = "cards/list")]
        public async Task<Response<List<KeyValuePair<string, string>>>> GetCards()
        {
            if (!_tenantAdminSettingsContext.EnableBetaAdmin)
            {
                var currCountryCode = await GetCountryCodeForSite();
                var dcGateway = (await _checkoutSettingsWebApiClient.CloneWithoutUserClaims().GetActiveGatewayForCountry(currCountryCode)).ReadAsSync();
                var old = dcGateway.SupportedCards.Select(x => new KeyValuePair<string, string>(x, x)).ToList();
                return List2(old);
            }

            var settings = await (await _checkoutSettingsWebApiClient.CloneWithoutUserClaims().GetCheckoutSettings()).ReadAsAsync();
            var cards = settings.PaymentSettings.Gateways.SelectMany(g => g.SupportedCards);

            var ret = cards.Select(x => new KeyValuePair<string, string>(x, x)) .ToList();
            return List2(ret);
        }

        /// <summary>
        /// Returns the active checkout settings
        /// </summary>
        /// <returns></returns>
        [HttpGetRoute(UriTemplate = "cardtype/list")]
        public async Task<Response<List<KeyValuePair<string, string>>>> GetCardTypes()
        {
            var ret = new List<KeyValuePair<string, string>>
                    {
                        new KeyValuePair<string, string>("VISA", "VISA"),
                        new KeyValuePair<string, string>("AMEX", "American Express"),
                        new KeyValuePair<string, string>("MC", "MasterCard"),
                        new KeyValuePair<string, string>("DISCOVER", "Discover"),
                        new KeyValuePair<string, string>("JCB", "JCB"),
                    };
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

            //TODO: remove - to keep old admin working.
            if (!_tenantAdminSettingsContext.EnableBetaAdmin)
            {
                var currCountryCode = await GetCountryCodeForSite();
                var gateway = await GetGatewayForCountry(currCountryCode);

                var posted = dcPaymentSettings.Gateways.First();
                posted.GatewayAccount.CountryCode = currCountryCode; // 2014-10-7 chusk: according to Wallis, we are fine with locking down gateways to Site Country codes

                await UpdateSettings(gateway, posted, dcPaymentSettings, dcOrderProcessingSettings, dcCheckoutSettings);
                var result = await GetSettings();
                return result;
            }


            await UpdateSettings(null, null, dcPaymentSettings, dcOrderProcessingSettings, dcCheckoutSettings);

            var newSettings = await GetSettings();
            return newSettings;
        }

        private async Task UpdateSettings(DC.Gateway gateway, DC.Gateway posted, DC.PaymentSettings dcPaymentSettings, DC.OrderProcessingSettings dcOrderProcessingSettings, DC.CustomerCheckoutSettings dcCheckoutSettings)
        {

            //TODO: remove - to keep old admin working.
            if (!_tenantAdminSettingsContext.EnableBetaAdmin)
            {
                if (gateway != null && gateway.GatewayAccount.GatewayDefinitionId == posted.GatewayAccount.GatewayDefinitionId)
                {
                    await (await _checkoutSettingsWebApiClient.UpdateGateway(gateway.GatewayAccount.Id, posted)).ReadAsAsync();
                }
                else
                {
                    await (await _checkoutSettingsWebApiClient.CreateGateway(posted)).ReadAsAsync();
                }
            }

            var tasks = new List<Task>();

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

        //TODO: remove after we remove old admin.
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

            //TODO: remove after we remove old admin.
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
                        new KeyValuePair<string, string>("JCB", "JCB"),
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
