using System.Net;
using System.Threading;
using System.Web.Mvc;
using Mozu.Core.Extensions;
using Mozu.Tenant.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Admin.Filters;
using AccountApi = Mozu.SiteBuilder.UX.Admin.Api.AccountController;

namespace Mozu.SiteBuilder.UX.Admin.Controllers
{
    [SiteBuilderAuthorize]
    public class HomeController : Controller
    {
        private readonly AccountApi _accountApi;
        private IAuthenticationHelper _authenticationHelper;
        private ISiteBuilderContext _sbc;
        private readonly ISitesWebApiClient _sitesWebApiClient;
        public HomeController( AccountApi accountApi, AuthenticationHelper authHelper, ISiteBuilderContext sbc, ISitesWebApiClient sitesWebApiClient)
        {
            _authenticationHelper = authHelper;
            _accountApi = accountApi;
            _sbc = sbc;
            _sitesWebApiClient = sitesWebApiClient;
        }
        //
        // GET: /Home/
        public ActionResult Index()
        {
            var user = _accountApi.GetCurrentUser();
            var roles = _accountApi.GetUserSitesRoles(user.Id);
            var siteRes = _sitesWebApiClient.GetSite(_sbc.SiteId).Result;
            if ( siteRes.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
            {
                _accountApi.Logoff();
            }
           

            if (roles.IsNullOrEmpty())
            {
                _accountApi.Logoff();
            }
            var site = siteRes.ReadAsSync();
            // this.ViewData["user"] = _authenticationHelper.GetCurrentUser();
            this.ViewData["user"] = user;
            this.ViewData["siteRoles"] = roles;
            this.ViewData["site"] = site;
            this.ViewData["extlocalefile"] = GetExtLocaleFile(Thread.CurrentThread.CurrentCulture.TwoLetterISOLanguageName);
            this.ViewData["useGoogleAnalytics"] = System.Configuration.ConfigurationManager.AppSettings["useGoogleAnalytics"];
            this.ViewData["googleAnalyticsAccount"] = System.Configuration.ConfigurationManager.AppSettings["googleAnalyticsAccount"];
            if (this.HttpContext.Request["testHarnessMode"] == "true")
            {
                return View("TestHarnes");
            }
            if (System.Configuration.ConfigurationManager.AppSettings["use_compiled_taco"] == "true")
            {
                return View("Index_Compiled");
            }

            return View();
        }

        private static string GetExtLocaleFile(string language)
        {
            const string filename = "ext-lang-{0}.js";

            switch(language.ToLower())
            {
                case "de":
                    return string.Format(filename, "de");
                default:
                    return string.Format(filename, "en");
            }
        }
    }
}
