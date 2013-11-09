
using System.Linq;
using System.Web.Http;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Settings;
using Mozu.PaymentService.Contracts;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteSettings.Order.Contracts;
using Mozu.SiteSettings.Order.Contracts.Clients;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.Core.ErrorHandling;
using System.Threading.Tasks;
using System;
using System.Net;
using System.Web;
using System.Collections.Generic;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.UX.Areas.Misc.Controllers
{
    public class TestingController : BaseApiController
    {
        ISitesWebApiClient _wsRepo;
        ITenantsWebApiClient _tRepo;
        ICookieProvider _cookies;
        private readonly ISettings _settings;
        private readonly ICheckoutSettingsWebApiClient _checkoutSettingsWebApiClient;

        private const string FORCE_THEME_COOKIE_NAME = "SBTHEME";

        private enum ThemeMode
        {
            Desktop,
            Mobile,
            Auto
        }

        public TestingController(ISitesWebApiClient  wsRepo, ITenantsWebApiClient tRepo, ICookieProvider cookies, ISettings settings , Mozu.SiteSettings.Order.Contracts.Clients.ICheckoutSettingsWebApiClient checkoutSettingsWebApiClient )
        {
            _wsRepo = wsRepo.CloneWithoutUserClaims();
            _tRepo = tRepo.CloneWithoutUserClaims();
            _cookies = cookies;
            _settings = settings;
            _checkoutSettingsWebApiClient = checkoutSettingsWebApiClient;
//            SuppressMissingContextRedirect = true;
        }


        [System.Web.Http.HttpGet]
        public async Task<ActionResult> widgettest()
        {
            var pc = this.PageContext;

            pc.CmsContext = new CmsPageContext()
            {
                Page = new DocumentRequest()
                {
                    Path = "widgettest",
                    Collection = "pages",
                    DocumentType = "web_page"
                }

            };

            var helper = new CmsHelper(CmsService);
            await helper.InitCmsPageContext(PageContext.CmsContext);
            return this.View("WidgetTEsting/test", this.SiteContext );
        }




        [System.Web.Http.HttpGet]
        public ActionResult ForceTheme(string themeType = "", string redir = null)
        {
            ThemeMode mode = (ThemeMode)Enum.Parse(typeof(ThemeMode), themeType, true);
            string themeName = "";
            if (mode == ThemeMode.Auto)
            {
                _cookies.RemoveCookie(FORCE_THEME_COOKIE_NAME);
                _cookies.SaveResponseCookie(FORCE_THEME_COOKIE_NAME, new HttpCookie(FORCE_THEME_COOKIE_NAME) { Expires = DateTime.Now.AddDays(-1D) });
            }
            else
            {
                if (mode == ThemeMode.Desktop) themeName = SiteContext.GeneralSettings.Theme;
                if (mode == ThemeMode.Mobile) themeName = SiteContext.GeneralSettings.MobileTheme ;
                _cookies.SaveResponseCookie(FORCE_THEME_COOKIE_NAME, new HttpCookie(FORCE_THEME_COOKIE_NAME, themeName));
            }
            return new RedirectResult(redir ?? "/");
        }

        /// <summary>
        /// Updates the sitebuildercontext and redirects the 
        /// GET: /_gosite/(siteid)?redir=...&environment=...
        /// </summary>
           [System.Web.Http.HttpGet]
        public async Task<ActionResult> GoSite(int siteId, string redir= null, string environment= "production")
        {
            var res = await _wsRepo.GetSite(siteId);
            var site = res.ReadAsAsync().Result;


            
            //string domainPriority = System.Configuration.ConfigurationManager.AppSettings["gositeDomainPriority"];
            IEnumerable<string> domainList;
            var viewMode = DataViewModeType.NoneSet;
            switch ((environment??"").ToLower())
            {
                case "primary":
                    domainList = site.Domains.OrderBy(s => s.IsPrimary).Select(x => x.DomainName);
                    break;
                case "preview":
                case "admin-pending":
                case "staging":
                    {
                        viewMode = DataViewModeType.Pending;
                        domainList = site.Domains.Where(x => x.IsSystemAssigned).Select(x => "admin-pending-view." + x.DomainName);
                    }
                    
                    break;
                default:
                    domainList = site.Domains.Select(x => x.DomainName);
                    break;
            }

            SiteBuilderContext.Save(site: site.Id, masterCatalog : site.MasterCatalogId, tenant: site.TenantId, isEditMode: false, dataViewMode: viewMode, cookieProvider: _cookies);

            
            string newHostname = (domainList.FirstOrDefault()) ;
            bool doHostnameRedirect = _settings.AppSettings("ReverseProxy") == "true" && !String.IsNullOrEmpty(newHostname);
            
            if (!String.IsNullOrEmpty(redir))
            {
                string redirUrl = Uri.UnescapeDataString(redir).TrimStart('/');

                if (doHostnameRedirect)
                {
                    redirUrl = "http://" + newHostname + "/" + redirUrl;
                }
                else
                {
                    redirUrl = "~/" + redirUrl;
                }
                    

                return new RedirectResult(redirUrl);
            }
            else
            {
                string redirUrl = doHostnameRedirect ? "http://" + newHostname : "~/";
                return new RedirectResult(redirUrl);
            }
        }


        
    }

}
