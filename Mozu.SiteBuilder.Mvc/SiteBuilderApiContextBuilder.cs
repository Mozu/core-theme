using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Mozu.Core;
using Mozu.Core.Api;
using Mozu.Core.Api.Client;
using Mozu.Core.Behaviors;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.Tenant.Contracts.Clients;


namespace Mozu.SiteBuilder.Mvc
{
    public class SiteBuilderApiContextBuilder : HttpApiContextFactory
    {
        private readonly HttpContext _context;
        private readonly ICookieProvider _cookieProvider;
        private readonly ISettings _settings;
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly IDataViewModeFinderOuter _dvmGetter;
        private readonly IEditModeFinderOuter _editModeGetter;
        private static readonly ConcurrentDictionary<string, Mozu.Tenant.Contracts.Site> g_domainSiteLookup = new ConcurrentDictionary<string, Mozu.Tenant.Contracts.Site>(StringComparer.OrdinalIgnoreCase);
        private static readonly ConcurrentDictionary<int, Mozu.Tenant.Contracts.Site> g_SiteIdSiteLookup = new ConcurrentDictionary<int, Mozu.Tenant.Contracts.Site>();

        public SiteBuilderApiContextBuilder(
            HttpContext context, 
            IJwtService jwtServcie,
            ICookieProvider cookieProvider, 
            ISettings settings, 
            IAuthenticationHelper authenticationHelper, 
            IDataViewModeFinderOuter dvmGetter, 
            IEditModeFinderOuter editModeGetter) : base(context, jwtServcie)
        {
            _context = context;
            _cookieProvider = cookieProvider;
            _settings = settings;
            _authenticationHelper = authenticationHelper;
            _dvmGetter = dvmGetter;
            _editModeGetter = editModeGetter;
        }
        
