using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.Core.Api.Routing;
using Mozu.Core.Settings;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteSettings.General.Contracts.Clients;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/settings/publishing", SuppressDescriptorGeneration = true)]
    public class PublishingSettingsController : BaseController
    {
        private ISiteBuilderApiContext _ctx;
        private IGeneralSettingsWebApiClient _siteSettingsClient;
        private ISiteGroupWebApiClient _siteGroupClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public PublishingSettingsController(ISiteBuilderApiContext ctx, IGeneralSettingsWebApiClient siteSettingsClient, ISiteGroupWebApiClient siteGroupClient)
        {
            _ctx = ctx;
            _siteSettingsClient = siteSettingsClient;
            _siteGroupClient = siteGroupClient;
        }

        public async Task<Response<DC.SiteGroup>> UpdateCatalogPublishingPreferences(int siteGroupId)
        {
            var dcSettings = (await _siteGroupClient.GetSiteGroup(siteGroupId)).ReadAsSync();
            dcSettings.ProductPublishingMode = DC.SiteGroup.ProductPublishingModeConst.Pending;
            var res = (await _siteGroupClient.UpdateSiteGroup(dcSettings, siteGroupId)).ReadAsSync();

            return Single2(res);
        }

        public async void UpdateContentPublishingPreferences(int siteId)
        {
            var dcSettings = (await _siteSettingsClient.GetGeneralSettings()).ReadAsSync();
        }
    }
}
