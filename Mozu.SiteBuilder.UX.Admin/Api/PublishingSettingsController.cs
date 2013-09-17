using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
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
        private const string COOKIE_NAME = "publishing_preferences";

        private ISiteBuilderApiContext _ctx;
        private IGeneralSettingsWebApiClient _siteSettingsClient;
        private ISiteGroupWebApiClient _siteGroupClient;
        private ICookieProvider _cookieMonster;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public PublishingSettingsController(ISiteBuilderApiContext ctx, IGeneralSettingsWebApiClient siteSettingsClient, ISiteGroupWebApiClient siteGroupClient, ICookieProvider cookieMonster)
        {
            _ctx = ctx;
            _siteSettingsClient = siteSettingsClient;
            _siteGroupClient = siteGroupClient;
            _cookieMonster = cookieMonster;
        }

        public class PublishingPreferencesArgs {
            public int SiteGroupId { get; set; }
            public string ProductPublishingMode { get; set; }
        }
        [HttpPutRoute(UriTemplate = "product")]
        public async Task<Response<DC.SiteGroup>> UpdateProductPublishingPreferences(PublishingPreferencesArgs args)
        {
            DC.SiteGroup res;

            // TODO: no service support yet.
            if (true)
            {
                var sitegroupPublishingPreferences = new Dictionary<string, string>();
                
                // read existing shit from a cookie.
                HttpCookie oldCookie = _cookieMonster.GetRequestCookie(COOKIE_NAME);
                if (oldCookie != null && !String.IsNullOrEmpty(oldCookie.Value))
                    oldCookie.Value.Split(';').ToList().ForEach(cfg => sitegroupPublishingPreferences.Add(cfg.Split(':')[0], cfg.Split(':')[1]));

                // inject the new preferences into the list.
                sitegroupPublishingPreferences[args.SiteGroupId.ToString()] = args.ProductPublishingMode;

                // write a cookie back out.
                string[] prefsList = sitegroupPublishingPreferences.Select(kvp => kvp.Key + ":" + kvp.Value).ToArray();
                HttpCookie newCookie = new HttpCookie(COOKIE_NAME, String.Join(";", prefsList));
                _cookieMonster.SaveResponseCookie(COOKIE_NAME, newCookie);

                res = new DC.SiteGroup { Id = args.SiteGroupId, ProductPublishingMode = args.ProductPublishingMode };
            }
            else
            {
                var dcSettings = (await _siteGroupClient.GetSiteGroup(args.SiteGroupId)).ReadAsSync();
                dcSettings.ProductPublishingMode = args.ProductPublishingMode;
                res = (await _siteGroupClient.UpdateSiteGroup(dcSettings, args.SiteGroupId)).ReadAsSync();
            }

            return Single2(res);
        }

        public async void UpdateContentPublishingPreferences(int siteId)
        {
            var dcSettings = (await _siteSettingsClient.GetGeneralSettings()).ReadAsSync();
        }
    }
}