        public override IApiContext CreateContext()
        {
            var sbApiContext = new SiteBuilderApiContext();
            BuildApiContext(sbApiContext, _context);
            return sbApiContext;
        }
        public  override IApiContext BuildApiContext(IApiContext apiContext, HttpContext httpContext)
        {
            var sbApiContext = apiContext as SiteBuilderApiContext;
            if ( sbApiContext == null)
            {
                sbApiContext = new SiteBuilderApiContext();
            }
            base.BuildApiContext(sbApiContext, httpContext);
            sbApiContext.IsEditMode = _editModeGetter.IsEditMode();
            Load(sbApiContext);
            LoadUser(sbApiContext);
            ValidateUser(sbApiContext);
            LoadDefaultAnonShopperClaims(sbApiContext);
            SetDebugMode(sbApiContext);
            SetDebugModeFlags(sbApiContext);

            sbApiContext.DataViewMode = _dvmGetter.GetDataViewMode(sbApiContext.UserClaims);
            sbApiContext.PreviewDate = GetNowValue(sbApiContext);

            var cur = _cookieProvider.GetRequestCookie("currency_code_override")?.Value;
            if (!string.IsNullOrEmpty(cur))
            {
                sbApiContext.CurrencyCodeOverride = cur;
            }
            return sbApiContext;
        }
        public void Load(SiteBuilderApiContext apiCtx)
        {
           
            if (_context.Request.Headers.TryGetValue(Core.Api.Contracts.Constants.Headers.TENANT, out _))
            {
                return;
            }
            else if (!_context.Request.Headers.TryGetValue(Core.Api.Contracts.Constants.Headers.ORIGINAL_URL, out _) && !_settings.AppSettingsAsNullableBool("ReverseProxy").GetValueOrDefault(false))
            {

                //todo:hyper check rp flag.
                //testing without proxy...
                //todo: make this configurable by flag
                string host = _context.GetRequestUri().Host;
                var site = g_domainSiteLookup.GetOrAdd(host, LookupSiteByDomain);

                if (site != null)
                {
                    apiCtx.SiteId = site.Id;
                    apiCtx.MasterCatalogId = site.MasterCatalogId;
                    apiCtx.CatalogId = site.CatalogId;
                    apiCtx.TenantId = site.TenantId;
                    return;
                }
            }

            if (apiCtx.TenantId == -1 || (!apiCtx.SiteId.HasValue && apiCtx.ScopeType == UserScopeType.Shopper))
            {
                LoadFromCookie(_cookieProvider, apiCtx);
            }

            if (string.IsNullOrEmpty(apiCtx.LocaleCode) && apiCtx.SiteId.HasValue && _settings.AppSettingsAsNullableBool("ReverseProxy").GetValueOrDefault(false))
            {
                var site = g_SiteIdSiteLookup.GetOrAdd(apiCtx.SiteId.Value, LookupSiteById);
                if (site != null)
                {
                    apiCtx.LocaleCode = site.DefaultLocaleCode;
                    apiCtx.CurrencyCode = site.DefaultCurrencyCode;
                }
            }
            LoadExtraInfoFromCookie(_cookieProvider, apiCtx);

            if (string.IsNullOrWhiteSpace(apiCtx.TraceContext.CorrelationId) && Trace.CorrelationManager?.ActivityId != Guid.Empty)
            {
                apiCtx.TraceContext.CorrelationId = Trace.CorrelationManager?.ActivityId.ToString("N");
            }
        }
        public void LoadUser(SiteBuilderApiContext apiCtx)
        {
            if (_context.Request.Headers.TryGetValue(Core.Api.Contracts.Constants.Headers.USER_CLAIMS, out _))
            {
                return;
            }

            //todo check refreshToken Loc
            string accessToken = null;
            string adminAccessToken = null;
            if (apiCtx.ScopeType == UserScopeType.Shopper)
            {
                accessToken = _authenticationHelper.GetStoreFrontAccessToken();

                adminAccessToken = _authenticationHelper.GetAdminAccessToken();
            }
            else
            {
                accessToken = _authenticationHelper.GetAdminAccessToken();
            }

            /*********************************************
             * 
             * //todo:validate has admin cookie somehow?!!!
             * 
             * ******************************************/
            if (!string.IsNullOrEmpty(accessToken) && LightweightUserClaims.TryParse(accessToken, out var claims))
            {
                //todo validate tenant and site 
                apiCtx.UserClaims = claims;
            }
            if (!string.IsNullOrEmpty(adminAccessToken) && LightweightUserClaims.TryParse(adminAccessToken, out claims))
            {
                apiCtx.AdminUserClaim = claims;
            }
        }
        bool ValidateUser(SiteBuilderApiContext apiCtx)
        {
            if (apiCtx.UserClaims != null && apiCtx.UserClaims.BehaviorIds == null)
            {
                apiCtx.UserClaims.BehaviorIds = new int[0];
            }

            if (apiCtx.UserClaims == null)
            {
                return false;
            }

            if (!apiCtx.UserClaims.Bag.TryGetValue("TenantId", out var bagVal) || !int.TryParse(bagVal, out var tmpInt) || tmpInt != apiCtx.TenantId)
            {
                if (apiCtx.ScopeType == UserScopeType.Shopper)
                {
                    apiCtx.UserClaims = null;
                    return false;

                }

                apiCtx.UserClaims = LightweightUserClaims.CreateForAdminUser(
                    Guid.NewGuid().ToString("N"),
                    string.Empty,
                    string.Empty,
                    new int[0],
                    new UserScope() { Id = apiCtx.TenantId, Type = UserScopeType.Tenant },
                    DateTime.Today.AddYears(1));
                apiCtx.UserClaims.IsAnonymous = true;
            }

            if (apiCtx.ScopeType != UserScopeType.Shopper || (apiCtx.UserClaims.Bag.TryGetValue("SiteId", out bagVal) &&
                                                       int.TryParse(bagVal, out tmpInt) &&
                                                       tmpInt == apiCtx.SiteId)) return true;

            if (!apiCtx.SiteId.HasValue) return true;

            apiCtx.UserClaims.Bag["SiteId"] = apiCtx.SiteId.ToString();

            return true;
        }

