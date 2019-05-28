using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
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
using Mozu.Tenant.Contracts.Clients;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Headers = Mozu.Core.Api.Contracts.Constants.Headers;
using Mozu.SiteBuilder.Mvc.Context;

namespace Mozu.SiteBuilder.UX.Areas.Misc.Controllers
{
    public class HealthController: ApiControllerBase
    {
        public HealthController (Mozu.Core.Caching.ICacheProvider cacheProvider)
        {
            CacheProvider = cacheProvider;
        }

        public Core.Caching.ICacheProvider CacheProvider { get; }

        [HttpGet()]
        public async Task<HttpResponseMessage> Redis()
        {
           var cache = CacheProvider.GetCache(SitebuilderContextCacheRepository.CacheName, new ApiContext() { TenantId = 1 });
            var key = $"HealthCheck-{Environment.MachineName}";
            var data = DateTime.Now.ToString() +"-"+ new Random().NextDouble();
            await cache.PutAsync<string>(
                data,
                key,
                new List<string>() { "a" },
                new Core.Caching.CachePolicy() { AbsoluteExpiration = new DateTimeOffset(DateTime.Now.AddMinutes(15)) })
                .ConfigureAwait(false);
            var gotit = (await cache.GetAsync<string>(key).ConfigureAwait(false))?.Item;
            if ( data == gotit)
            {
                return new HttpResponseMessage(HttpStatusCode.OK);
            }
            return new HttpResponseMessage(HttpStatusCode.NotFound);


        }
    }
    public class TestingController : ApiControllerBase
    {
        private readonly ISitesWebApiClient _wsRepo;
        private readonly ICookieProvider _cookies;
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly ISettings _settings;

        private const string FORCE_THEME_COOKIE_NAME = "SBTHEME";

        private enum ThemeMode
        {
            Desktop,
            Mobile,
            Auto,
            Tablet
        }

        public TestingController(ISitesWebApiClient wsRepo, ICookieProvider cookies, ISettings settings, IAuthenticationHelper authenticationHelper)
        {
            _wsRepo = wsRepo.CloneWithoutUserClaims();
            _cookies = cookies;
            _settings = settings;
            _authenticationHelper = authenticationHelper;
            //SuppressMissingContextRedirect = true;
        }

        [RefreshStoreFrontUserAuthTicketFilter]
        [AcceptVerbs("POST")]
        public HttpResponseMessage RefreshAPiContextHeaders()
        {
            var resp = Request.CreateResponse(HttpStatusCode.OK);
            resp.Headers.Add(Headers.USER_CLAIMS, this.SbApiContext.UserClaims.ToAccessToken());
            resp.Headers.Add(Headers.APP_CLAIMS, LightweightAppClaims.CreateForPublicStorefront().ToAccessToken());
            return resp;
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
            _client = _client ?? new HttpClient() { MaxResponseContentBufferSize = int.MaxValue, Timeout = new TimeSpan(0, 1, 3, 0) };

            this.Request.RequestUri = new Uri(service.BaseUrl + this.Request.RequestUri.PathAndQuery.Substring(4));
            IEnumerable<string> vals;
            if (this.Request.Headers.TryGetValues("X-HTTP-Method-Override", out vals) && vals.Count() > 0)
            {
                this.Request.Method = new HttpMethod(vals.First());
            }

            IEnumerable<string> values;
            if (!this.Request.Headers.TryGetValues(Headers.USER_CLAIMS, out values))
            {
                Request.Headers.Add(Headers.USER_CLAIMS, this.SbApiContext.UserClaims.ToAccessToken());
            }

            if (!this.Request.Headers.TryGetValues(Headers.APP_CLAIMS, out values))
            {
                Request.Headers.Add(Headers.APP_CLAIMS, LightweightAppClaims.CreateForPublicStorefront().ToAccessToken());
            }

            if (this.Request.Content.Headers.ContentLength == 0)
            {
                this.Request.Content = null;
            }

            this.Request.Headers.Host = this.Request.RequestUri.Host;
            return _client.SendAsync(this.Request);
        }

        //[HttpGet]
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

        [HttpGet]
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

