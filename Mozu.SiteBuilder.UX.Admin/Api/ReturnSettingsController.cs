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
    [WebApi("app/returnSettings", SuppressDescriptorGeneration = true)]
    public class ReturnSettingsController : BaseController
    {
        private readonly IReturnSettingsWebApiClient _returnSettingsWebApiClient;
     
        /// <summary>
        /// Constructor.
        /// </summary>
        public ReturnSettingsController(IReturnSettingsWebApiClient returnSettingsWebApiClient)
        {
            _returnSettingsWebApiClient = returnSettingsWebApiClient;
        }

        /// <summary>
        /// Returns the active fulfillment settings
        /// </summary>
        /// <returns></returns>
        [HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<DC.Returns.ReturnSettings>> GetSettings()
        {
            var returnSettings = (await _returnSettingsWebApiClient.GetReturnSettings()).ReadAsSync();
            return Single2(returnSettings);
        }

        [HttpPutRoute(UriTemplate = "update")]
        public async Task<Response<DC.Returns.ReturnSettings>> UpdateSettings(DC.Returns.ReturnSettings fulfillmentSettings)
        {
            var itemOut = (await _returnSettingsWebApiClient.UpdateReturnSettings(fulfillmentSettings)).ReadAsSync();
            return Single2(itemOut);
        }

    }
}