        private void LoadDefaultAnonShopperClaims(SiteBuilderApiContext apiCtx)
        {
            if (apiCtx.ScopeType != UserScopeType.Shopper || apiCtx.UserClaims != null)
            {
                return;
            }
            var anonClaims = LightweightUserClaims.CreateForAnonymousShopper(apiCtx.TenantId, apiCtx.SiteId.GetValueOrDefault());

            apiCtx.SetUser(anonClaims);
            _authenticationHelper.SaveStoreFrontAccessToken(anonClaims.ToAccessToken(), null);
            if (apiCtx.UserClaims != null && apiCtx.UserClaims.BehaviorIds == null)
            {
                apiCtx.UserClaims.BehaviorIds = new int[0];
            }
        }
        private void SetDebugMode(SiteBuilderApiContext apiCtx)
        {
            var isDebugMode = false;
            var cookie = _cookieProvider.GetRequestCookie(Constants.DEBUGCOOKIENAME);
            if (cookie != null)
            {
                isDebugMode = cookie.Value == "t";
            }
            var val = _context.Request.Query.Where(x => string.Equals(x.Key, "debugmode", StringComparison.OrdinalIgnoreCase)).Select(x => x.Value).FirstOrDefault();
            if (!string.IsNullOrEmpty(val))
            {
                isDebugMode = string.Equals(val, bool.TrueString, StringComparison.OrdinalIgnoreCase);

                var newCookie = new CookieOptions();
                if (!isDebugMode)
                {
                    newCookie.Expires = DateTime.MinValue;
                }

                _cookieProvider.SaveResponseCookie(Constants.DEBUGCOOKIENAME, isDebugMode ? "t" : "f", newCookie, false);
            }
            apiCtx.IsDebugMode = isDebugMode;
        }
        private DateTime? GetNowValue(SiteBuilderApiContext apiCtx)
        {
            if (apiCtx.DataViewMode != DataViewModeType.Pending) return null;
            DateTime? now = null;
            var cookie = new CookieOptions();
            DateTime temp;
            var val = _context.Request.Query.Where(x => string.Equals(x.Key, "mz_now", StringComparison.OrdinalIgnoreCase)).Select(x => x.Value).FirstOrDefault();
            if (!string.IsNullOrEmpty(val))
            {
                if (DateTime.TryParse(val, out temp))
                {
                    now = temp;
                    val = temp.ToUniversalTime().ToString("o");
                }
                else
                {
                    val = "";
                    cookie.Expires = DateTime.MinValue;
                }

                _cookieProvider.SaveResponseCookie(Constants.NOWCOOKIENAME, val, cookie, false);
            }
            else
            {
                var reqCookie = _cookieProvider.GetRequestCookie(Constants.NOWCOOKIENAME);
                if (reqCookie == null) return null;
                if (DateTime.TryParse(reqCookie.Value, out temp))
                {
                    return temp;
                }
            }
            return now;
        }