        [HttpPost]
        public HttpResponseMessage Visit(string id = null)
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

        [HttpGet]
        public ContentResult Echo()
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendLine("<pre>");
            sb.AppendLine();
            sb.AppendLine("headers");
            sb.AppendLine("_____________");
            foreach (var httpRequestHeader in this.Request.Headers)
            {
                sb.AppendFormat("{0}:{1}", httpRequestHeader.Key, string.Join(",", httpRequestHeader.Value));
                sb.AppendLine();
            }
            sb.AppendLine();
            sb.AppendLine("server vars");
            sb.AppendFormat("{0}:{1}", "manchine name", this.HttpContext.Server.MachineName);
            sb.AppendLine();
            sb.AppendFormat("{0}:{1}", "version", this.GetType().Assembly.GetName().Version);

            sb.AppendLine("</pre>");
            return new ContentResult()
            {
                Content = sb.ToString(),
                ContentType = "text/html"
            };
        }

        /// <summary>
        /// Updates the sitebuildercontext and redirects the 
        /// GET: /_gosite/(siteid)?redir=...&environment=...
        /// </summary>
        [HttpGet]
        public async Task<ActionResult> GoSite(int siteId, string redir = null, string environment = "production", string transfer = null, string variationId = "")
        {
            var res = await _wsRepo.GetSite(siteId);
            var site = res.ReadAsAsync().Result;

            var domains = site.Domains.Where(x => x.IsInfrastructureRecord == false).ToList();
            var isAdminMode = false;
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
                        if (!String.IsNullOrEmpty(variationId))
                        {
                            var qstring = new NameValueCollection();
                            var queryPosition = redir.IndexOf("?");
                            if (!string.IsNullOrEmpty(redir) && queryPosition > -1)
                            {
                                qstring = HttpUtility.ParseQueryString(redir.Substring(redir.IndexOf("?")));
                                qstring.Add("variationId", variationId);
                            }
                            else
                            {
                                qstring.Add("variationId", variationId);
                            }
                            var endPosition = (queryPosition > -1) ? queryPosition : redir.Length;
                            redir = redir.Substring(0, endPosition) + "?" + string.Join("&", qstring.AllKeys.Select(key => key + "=" + qstring[key]).ToArray());
                        }
                            break;

                    }
                case "editing":
                    {
                        viewMode = DataViewModeType.Pending;
                        domainList = Enumerable.Empty<string>();
                        break;
                    }
                case "standalone":
                    {
                        viewMode = DataViewModeType.Live;
                        domainList = Enumerable.Empty<string>();
                        break;
                    }
                case "admin":
                    {
                        isAdminMode = true;
                        domainList = Enumerable.Empty<string>();
                        if (!string.IsNullOrEmpty(redir) && redir.IndexOf("?") > -1)
                        {
                            var qstring = HttpUtility.ParseQueryString(redir.Substring(redir.IndexOf("?")));
                            var reqCustId = qstring["mz_cust_impersonate"];
                            var canImpersonate = (this.SbApiContext.AdminUserClaim?.HasBehavior<Core.Behaviors.CustomerUpdateBehavior>()).GetValueOrDefault(false);

                            int customerAccountId;
                            if (canImpersonate && int.TryParse(reqCustId, out customerAccountId))
                            {
                                var authTicket = (await Request.Resolve<IAuthTicketWebApiClient>()
                                    .CloneWithoutUserClaims()
                                    .CloneWithApiContext(ctx => ctx.SiteId = site.Id)
                                    .CreateImpersonatedAuthTicket(customerAccountId)).ReadAsSync();

                                var profile = new UserProfile()
                                {
                                    FirstName = authTicket.CustomerAccount?.FirstName,
                                    LastName = authTicket.CustomerAccount?.LastName,
                                    UserId = authTicket.CustomerAccount?.UserId,
                                    EmailAddress = authTicket.CustomerAccount?.EmailAddress,
                                    UserName = authTicket.CustomerAccount?.UserName
                                };

                                var authHelper = Request.Resolve<IAuthenticationHelper>();
                                authHelper.SaveStoreFrontAccessToken(authTicket.AccessToken, profile.ToToken());
                                authHelper.ClearSessionToken();
                            }
                            else
                            {
                                // If you were impersonating a shopper previously, but now the customer ID
                                // is bad (e.g. "undefined") then clear out the tokens.
                                var authHelper = Request.Resolve<IAuthenticationHelper>();
                                authHelper.ClearStorefrontTokens();
                                authHelper.ClearSessionToken();
                            }
                            if (!String.IsNullOrEmpty(variationId))
                            {
                                qstring = new NameValueCollection();
                                var queryPosition = redir.IndexOf("?");
                                if (!string.IsNullOrEmpty(redir) && queryPosition > -1)
                                {
                                    qstring = HttpUtility.ParseQueryString(redir.Substring(redir.IndexOf("?")));
                                    qstring.Add("variationId", variationId);
                                }
                                else
                                {
                                    qstring.Add("variationId", variationId);
                                }
                                var endPosition = (queryPosition > -1) ? queryPosition : redir.Length;
                                redir = redir.Substring(0, endPosition) + "?" + string.Join("&", qstring.AllKeys.Select(key => key + "=" + qstring[key]).ToArray());
                            }

                        }
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

            if(!String.IsNullOrEmpty(variationId))
            {
                this.PageContext.VariationId = variationId;
            }
            

            bool doHostnameRedirect = _settings.AppSettings("ReverseProxy") == "true" && !string.IsNullOrEmpty(newHostname);

            if (!string.IsNullOrEmpty(transfer))
            {
                var redirUrl = "~/" + Uri.UnescapeDataString(transfer).TrimStart('/');

                var writableContext = (SiteBuilderApiContext)SbApiContext;
                var headers = new NameValueCollection();

                headers[Headers.TENANT] = site.TenantId.ToString();
                headers[Headers.MASTER_CATALOG] = site.MasterCatalogId.ToString();
                headers[Headers.CATALOG] = site.CatalogId.ToString();
                headers[Headers.SITE] = site.Id.ToString();
                headers[Headers.LOCALE] = site.DefaultLocaleCode;
                headers[Headers.CURRENCY] = site.DefaultCurrencyCode;
                headers[Headers.DATA_VIEW_MODE] = viewMode.ToString();
                
                return new TransferResult(redirUrl)
                {
                    Headers = headers
                };
            }
            SiteContext.Save(site: site.Id, masterCatalog: site.MasterCatalogId, tenant: site.TenantId, isEditMode: false, dataViewMode: viewMode, cookieProvider: _cookies, catalogid: site.CatalogId.Value, locale: site.DefaultLocaleCode, currency: site.DefaultCurrencyCode, isAdminMode: isAdminMode);

            //COM-1037 fix to send isUnified Cookies on URL-Rewrite

            CookieHeaderValue cookie = Request.Headers.GetCookies("isUnified").FirstOrDefault();
            string isUnifiedCookieValue = cookie?["isUnified"].Value ?? "";

            var uri = CreateRedirectUrl(redir, newHostname, doHostnameRedirect);

            if (!isUnifiedCookieValue.IsNullOrEmpty())
            {
                if (uri.Contains("?"))
                    uri = uri + "&isUnified=" + isUnifiedCookieValue;
                else
                    uri = uri + "?isUnified=" + isUnifiedCookieValue;
            }

            return new RedirectResult(uri);
        }

        public static string CreateRedirectUrl(string redir, string newHostname, bool doHostnameRedirect)
        {
            if (redir.IsNullOrEmpty()) return doHostnameRedirect ? "http://" + newHostname : "~/";

            redir = redir.StartsWith("http") || redir.StartsWith("/") ?
                redir :
                "/" + redir;
            var redirUri = new Uri(redir, UriKind.RelativeOrAbsolute);

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
                        redirUri.OriginalString.Substring(qmarkpos + 1) :
                        string.Empty);

                var builder = new UriBuilder(scheme, newHostname);
                builder.Path = path;
                builder.Query = query;

                // we use absoluteUri here instead of ToString() because ToString() mangled query string parameters.  DO NOT change this. <3 Anup!
                return builder.Uri.AbsoluteUri;
            }
            else
            {
                return "~" + redirUri.OriginalString;
            }
        }
    }
}
