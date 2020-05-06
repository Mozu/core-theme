using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.SiteSettings.General.Contracts;
using DC = Mozu.SiteSettings.General.Contracts;
using Mozu.Tenant.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.Core.Extensions;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/inventorySettings", SuppressDescriptorGeneration = true)]
    public class InventorySettingsController : BaseController
    {
        private readonly IInventorySettingsWebApiClient _inventorySettingsWebApiClient;

        /// <summary>
        /// Constructor.
        /// </summary>
        public InventorySettingsController(IInventorySettingsWebApiClient inventorySettingsWebApiClient)
        {
            _inventorySettingsWebApiClient = inventorySettingsWebApiClient;
        }

        /// <summary>
        /// Returns the active inventory settings
        /// </summary>
        /// <returns></returns>
        [HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<DC.General.InventorySettings>> GetSettings()
        {
            var inventorySettings = (await _inventorySettingsWebApiClient.GetInventorySettings()).ReadAsSync();
            return Single2(inventorySettings);
        }

        [HttpPutRoute(UriTemplate = "update")]
        public async Task<Response<DC.General.InventorySettings>> UpdateSettings(DC.General.InventorySettings inventorySettings)
        {
            var itemOut = (await _inventorySettingsWebApiClient.UpdateInventorySettings(inventorySettings)).ReadAsSync();
            return Single2(itemOut);
        }

    }
}