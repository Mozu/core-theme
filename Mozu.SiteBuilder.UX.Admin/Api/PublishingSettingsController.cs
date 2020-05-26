using System.Threading.Tasks;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Routing;
using Mozu.Core.Logging;
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
        private DC.PublishingScope ALL_PRODUCTS_SCOPE = new DC.PublishingScope { AllPending = true };

        private ISiteBuilderApiContext _ctx;
        private IGeneralSettingsWebApiClient _siteSettingsClient;
        private IMasterCatalogWebApiClient _siteGroupClient;
        private IPublishingWebApiClient _publishingClient;
        private ILogger _log;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public PublishingSettingsController(ISiteBuilderApiContext ctx, IGeneralSettingsWebApiClient siteSettingsClient, IMasterCatalogWebApiClient  siteGroupClient, IPublishingWebApiClient publishingClient, ILogger log)
        {
            _ctx = ctx;
            _siteSettingsClient = siteSettingsClient;
            _siteGroupClient = siteGroupClient;
            _publishingClient = publishingClient;
            _log = log;
        }

        public class PublishingPreferencesArgs {
            public int MasterCatalogId { get; set; }
            public string ProductPublishingMode { get; set; }

            public bool? IsLiveEditEnabled { get; set; }
        }
        [HttpPostRoute (UriTemplate = "product")]
        public async Task<Response<DC.MasterCatalog >> UpdateProductPublishingPreferences(PublishingPreferencesArgs args)
        {
            var dcSettings = (await _siteGroupClient.GetMasterCatalog( args.MasterCatalogId)).ReadAsSync();
            if (!string.IsNullOrEmpty(args.ProductPublishingMode))
            {
            dcSettings.ProductPublishingMode = args.ProductPublishingMode;
            }
            if (args.IsLiveEditEnabled.HasValue)
            {
                dcSettings.EnableLiveEdit = args.IsLiveEditEnabled.Value;
            }
            var svcResponse = await _siteGroupClient.UpdateMasterCatalog(dcSettings, args.MasterCatalogId);

            // handle "you cannot change modes because there is unpublished content by publishing all content."
            if (svcResponse.HasException && svcResponse.ResponseMessage.StatusCode == System.Net.HttpStatusCode.Conflict)
            {
                _log.Info("Caught error changing publishing preferences, attempting to publish first..");
                var masterCatPubClient = _publishingClient.CloneWithApiContext(ctx => { ctx.MasterCatalogId = args.MasterCatalogId; });
                var publishResponse = await masterCatPubClient.PublishDrafts(ALL_PRODUCTS_SCOPE, TargetContextLevelType.MasterCatalog.ToString());
                if (!publishResponse.HasException && publishResponse.ResponseMessage.StatusCode == System.Net.HttpStatusCode.OK)
                    _log.Info("Published successfully.");
                else
                    publishResponse.ReadAsSync(); // read will throw an exception which will bubble.

                svcResponse = await _siteGroupClient.UpdateMasterCatalog(dcSettings, args.MasterCatalogId, targetContextLevel:TargetContextLevelType.MasterCatalog);
            }

            DC.MasterCatalog res = svcResponse.ReadAsSync();
            return Single2(res);
        }

        public async void UpdateContentPublishingPreferences(int siteId)
        {
            var dcSettings = (await _siteSettingsClient.GetGeneralSettings()).ReadAsSync();
        }
    }
}
