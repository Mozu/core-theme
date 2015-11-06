using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Client.Caching;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Controllers;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Messaging;
using Mozu.SiteBuilder.UX.Models.Settings;
using Mozu.SiteBuilder.UX.Models.Visit;
using Mozu.SiteSettings.Order.Contracts.Clients;
using Mozu.Tenant.Contracts.Clients;
using Constants = Mozu.Core.Api.Contracts.Constants;

namespace Mozu.SiteBuilder.UX.Areas.Misc.Controllers
{
    public class TestingController : ApiControllerBase
    {
        ISitesWebApiClient _wsRepo;
        ITenantsWebApiClient _tRepo;
        ICookieProvider _cookies;
        IAuthenticationHelper _authenticationHelper;
        private readonly ISettings _settings;
        private readonly ICheckoutSettingsWebApiClient _checkoutSettingsWebApiClient;

        private const string FORCE_THEME_COOKIE_NAME = "SBTHEME";

        private enum ThemeMode
        {
            Desktop,
            Mobile,
            Auto,
            Tablet
        }

        public TestingController(ISitesWebApiClient  wsRepo, ITenantsWebApiClient tRepo, ICookieProvider cookies, ISettings settings , Mozu.SiteSettings.Order.Contracts.Clients.ICheckoutSettingsWebApiClient checkoutSettingsWebApiClient, IAuthenticationHelper authenticationHelper)
        {
            _wsRepo = wsRepo.CloneWithoutUserClaims();
            _tRepo = tRepo.CloneWithoutUserClaims();
            _cookies = cookies;
            _settings = settings;
            _checkoutSettingsWebApiClient = checkoutSettingsWebApiClient;
            _authenticationHelper = authenticationHelper;
//            SuppressMissingContextRedirect = true;
        }



        [AcceptVerbs("POST")]
        public HttpResponseMessage RefreshAPiContextHeaders()
        {
            IEnumerable<string> tmp;
            if (this.Request.Headers.TryGetValues(Constants.Headers.APP_CLAIMS, out tmp))
            {
                var appClaim = Mozu.Core.LightweightAppClaims.Parse(tmp.First());
                if ((DateTime.UtcNow - appClaim.Expiration).TotalDays < 1)
                {
                    var clientApiContext = this.Request.Resolve<ClientApiContext>();
                    var resp = Request.CreateResponse(HttpStatusCode.OK);
                    resp.Headers.Add(Constants.Headers.APP_CLAIMS, clientApiContext.Headers[Constants.Headers.APP_CLAIMS]);
                    resp.Headers.Add(Constants.Headers.USER_CLAIMS, clientApiContext.Headers[Constants.Headers.USER_CLAIMS]);
                    return resp;
                }
            }
            return Request.CreateErrorResponse(HttpStatusCode.Unauthorized, "not authorized");
        }



        [AcceptVerbs("GET")]
        public HttpResponseMessage CoolDownUser()
        {
            this.SbApiContext.UserClaims.Expiration = DateTime.Now.AddDays(-1);
            _authenticationHelper.SaveStoreFrontAccessToken(this.SbApiContext.UserClaims.ToAccessToken(), this.PageContext.UserProfile.ToToken());
            _authenticationHelper.SaveStoreFrontRefreshToken(null, DateTime.Now.AddDays(-1));
            return this.Request.CreateResponse(HttpStatusCode.OK, new
            {
                Message = "Cool."
            });
        }
        static HttpClient _client;

        [AcceptVerbs("GET", "PUT", "DELETE", "POST", "OPTIONS")]


        public Task<HttpResponseMessage> Api(string url)
        {
            var service = _settings.Resources.FirstOrDefault(x => url.IndexOf(x.Path, StringComparison.OrdinalIgnoreCase) == 0);
            _client = _client ?? new HttpClient() {MaxResponseContentBufferSize = int.MaxValue, Timeout = new TimeSpan(0, 1, 3, 0)};

            this.Request.RequestUri = new Uri(service.BaseUrl + this.Request.RequestUri.PathAndQuery.Substring(4));
            IEnumerable<string> vals;
            if (this.Request.Headers.TryGetValues("X-HTTP-Method-Override", out vals)&& vals.Count()>0)
            {
                this.Request.Method = new HttpMethod(vals.First());
            }

            if (this.Request.Content.Headers.ContentLength == 0)
            {
                this.Request.Content = null;
            }
            return _client.SendAsync(this.Request);

        }


