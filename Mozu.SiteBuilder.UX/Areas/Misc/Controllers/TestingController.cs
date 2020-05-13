using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Client.Caching;
using Mozu.Core.Configuration;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
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

        [HttpGet]
        public async Task<IActionResult> Redis()
        {
           var cache = CacheProvider.GetCache(SitebuilderContextCacheRepository.CacheName, new ApiContext() { TenantId = 1 });
            var key = $"HealthCheck-{Environment.MachineName}";
            var data = DateTime.Now +"-"+ new Random().NextDouble();
            await cache.PutAsync(
                data,
                key,
                new List<string>() { "a" },
                new Core.Caching.CachePolicy() { AbsoluteExpiration = new DateTimeOffset(DateTime.Now.AddMinutes(15)) })
                .ConfigureAwait(false);
            var gotit = (await cache.GetAsync<string>(key).ConfigureAwait(false))?.Item;
            if ( data == gotit)
            {
                return Ok();
            }
            return NotFound();
        }
    }
    public class TestingController : ApiControllerBase
    {
        private readonly ISitesWebApiClient _wsRepo;
        private readonly ICookieProvider _cookies;
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly ISettings _settings;
        private readonly Microsoft.Extensions.Configuration.IConfiguration _config;

        private const string FORCE_THEME_COOKIE_NAME = "SBTHEME";

        private enum ThemeMode
        {
            Desktop,
            Mobile,
            Auto,
            Tablet
        }

        public TestingController(ISitesWebApiClient wsRepo, ICookieProvider cookies, ISettings settings, IAuthenticationHelper authenticationHelper, Microsoft.Extensions.Configuration.IConfiguration config, IHttpClientFactory clientFactory)
        {
            _wsRepo = wsRepo.CloneWithoutUserClaims();
            _cookies = cookies;
            _settings = settings;
            _authenticationHelper = authenticationHelper;
            _config = config;
            _clientFactory = clientFactory;
            //SuppressMissingContextRedirect = true;
        }

        [RefreshStoreFrontUserAuthTicketFilter]
        [AcceptVerbs("POST")]
        public IActionResult RefreshAPiContextHeaders()
        {
            Response.Headers.Add(Headers.USER_CLAIMS, SbApiContext.UserClaims.ToAccessToken());
            Response.Headers.Add(Headers.APP_CLAIMS, LightweightAppClaims.CreateForPublicStorefront().ToAccessToken());
            return Ok();
        }

        [AcceptVerbs("GET")]
        public IActionResult CoolDownUser()
        {
            SbApiContext.UserClaims.Expiration = DateTime.Now.AddDays(-1);
            _authenticationHelper.SaveStoreFrontAccessToken(SbApiContext.UserClaims.ToAccessToken(), this.PageContext.UserProfile.ToToken());
            _authenticationHelper.SaveStoreFrontRefreshToken(null, DateTime.Now.AddDays(-1));
            return Ok("Cool.");
        }

        private readonly IHttpClientFactory _clientFactory;
        private static HttpClient _client;

        [AcceptVerbs("GET", "PUT", "DELETE", "POST", "OPTIONS")]
        public void Api(string url)
        {
            var resource = _config.GetSection("mozu:routes").GetChildren()
                .Select(c => _settings.AsMozuSettings().Routes.GetValue<string>(c.Key)).Where(x =>
                {
                    var u = new Uri(x);
                    var idx = u.LocalPath.IndexOf('/', 2);
                    var test = u.LocalPath.Substring(idx + 1).TrimEnd('/').TrimStart('/');
                    return url.StartsWith(test, StringComparison.OrdinalIgnoreCase);

                }).Select(_ =>
                {
                    var uri = new Uri(_);
                    return uri.GetLeftPart(UriPartial.Authority) + '/' +
                           uri.LocalPath.Split('/')[1];
                }).FirstOrDefault();
                
        

            _client ??= _clientFactory.CreateClient("apilocaltest");
        

            var reqUri = Request.HttpContext.GetRequestUri();

            var reqMessage =
                CreateProxyHttpRequest(Request.HttpContext, new Uri(resource + reqUri.PathAndQuery.Substring(4)));

            if (Request.Headers.TryGetValue("X-HTTP-Method-Override", out var vals) && !string.IsNullOrEmpty(vals))
            {
                reqMessage.Method = new HttpMethod(vals);
            }

            if (!Request.Headers.TryGetValue(Headers.USER_CLAIMS, out var values))
            {
                reqMessage.Headers.Add(Headers.USER_CLAIMS, this.SbApiContext.UserClaims.ToAccessToken());
            }

            if (!Request.Headers.TryGetValue(Headers.APP_CLAIMS, out values))
            {
                reqMessage.Headers.Add(Headers.APP_CLAIMS, LightweightAppClaims.CreateForPublicStorefront().ToAccessToken());
            }

            if (Request.ContentLength == 0)
            {
                reqMessage.Content = null;
            }

            Request.GetTypedHeaders().Host = new HostString(reqUri.Host);

            var respMessage = _client.SendAsync(reqMessage).Result;

            Response.StatusCode = (int) respMessage.StatusCode;
            foreach (var (key, value) in respMessage.Headers)
            {
                Response.Headers[key] = value.ToArray();
            }

            foreach (var (key, value) in respMessage.Content.Headers)
            {
                Response.Headers[key] = value.ToArray();
            }

            // SendAsync removes chunking from the response. This removes the header so it doesn't expect a chunked response.
            Response.Headers.Remove("transfer-encoding");

            using var responseStream = respMessage.Content.ReadAsStreamAsync().Result;

            responseStream.CopyToAsync(Response.Body);
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
        public IActionResult ForceTheme(string themeType = "", string redir = null)
        {
            var mode = (ThemeMode)Enum.Parse(typeof(ThemeMode), themeType, true);
            var themeName = "";
            if (mode == ThemeMode.Auto)
            {
                _cookies.RemoveCookie(FORCE_THEME_COOKIE_NAME);
                _cookies.SaveResponseCookie(FORCE_THEME_COOKIE_NAME, "", new CookieOptions { Expires = DateTime.Now.AddDays(-1D) });
            }
            else
            {
                themeName = mode switch
                {
                    ThemeMode.Desktop => (SiteContext.GeneralSettings.DesktopTheme ?? new ThemeSelection()).Id,
                    ThemeMode.Mobile => (SiteContext.GeneralSettings.MobileTheme ?? new ThemeSelection()).Id,
                    ThemeMode.Tablet => (SiteContext.GeneralSettings.TabletTheme ?? new ThemeSelection()).Id,
                    _ => themeName
                };

                _cookies.SaveResponseCookie(FORCE_THEME_COOKIE_NAME, themeName, new CookieOptions());
            }
            return new RedirectResult(redir ?? "/");
        }

        [HttpPost]
        public IActionResult Visit(string id = null)
        {
            if (int.TryParse(id, out var accountId))
            {
                PageContext.User.AccountId = accountId;
            }

            var publisher = HttpContext.RequestServices.Resolve<VisitEventPublisher>();

            publisher.PublishVisit(new Visit()
            {
                //   CustomerId  = int.Parse(id),
                VisitId = Guid.NewGuid().ToUrlSafeString(),
                IsTracked = true,
                UserAgent = "blurf",
                VisitorId = Guid.NewGuid().ToUrlSafeString()
            });
            return NotFound("page not found");
        }

        [HttpGet]
        public ContentResult Echo()
        {
            var sb = new StringBuilder();
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
            //sb.AppendLine("server vars");
            //sb.AppendFormat("{0}:{1}", "manchine name", this.HttpContext.Server.MachineName);
            //sb.AppendLine();
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
        public async Task<IActionResult> GoSite(int siteId, string redir = null, string environment = "production", string transfer = null, string variationId = "")
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
                        var invalidator = HttpContext.RequestServices.Resolve<IDirtyCacheInvalidator>();
                        invalidator.Invalidate();
                        viewMode = DataViewModeType.Pending;
                        domainList = domains.Where(x => x.IsSystemAssigned).Select(x => "admin-pending-view." + x.DomainName);
                        if (!string.IsNullOrEmpty(variationId))
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

                            if (canImpersonate && int.TryParse(reqCustId, out var customerAccountId))
                            {
                                var authTicket = (await HttpContext.RequestServices.Resolve<IAuthTicketWebApiClient>()
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

                                var authHelper = HttpContext.RequestServices.Resolve<IAuthenticationHelper>();
                                authHelper.SaveStoreFrontAccessToken(authTicket.AccessToken, profile.ToToken());
                                authHelper.ClearSessionToken();
                            }
                            else
                            {
                                // If you were impersonating a shopper previously, but now the customer ID
                                // is bad (e.g. "undefined") then clear out the tokens.
                                var authHelper = HttpContext.RequestServices.Resolve<IAuthenticationHelper>();
                                authHelper.ClearStorefrontTokens();
                                authHelper.ClearSessionToken();
                            }
                            if (!string.IsNullOrEmpty(variationId))
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

            var newHostname = (domainList.FirstOrDefault());

            if(!string.IsNullOrEmpty(variationId))
            {
                this.PageContext.VariationId = variationId;
            }
            

            var doHostnameRedirect = _settings.AppSettings("ReverseProxy") == "true" && !string.IsNullOrEmpty(newHostname);

            // todo:cole look into a rewrite of this functionality
            //if (!string.IsNullOrEmpty(transfer))
            //{
            //    var redirUrl = "~/" + Uri.UnescapeDataString(transfer).TrimStart('/');

            //    var writableContext = (SiteBuilderApiContext)SbApiContext;
            //    var headers = new NameValueCollection
            //    {
            //        [Headers.TENANT] = site.TenantId.ToString(),
            //        [Headers.MASTER_CATALOG] = site.MasterCatalogId.ToString(),
            //        [Headers.CATALOG] = site.CatalogId.ToString(),
            //        [Headers.SITE] = site.Id.ToString(),
            //        [Headers.LOCALE] = site.DefaultLocaleCode,
            //        [Headers.CURRENCY] = site.DefaultCurrencyCode,
            //        [Headers.DATA_VIEW_MODE] = viewMode.ToString()
            //    };


            //    return new TransferResult(redirUrl)
            //    {
            //        Headers = headers
            //    };
            //}
            SiteContext.Save(site: site.Id, masterCatalog: site.MasterCatalogId, tenant: site.TenantId, isEditMode: false, dataViewMode: viewMode, cookieProvider: _cookies, catalogid: site.CatalogId.Value, locale: site.DefaultLocaleCode, currency: site.DefaultCurrencyCode, isAdminMode: isAdminMode);

            var uri = CreateRedirectUrl(redir, newHostname, doHostnameRedirect);
            return new RedirectResult(uri);
        }

        public static string CreateRedirectUrl(string redir, string newHostname, bool doHostnameRedirect)
        {
            if (redir.IsNullOrEmpty()) return doHostnameRedirect ? "http://" + newHostname : "~/";

            redir = redir.StartsWith("http") || redir.StartsWith("/") ?
                redir :
                "/" + redir;
            var redirUri = new Uri(redir, UriKind.RelativeOrAbsolute);

            if (!redirUri.IsAbsoluteUri && !doHostnameRedirect) return "~" + redirUri.OriginalString;
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

            var builder = new UriBuilder(scheme, newHostname) {Path = path, Query = query};

            // we use absoluteUri here instead of ToString() because ToString() mangled query string parameters.  DO NOT change this. <3 Anup!
            return builder.Uri.AbsoluteUri;
        }

        public static HttpRequestMessage CreateProxyHttpRequest(HttpContext context, Uri uri)
        {
            var request = context.Request;

            var requestMessage = new HttpRequestMessage();
            var requestMethod = request.Method;
            if (!HttpMethods.IsGet(requestMethod) &&
                !HttpMethods.IsHead(requestMethod) &&
                !HttpMethods.IsDelete(requestMethod) &&
                !HttpMethods.IsTrace(requestMethod))
            {
                var streamContent = new StreamContent(request.Body);
                requestMessage.Content = streamContent;
            }

            // Copy the request headers
            foreach (var (key, value) in request.Headers)
            {
                if (!requestMessage.Headers.TryAddWithoutValidation(key, value.ToArray()))
                {
                    requestMessage.Content?.Headers.TryAddWithoutValidation(key, value.ToArray());
                }
            }

            requestMessage.Headers.Host = uri.Authority;
            requestMessage.RequestUri = uri;
            requestMessage.Method = new HttpMethod(request.Method);

            return requestMessage;
        }
    }
}
