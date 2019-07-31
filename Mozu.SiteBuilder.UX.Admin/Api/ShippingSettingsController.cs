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
using Mozu.SiteSettings.Shipping.Contracts;
using Mozu.SiteSettings.Shipping.Contracts.Clients;
using GatewayDefinition = Mozu.PaymentService.Contracts.GatewayDefinition;
using SupportedCard = Mozu.PaymentService.Contracts.SupportedCard;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/shippingSettings", SuppressDescriptorGeneration = true)]
    public class ShippingSettingsController : BaseController
    {
        private readonly IShippingSettingsWebApiClient _shippingSettingsWebApiClient;
     
        /// <summary>
        /// Constructor.
        /// </summary>
        public ShippingSettingsController(IShippingSettingsWebApiClient shippingSettingsWebApiClient)
        {
            _shippingSettingsWebApiClient = shippingSettingsWebApiClient;
        }

        /// <summary>
        /// Returns the active fulfillment settings
        /// </summary>
        /// <returns></returns>
        [HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<SiteShippingSettings>> GetSettings()
        {
            var returnSettings = (await _shippingSettingsWebApiClient.GetSiteShippingSettings()).ReadAsSync();
            return Single2(returnSettings);
        }

        [HttpPutRoute(UriTemplate = "update")]
        public async Task<Response<SiteShippingSettings>> UpdateSettings(SiteShippingSettings siteShippingSettings)
        {
            var itemOut = (await _shippingSettingsWebApiClient.UpdateSiteShippingSettings(siteShippingSettings)).ReadAsSync();
            return Single2(itemOut);
        }

    }
}
