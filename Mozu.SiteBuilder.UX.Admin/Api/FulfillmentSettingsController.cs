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
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.Core.Extensions;
using Mozu.PaymentService.Contracts;
using GatewayDefinition = Mozu.PaymentService.Contracts.GatewayDefinition;
using SupportedCard = Mozu.PaymentService.Contracts.SupportedCard;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/fulfillmentSettings", SuppressDescriptorGeneration = true)]
    public class FulfillmentSettingsController : BaseController
    {
        private readonly IFulfillmentSettingsWebApiClient _fulfillmentSettingsWebApiClient;
     
        /// <summary>
        /// Constructor.
        /// </summary>
        public FulfillmentSettingsController(IFulfillmentSettingsWebApiClient fulfillmentSettingsWebApiClient)
        {
            _fulfillmentSettingsWebApiClient = fulfillmentSettingsWebApiClient;
        }

        /// <summary>
        /// Returns the active fulfillment settings
        /// </summary>
        /// <returns></returns>
        [HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<DC.Fulfillment.FulfillmentSettings>> GetSettings()
        {
            var fulfillmentSettings = (await _fulfillmentSettingsWebApiClient.GetFulfillmentSettings()).ReadAsSync();
            return Single2(fulfillmentSettings);
        }

        [HttpPutRoute(UriTemplate = "update")]
        public async Task<Response<DC.Fulfillment.FulfillmentSettings>> UpdateSettings(DC.Fulfillment.FulfillmentSettings fulfillmentSettings)
        {
            var itemOut = (await _fulfillmentSettingsWebApiClient.UpdateFulfillmentSettings(fulfillmentSettings)).ReadAsSync();
            return Single2(itemOut);
        }

    }
}