        private void SetDebugModeFlags(SiteBuilderApiContext apiCtx)
        {
            apiCtx.DebugFlags = DebugModeFlagValues.Default;
            var qsVal = _context.Request.Query
                    .Where(x => string.Equals(x.Key, Constants.DEBUGFLAGSCOOKIENAME, StringComparison.OrdinalIgnoreCase)).Select(x => x.Value).FirstOrDefault();

            if (!string.IsNullOrEmpty(qsVal))
            {
                apiCtx.DebugFlags = qsVal.ToString().Split(new char[','], StringSplitOptions.RemoveEmptyEntries)
                    .Select(x => (DebugModeFlagValues)Enum.Parse(typeof(DebugModeFlagValues), x, true))
                    .Aggregate(apiCtx.DebugFlags, (a, b) => a | b);

                apiCtx.DebugFlags = apiCtx.DebugFlags.HasFlag(DebugModeFlagValues.None) ? DebugModeFlagValues.None : apiCtx.DebugFlags;

                var cookie = new CookieOptions();
                if (apiCtx.DebugFlags == DebugModeFlagValues.None)
                {
                    cookie.Expires = DateTime.MinValue;
                }

                _cookieProvider.SaveResponseCookie(Constants.DEBUGFLAGSCOOKIENAME, ((int)apiCtx.DebugFlags).ToString(), cookie, false);
            }
            else
            {
                var cookie = _cookieProvider.GetRequestCookie(Constants.DEBUGFLAGSCOOKIENAME);
                if (int.TryParse(cookie?.Value, out var cookieVal))
                {
                    apiCtx.DebugFlags = (DebugModeFlagValues)cookieVal;
                }
            }
        }

        private static int PublishBehavorID = new PublishPreviewBehavior().Id;

        private void LoadExtraInfoFromCookie(ICookieProvider cookieProvider, SiteBuilderApiContext apiContext)
        {
            var cookie = cookieProvider.GetRequestCookie(Constants.COOKIENAME);
            if (cookie?.Values != null)
            {
                if (!string.IsNullOrEmpty(cookie["adminmode"]))
                {
                    apiContext.IsAdminMode = bool.Parse(cookie["adminmode"]);
                }
                if (!string.IsNullOrEmpty(cookie["variationId"]))
                {
                    apiContext.VariationId = cookie["variationId"];
                }
            }
        }
        private void LoadFromCookie(ICookieProvider cookieProvider, SiteBuilderApiContext apiContext)
        {
            var cookie = cookieProvider.GetRequestCookie(Constants.COOKIENAME);
            if ((cookie?.Values?.Count).GetValueOrDefault(0) == 0)
            {
                return;
            }

            if (int.TryParse(cookie["site"], out var tmpInt))
            {
                apiContext.SiteId = tmpInt;
            }
            if (int.TryParse(cookie["tenant"], out tmpInt))
            {
                //if set from header and doesnt match cookie then return
                if (apiContext.TenantId > 0 && apiContext.TenantId != tmpInt)
                {
                    return;
                }
                apiContext.TenantId = tmpInt;
            }
            if (int.TryParse(cookie["masterCatalog"], out tmpInt))
            {
                apiContext.MasterCatalogId = tmpInt;
            }
            if (int.TryParse(cookie["catalog"], out tmpInt))
            {
                apiContext.CatalogId = tmpInt;
            }
            if (!string.IsNullOrEmpty(cookie["locale"]))
            {
                apiContext.LocaleCode = cookie["locale"];
            }
            if (!string.IsNullOrEmpty(cookie["currency"]))
            {
                apiContext.CurrencyCode = cookie["currency"];
            }
            LoadExtraInfoFromCookie(cookieProvider, apiContext);
        }

        Mozu.Tenant.Contracts.Site LookupSiteByDomain(string host)
        {
            try
            {
                var client = new SitesWebApiClient(new ServiceClientMessageHandler(new ApiContext(), _settings));
                var sites = client.GetSites(filter: "domainname eq " + host).Result.ReadAsSync();
                return sites.Items.FirstOrDefault();
            }
            catch
            {
                return null;
            }
        }

        private Mozu.Tenant.Contracts.Site LookupSiteById(int siteId)
        {
            var client = new SitesWebApiClient(new ServiceClientMessageHandler(new ApiContext(), _settings));
            var res = client.GetSite(siteId).Result;
            if (((int)res.ResponseMessage.StatusCode) >= 500)
            {
                throw res.ReadException();
            }
            return res.ResponseMessage.IsSuccessStatusCode ?
                res.ReadAsSync() :
                null;
        }
    }
}