        //[System.Web.Http.HttpGet]
        //public async Task<ActionResult> widgettest()
        //{
        //    var pc = this.PageContext;

        //    pc.CmsContext = new CmsPageContext()
        //    {
        //        Page = new DocumentRequest()
        //        {
        //            Path = "widgettest",
        //            ListFQN = "pages@mozu",
        //            DocumentTypeFQN = "web_page@mozu"
        //        }

        //    };


        //    var helper = new CmsHelper(CmsService);
        //    await helper.InitCmsPageContext(PageContext);
        //    return this.View("WidgetTEsting/test", this.SiteContext );
        //}




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
                if (mode == ThemeMode.Desktop) themeName = (SiteContext.GeneralSettings.DesktopTheme ?? new ThemeSelection()).Id;
                if (mode == ThemeMode.Mobile) themeName = (SiteContext.GeneralSettings.MobileTheme ?? new ThemeSelection()).Id;
                if (mode == ThemeMode.Tablet) themeName = (SiteContext.GeneralSettings.TabletTheme ?? new ThemeSelection()).Id;
                _cookies.SaveResponseCookie(FORCE_THEME_COOKIE_NAME, new HttpCookie(FORCE_THEME_COOKIE_NAME, themeName));
            }
            return new RedirectResult(redir ?? "/");
        }


        [System.Web.Http.HttpPost]
        public HttpResponseMessage Visit(string id=null)
        {
            int accountId;
            if (int.TryParse(id, out accountId))
            {
                this.PageContext.User.AccountId = accountId;

            }
            

            var publisher = this.Request.Resolve<VisitEventPublisher>();
            
         

            publisher.PublishVisit(new Visit()
                                   {
                                      
                                    //   CustomerId  = int.Parse(id),
                                       VisitId = Guid.NewGuid().ToUrlSafeString(),
                                       IsTracked = true,
                                       UserAgent = "blurf",
                                       VisitorId = Guid.NewGuid().ToUrlSafeString()
                                   });
            return this.Request.CreateErrorResponse(HttpStatusCode.NotFound, "page not found");
        }


        [System.Web.Http.HttpGet]
        public ContentResult Echo()
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendLine("<pre>");
            sb.AppendLine();
            sb.AppendLine("headers");
            sb.AppendLine("_____________");
            foreach (var httpRequestHeader in this.Request.Headers )
            {
                sb.AppendFormat("{0}:{1}", httpRequestHeader.Key, string.Join(",", httpRequestHeader.Value));
                sb.AppendLine();
            }
             sb.AppendLine();
            sb.AppendLine("server vars");
            sb.AppendFormat("{0}:{1}", "manchine name" ,this.HttpContext.Server.MachineName );
            sb.AppendLine();
            sb.AppendFormat("{0}:{1}", "version" ,this.GetType().Assembly.GetName().Version  );
           
            sb.AppendLine("</pre>");
               return new ContentResult()
                      {
                          Content = sb.ToString(),
                          ContentType ="text/html"
                      };
            //return this.Request.CreateResponse(HttpStatusCode.OK, sb.ToString());
        }

        /// <summary>
        /// Updates the sitebuildercontext and redirects the 
        /// GET: /_gosite/(siteid)?redir=...&environment=...
        /// </summary>
        [System.Web.Http.HttpGet]
        public async Task<ActionResult> GoSite(int siteId, string redir = null, string environment = "production", string transfer = null)
        {
            var res = await _wsRepo.GetSite(siteId);
            var site = res.ReadAsAsync().Result;

            var domains = site.Domains.Where(x => x.IsInfrastructureRecord == false).ToList();

            IEnumerable<string> domainList;
            var viewMode = DataViewModeType.NoneSet;
            switch ((environment ?? "").ToLower())
            {
                case "preview":
                case "admin-pending":
                case "staging":
                    {
                        var invalidator = Request.Resolve<IDirtyCacheInvalidator>();
                        invalidator.Invalidate();
                        viewMode = DataViewModeType.Pending;
                        domainList = domains.Where(x => x.IsSystemAssigned).Select(x => "admin-pending-view." + x.DomainName);
                        break;
                    }
                case "editing":
                    {
                        viewMode = DataViewModeType.Pending;
                        domainList = Enumerable.Empty<string>();
                        break;
                    }
                case "primary":
                case "production":
                default:
                    {
                        domainList = domains.OrderByDescending(s => s.IsPrimary).Select(x => x.DomainName);
                        break;
                    }
            }



            string newHostname = (domainList.FirstOrDefault());
            bool doHostnameRedirect = _settings.AppSettings("ReverseProxy") == "true" && !string.IsNullOrEmpty(newHostname);

            if (!string.IsNullOrEmpty(transfer))
            {
                var redirUrl = "~/" + Uri.UnescapeDataString(transfer).TrimStart('/');

                var writableContext = (SiteBuilderApiContext)SbApiContext;
                var headers = new NameValueCollection();

                headers[Constants.Headers.TENANT] = site.TenantId.ToString();
                headers[Constants.Headers.MASTER_CATALOG] = site.MasterCatalogId.ToString();
                headers[Constants.Headers.CATALOG] = site.CatalogId.ToString();
                headers[Constants.Headers.SITE] = site.Id.ToString();
                headers[Constants.Headers.LOCALE] = site.DefaultLocaleCode;
                headers[Constants.Headers.CURRENCY] = site.DefaultCurrencyCode;
                headers[Constants.Headers.DATA_VIEW_MODE] = viewMode.ToString();

                return new TransferResult(redirUrl)
                {
                    Headers = headers
                };
            }
            SiteContext.Save(site: site.Id, masterCatalog: site.MasterCatalogId, tenant: site.TenantId, isEditMode: false, dataViewMode: viewMode, cookieProvider: _cookies, catalogid: site.CatalogId.Value, locale: site.DefaultLocaleCode, currency: site.DefaultCurrencyCode);

            var uri = CreateRedirectUrl(redir, newHostname, doHostnameRedirect);
            return new RedirectResult(uri);
        }

        public static string CreateRedirectUrl(string redir, string newHostname, bool doHostnameRedirect)
        {
            if (redir.IsNullOrEmpty()) return doHostnameRedirect ? "http://" + newHostname : "~/";

            redir = redir.StartsWith("http") || redir.StartsWith("/") ? 
                redir : 
                "/" + redir;
            var redirUri = new Uri(Uri.UnescapeDataString(redir), UriKind.RelativeOrAbsolute);

            if (redirUri.IsAbsoluteUri || doHostnameRedirect)
            {
                // for an absolute url (think custom route that specifies a http schema) we must always use the resolved hostname.
                var scheme = redirUri.IsAbsoluteUri ? redirUri.Scheme : "http";
                var qmarkpos = redirUri.OriginalString.IndexOf('?');
                var path = redirUri.IsAbsoluteUri ? 
                    redirUri.LocalPath : 
                    redirUri.OriginalString.Substring(0, qmarkpos != -1 ? 
                    qmarkpos : 
                    redirUri.OriginalString.Length);
                var query = redirUri.IsAbsoluteUri ? 
                    redirUri.Query.TrimStart('?') : 
                    (qmarkpos != -1 ? 
                        redirUri.OriginalString.Substring(qmarkpos+1) : 
                        string.Empty);

                var builder = new UriBuilder(scheme, newHostname);
                builder.Path = path;
                builder.Query = query;
                return builder.Uri.ToString();
            }
            else
            {
                return "~" + redirUri.OriginalString;
            }
        }
    }

}
