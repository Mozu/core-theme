using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Mozu.Core;
using Mozu.Core.Api;
using Mozu.Core.Api.Client;
using Mozu.Core.Behaviors;
using Mozu.Core.Extensions;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using Microsoft.Extensions.Primitives;
using Mozu.SiteBuilder.Mvc.Extensions;
using MongoDB.Driver.Linq;

namespace Mozu.SiteBuilder.Mvc
{
    public class SiteBuilderApiContext : ApiContext, ISiteBuilderApiContext
    {
        private const string TENANT = "Tenant";
        public SiteBuilderApiContext()
        {
            int f = 0;
        }
        public bool IsEditMode { get; set; }

        public bool IsAdminMode { get; set; }

        public bool IsDebugMode { get; set; }
        public string VariationId { get; set; }
        public DebugModeFlagValues DebugFlags { get; set; }

        public string CurrencyCodeOverride { get; set; }

        public LightweightUserClaims AdminUserClaim { get; set; }
        //cmcmannus|02/19/2020
        //hard coded to shopper since not porting admin
        public UserScopeType ScopeType => UserScopeType.Shopper;
        public bool IsReturnUser { get; set; } = true;

        public bool IsSalesRep()
        {
            bool isAdminUser = AdminUserClaim != null && AdminUserClaim.ScopeType == TENANT;
            if (!isAdminUser)
                return false;

            // Check a subset of behaviors to see if this user is a Sales Rep
            // or Admin who needs access to the B2B seller functionality
            int[] requiredBehaviorIds = {
                new CustomerReadBehavior().Id,    //41 
                new ShopperReadBehavior().Id,     //33 
                new OrderReadBehavior().Id,       //73
                new PriceListReadBehavior().Id,   //239
                new WishlistReadBehavior().Id,    //161
                new B2BAccountCreateBehavior().Id,//270
                new B2BAccountUpdateBehavior().Id,//271
                new B2BAccountDeleteBehavior().Id,//272
                new B2BAccountReadBehavior().Id,  //273
                new QuoteCreateBehavior().Id,     //274
                new QuoteUpdateBehavior().Id,     //275
                new QuoteDeleteBehavior().Id,     //276
                new QuoteReadBehavior().Id,       //277
            };
            var isSalesRep = AdminUserClaim.BehaviorIds.ContainsAll(requiredBehaviorIds);

            return isSalesRep;
        }

        public void SetDataMode(DataViewModeType dataViewMode)
        {
            this.DataViewMode = DataViewMode;
        }

        public void SetPriceListCode(string plCode)
        {
            this.PriceListCode = plCode;
        }

        public void SetUser(LightweightUserClaims user)
        {
            this.UserClaims = user;
        }
        public void SetUserClaim(LightweightUserClaims user)
        {
            this.AdminUserClaim = user;
        }
    }
    //public class SiteBuilderApiContext2 : MozuServiceApiContext, ISiteBuilderApiContext
    //{
    //    private readonly ICookieProvider _cookieProvider;
    //    private readonly ISettings _settings;
    //    private readonly IAuthenticationHelper _authenticationHelper;
    //    private readonly HttpContext _httpContext;
    //    private readonly IWebHostEnvironment _environment;

    //    public bool IsDebugMode { get; set; }
    //    public SiteBuilderApiContext2(ICookieProvider cookieProvider, ISettings settings, IAuthenticationHelper authenticationHelper, HttpContext httpContext, IDataViewModeFinderOuter dvmGetter, IEditModeFinderOuter editModeGetter, IWebHostEnvironment env)
    //        : base()
    //    {
    //        TenantId = -1;
    //        _cookieProvider = cookieProvider;
    //        _settings = settings;
    //        _authenticationHelper = authenticationHelper;
    //        _httpContext = httpContext;
    //        _environment = env;

    //        IsEditMode = editModeGetter.IsEditMode();

    //        Load();
    //        if ( !MasterCatalogId.HasValue )
    //        {
    //           MasterCatalogId = MasterCatalogId;
    //        }
    //        LoadUser();
    //        ValidateUser();
    //        LoadDefaultAnonShopperClaims();               
    //        SetDebugMode();
    //        SetDebugModeFlags();

    //        DataViewMode = dvmGetter.GetDataViewMode(UserClaims);
    //        PreviewDate = GetNowValue();

    //        var cur = cookieProvider.GetRequestCookie("currency_code_override")?.Value;
    //        if (!string.IsNullOrEmpty(cur))
    //        {
    //            CurrencyCodeOverride = cur;
    //        }
    //    }
    //    private SiteBuilderApiContext() { }
    //    public static SiteBuilderApiContext Create()
    //    {
    //        return new SiteBuilderApiContext();
    //    }

    //    private void SetDebugMode()
    //    {
    //        var isDebugMode = false;
    //        var cookie = _cookieProvider.GetRequestCookie(Constants.DEBUGCOOKIENAME);
    //        if (cookie != null)
    //        {
    //            isDebugMode = cookie.Value == "t";
    //        }
    //        var val = _httpContext.Request.Query.Where(x => string.Equals( x.Key, "debugmode",  StringComparison.OrdinalIgnoreCase)).Select(x => x.Value).FirstOrDefault();
    //        if (!string.IsNullOrEmpty(val))
    //        {
    //            isDebugMode = string.Equals(val, bool.TrueString , StringComparison.OrdinalIgnoreCase);

    //            var newCookie =new CookieOptions();
    //            if (!isDebugMode)
    //            {
    //                newCookie.Expires = DateTime.MinValue;
    //            }

    //            _cookieProvider.SaveResponseCookie(Constants.DEBUGCOOKIENAME, isDebugMode ? "t" : "f", newCookie, false);
    //        }
    //        IsDebugMode = isDebugMode;
    //    }

    //    private DateTime? GetNowValue()
    //    {
    //        if (DataViewMode != DataViewModeType.Pending) return null;
    //        DateTime? now = null;
    //        var cookie = new CookieOptions();
    //        DateTime temp;
    //        var val = _httpContext.Request.Query.Where(x => string.Equals(x.Key, "mz_now", StringComparison.OrdinalIgnoreCase)).Select(x => x.Value).FirstOrDefault();
    //        if (!string.IsNullOrEmpty(val))
    //        {
    //            if (DateTime.TryParse(val, out temp))
    //            {
    //                now = temp;
    //                val = temp.ToUniversalTime().ToString("o");
    //            }
    //            else
    //            {
    //                val = "";
    //                cookie.Expires = DateTime.MinValue;
    //            }

    //            _cookieProvider.SaveResponseCookie(Constants.NOWCOOKIENAME, val, cookie, false);
    //        }
    //        else
    //        {
    //            var reqCookie = _cookieProvider.GetRequestCookie(Constants.NOWCOOKIENAME);
    //            if (reqCookie == null) return null;
    //            if (DateTime.TryParse(reqCookie.Value, out temp))
    //            {
    //                return temp;
    //            }
    //        }
    //        return now;
    //    }

    //    private static DateTime RoundMinueteToLowest10(DateTime now)
    //    {
    //        now = new DateTime(now.Year, now.Month, now.Day, now.Hour, (int)Math.Floor((decimal)now.Minute / 10) * 10, 0, DateTimeKind.Utc);
    //        return now;
    //    }

    //    private static readonly ConcurrentDictionary<string, Site> g_domainSiteLookup = new ConcurrentDictionary<string, Site>(StringComparer.OrdinalIgnoreCase);
    //    private static readonly ConcurrentDictionary<int, Site> g_SiteIdSiteLookup = new ConcurrentDictionary<int, Site>();

    //    public void LoadUser()
    //    {
    //        if (_httpContext.Request.Headers.TryGetValue(Core.Api.Contracts.Constants.Headers.USER_CLAIMS, out _))
    //        {
    //            return;
    //        }

    //        //todo check refreshToken Loc
    //        string accessToken = null;
    //        string adminAccessToken = null;
    //        if (ScopeType == UserScopeType.Shopper)
    //        {
    //            accessToken = _authenticationHelper.GetStoreFrontAccessToken();

    //            adminAccessToken = _authenticationHelper.GetAdminAccessToken();
    //        }
    //        else
    //        {
    //            accessToken = _authenticationHelper.GetAdminAccessToken();
    //        }

    //        /*********************************************
    //         * 
    //         * //todo:validate has admin cookie somehow?!!!
    //         * 
    //         * ******************************************/
    //        if (!string.IsNullOrEmpty(accessToken) && LightweightUserClaims.TryParse(accessToken, out var claims))
    //        {
    //            //todo validate tenant and site 
    //            UserClaims = claims;
    //        }
    //        if (!string.IsNullOrEmpty(adminAccessToken) && LightweightUserClaims.TryParse(adminAccessToken, out claims))
    //        {
    //            AdminUserClaim = claims;
    //        }
    //    }

    //    private static int PublishBehavorID = new PublishPreviewBehavior().Id;

    //    bool ValidateUser()
    //    {
    //        if (UserClaims != null && UserClaims.BehaviorIds == null)
    //        {
    //            UserClaims.BehaviorIds = new int[0];
    //        }

    //        if (UserClaims == null)
    //        {
    //            return false;
    //        }

    //        if (!UserClaims.Bag.TryGetValue("TenantId", out var bagVal) || !int.TryParse(bagVal, out var tmpInt) || tmpInt != TenantId)
    //        {
    //            if (ScopeType == UserScopeType.Shopper)
    //            {
    //                UserClaims = null;
    //                return false;

    //            }

    //            UserClaims = LightweightUserClaims.CreateForAdminUser(
    //                Guid.NewGuid().ToString("N"), 
    //                string.Empty, 
    //                string.Empty, 
    //                new int[0], 
    //                new UserScope() { Id = TenantId, Type = UserScopeType.Tenant }, 
    //                DateTime.Today.AddYears(1));
    //            UserClaims.IsAnonymous = true;
    //        }

    //        if (ScopeType != UserScopeType.Shopper || (UserClaims.Bag.TryGetValue("SiteId", out bagVal) &&
    //                                                   int.TryParse(bagVal, out tmpInt) &&
    //                                                   tmpInt == SiteId)) return true;

    //        if (!SiteId.HasValue) return true;

    //        UserClaims.Bag["SiteId"] = SiteId.ToString();

    //        return true;
    //    }

    //    private void LoadDefaultAnonShopperClaims()
    //    {
    //        if (ScopeType != UserScopeType.Shopper || UserClaims != null)
    //        {
    //            return;
    //        }
    //        var anonClaims = LightweightUserClaims.CreateForAnonymousShopper(TenantId, SiteId.GetValueOrDefault());

    //        SetUser(anonClaims);
    //        _authenticationHelper.SaveStoreFrontAccessToken(anonClaims.ToAccessToken(), null);
    //        if (UserClaims != null && UserClaims.BehaviorIds == null)
    //        {
    //            UserClaims.BehaviorIds = new int[0];
    //        }
    //    }

    //    //cmcmannus|02/19/2020
    //    //hard coded to shopper since not porting admin
    //    UserScopeType ScopeType => UserScopeType.Shopper;

    //    const string EmptyHeaderTokenValue = "__mzrpt__";
    //    //remove the empty token from the headers... sometimes sent from the UI.  for backwards compatibility with older theme script.
    //    static void CleanTokenValueHeaders(HttpContext context)
    //    {
    //        var headersToRemove = context.Request.Headers.Where(kvp =>
    //            context.Request.Headers.GetOrDefault(kvp.Key, new StringValues()).FirstOrDefault() == EmptyHeaderTokenValue).ToList();

    //        headersToRemove.ForEach(kvp => context.Request.Headers.Remove(kvp.Key));
    //    }

    //    protected void InitFromHeaders(IHeaderDictionary headers)
    //    {
    //        if (headers.TryGetValue("x-vol-tenant", out var values))
    //            TenantId = ConvertFrom(values.ToArray());
    //        if (headers.TryGetValue("x-vol-oms-merchant", out values))
    //            OmsMerchantId = ConvertNullableFrom(values.ToArray());
    //        if (headers.TryGetValue("x-vol-oms-catalog", out values))
    //            OmsCatalogId = ConvertNullableFrom(values.ToArray());
    //        if (headers.TryGetValue("x-vol-master-catalog", out values))
    //            MasterCatalogId = ConvertNullableFrom(values.ToArray());
    //        if (headers.TryGetValue("x-vol-instance-id", out values))
    //            MozuInstanceId = values.FirstOrDefault();
    //        if (headers.TryGetValue("x-vol-catalog", out values))
    //            CatalogId = ConvertNullableFrom(values.ToArray());
    //        if (headers.TryGetValue("x-vol-site", out values))
    //            SiteId = ConvertNullableFrom(values.ToArray());
    //        if (headers.TryGetValue("x-vol-locale", out values))
    //            LocaleCode = values.FirstOrDefault();
    //        if (headers.TryGetValue("x-vol-currency", out values))
    //            CurrencyCode = values.FirstOrDefault();
    //        if (headers.TryGetValue("x-vol-pricelist", out values))
    //            PriceListCode = values.FirstOrDefault();
    //        if (headers.TryGetValue("x-vol-price-plan", out values))
    //            PricePlanCode = values.FirstOrDefault();
    //        if (headers.TryGetValue("x-vol-purchase-location", out values))
    //            PurchaseLocation = values.FirstOrDefault();
    //        if (headers.TryGetValue("x-vol-preview-date", out values))
    //            PreviewDate = ConvertDateFrom(values);
    //        if (headers.TryGetValue("x-vol-callchain", out values))
    //            CallChain = values.FirstOrDefault();
    //        if (headers.TryGetValue("x-vol-initiating-app", out values))
    //            InitiatingAppId = values.FirstOrDefault();
    //        headers.TryGetValue("Authorization", out values);
    //        if (headers.TryGetValue("x-vol-user-claims", out values))
    //            UserClaims = LightweightUserClaims.Parse(values.FirstOrDefault());
    //        if (headers.TryGetValue("x-vol-app-claims", out values))
    //            AppClaims = LightweightAppClaims.Parse(values.FirstOrDefault());
    //        if (headers.TryGetValue("x-vol-bypass-cache", out values) && bool.TryParse(values.FirstOrDefault(), out var result1))
    //            ShouldBypassCache = result1;
    //        if (headers.TryGetValue("x-vol-no-cache-update", out values) && bool.TryParse(values.FirstOrDefault(), out var result2))
    //            ShouldUpdateCache = !result2;
    //        if (!headers.TryGetValue("x-vol-dataview-mode", out values) || !Enum.TryParse<DataViewModeType>(values.FirstOrDefault(), true, out var result3))
    //            return;
    //        DataViewMode = result3;
    //    }

    //    public void Load()
    //    {
    //        CleanTokenValueHeaders(_httpContext);
    //        // in here, if we're not behind a reverse proxy then we have to reach out to the tenant service to get some necessary context.
    //        // we want to skip this when we're not local, so hide these branches behind the config setting check.

    //        if (_httpContext.Request.Headers.TryGetValue(Core.Api.Contracts.Constants.Headers.TENANT, out _))
    //        {
    //            InitFromHeaders(_httpContext.Request.Headers);
    //        }
    //        else if (!_httpContext.Request.Headers.TryGetValue(Core.Api.Contracts.Constants.Headers.ORIGINAL_URL, out _) && !_settings.AppSettingsAsNullableBool("ReverseProxy").GetValueOrDefault(false))
    //        {

    //            //todo:hyper check rp flag.
    //            //testing without proxy...
    //            //todo: make this configurable by flag
    //            string host = _httpContext.GetRequestUri().Host;
    //            Site site = g_domainSiteLookup.GetOrAdd(host, LookupSiteByDomain);

    //            if (site != null)
    //            {
    //                SiteId = site.Id;
    //                MasterCatalogId = site.MasterCatalogId ;
    //                CatalogId = site.CatalogId;
    //                TenantId = site.TenantId;
    //                return;
    //            }
    //        }

    //        if ( TenantId == -1 || (  !SiteId.HasValue && ScopeType == UserScopeType.Shopper))
    //        {
    //            LoadFromCookie(_cookieProvider);
    //        }

    //        if (string.IsNullOrEmpty(LocaleCode) && SiteId.HasValue && _settings.AppSettingsAsNullableBool("ReverseProxy").GetValueOrDefault(false))
    //        {
    //            Site site = g_SiteIdSiteLookup.GetOrAdd(SiteId.Value, LookupSiteById );
    //            if (site != null)
    //            {
    //                LocaleCode = site.DefaultLocaleCode;
    //                CurrencyCode = site.DefaultCurrencyCode;
    //            }
    //        }
    //        LoadExtraInfoFromCookie(_cookieProvider);

    //        if (string.IsNullOrWhiteSpace(TraceContext.CorrelationId) && Trace.CorrelationManager?.ActivityId != Guid.Empty)
    //        {
    //            TraceContext.CorrelationId = Trace.CorrelationManager?.ActivityId.ToString("N");
    //        }
    //    }

    //    private void LoadExtraInfoFromCookie (ICookieProvider cookieProvider)
    //    {
    //        var cookie = cookieProvider.GetRequestCookie(Constants.COOKIENAME);
    //        if (cookie?.Values != null)
    //        {
    //            if (!string.IsNullOrEmpty(cookie["adminmode"]))
    //            {
    //                IsAdminMode = bool.Parse(cookie["adminmode"]);
    //            }
    //            if(!string.IsNullOrEmpty(cookie["variationId"]))
    //            {
    //                VariationId = cookie["variationId"];
    //            }
    //        }
    //    }
    //    private void LoadFromCookie(ICookieProvider cookieProvider)
    //    {
    //        var cookie = cookieProvider.GetRequestCookie(Constants.COOKIENAME);
    //        if ((cookie?.Values?.Count).GetValueOrDefault(0)==0)
    //        {
    //            return;
    //        }

    //        if (int.TryParse(cookie["site"], out var tmpInt))
    //        {
    //            SiteId = tmpInt;
    //        }
    //        if (int.TryParse(cookie["tenant"], out tmpInt))
    //        {
    //            //if set from header and doesnt match cookie then return
    //            if (TenantId > 0 && TenantId != tmpInt)
    //            {
    //                return;
    //            }
    //            TenantId = tmpInt;
    //        }
    //        if (int.TryParse(cookie["masterCatalog"], out tmpInt))
    //        {
    //            MasterCatalogId = tmpInt;
    //        }
    //        if (int.TryParse(cookie["catalog"], out tmpInt))
    //        {
    //            CatalogId  = tmpInt;
    //        }
    //        if (!string.IsNullOrEmpty( cookie["locale"]))
    //        {
    //            LocaleCode = cookie["locale"];
    //        }
    //        if (!string.IsNullOrEmpty(cookie["currency"]))
    //        {
    //            CurrencyCode = cookie["currency"];
    //        }
    //        LoadExtraInfoFromCookie(cookieProvider);
    //    }

    //    Site LookupSiteByDomain(string host)
    //    {
    //        try
    //        {
    //            var client = new SitesWebApiClient(new ServiceClientMessageHandler(new ApiContext(), _settings));
    //            var sites = client.GetSites(filter: "domainname eq " + host).Result.ReadAsSync();
    //            return sites.Items.FirstOrDefault();
    //        }
    //        catch
    //        {
    //            return null;
    //        }
    //    }

    //    private Site LookupSiteById(int siteId)
    //    {
    //        var client = new SitesWebApiClient(new ServiceClientMessageHandler(new ApiContext(), _settings));
    //        var res = client.GetSite(siteId).Result;
    //        if (((int) res.ResponseMessage.StatusCode) >= 500)
    //        {
    //            throw res.ReadException();
    //        }
    //        return res.ResponseMessage.IsSuccessStatusCode ?
    //            res.ReadAsSync() : 
    //            null;
    //    }

    //    public void SetUser(LightweightUserClaims user)
    //    {
    //        UserClaims = user;
    //    }

    //    public bool IsEditMode { get; set; }
    //    public bool IsAdminMode { get; set; }
    //    public string VariationId { get; set; }

    //    public LightweightUserClaims AdminUserClaim { get; set; }

    //    public void SetDataMode(DataViewModeType dataViewMode)
    //    {
    //        DataViewMode = dataViewMode;
    //    }

    //    public void SetPriceListCode(string plCode)
    //    {
    //        PriceListCode = plCode;
    //    }

    //    private void SetDebugModeFlags()
    //    {
    //        DebugFlags = DebugModeFlagValues.Default;
    //        var qsVal = _httpContext.Request.Query
    //                .Where(x => string.Equals(x.Key, Constants.DEBUGFLAGSCOOKIENAME, StringComparison.OrdinalIgnoreCase)).Select(x => x.Value).FirstOrDefault();

    //        if (!string.IsNullOrEmpty(qsVal))
    //        {
    //            DebugFlags = qsVal.ToString().Split(new char[','], StringSplitOptions.RemoveEmptyEntries)
    //                .Select(x => (DebugModeFlagValues)Enum.Parse(typeof(DebugModeFlagValues), x, true))
    //                .Aggregate(DebugFlags, (a, b) => a | b);

    //            DebugFlags = DebugFlags.HasFlag(DebugModeFlagValues.None) ? DebugModeFlagValues.None : DebugFlags;

    //            var cookie = new CookieOptions();
    //            if (DebugFlags == DebugModeFlagValues.None)
    //            {
    //                cookie.Expires = DateTime.MinValue;
    //            }

    //            _cookieProvider.SaveResponseCookie(Constants.DEBUGFLAGSCOOKIENAME, ((int)DebugFlags).ToString(), cookie, false);
    //        }
    //        else
    //        {
    //            var cookie = _cookieProvider.GetRequestCookie(Constants.DEBUGFLAGSCOOKIENAME);
    //            if (int.TryParse(cookie?.Value, out var cookieVal))
    //            {
    //                DebugFlags = (DebugModeFlagValues)cookieVal;
    //            }
    //        }
    //    }

    //    public DebugModeFlagValues DebugFlags
    //    {
    //        get; set;
    //    }

    //    public string CurrencyCodeOverride { get; set; }
    //}

    [Flags]
    public enum DebugModeFlagValues : int
    {
        Default = 0,
        None = 2,

        DisableCdn = 4,
        Unminified = 8,
        ShowErrors = 16
    }
    public static class Constants
    {
        public const string DefaultTheme = "MozuCore";
        public const string COOKIENAME = "SBCONTEXT";
        public const string DEBUGCOOKIENAME = "SBD";
        public const string NOWCOOKIENAME = "MZ_NOW";
        public const string PRICELISTCOOKIENAME = "MZ_PRICELIST";
        public const string HEADER_ALTERNATIVE_VIEW = "x-vol-alternative-view";
        public const string HEADER_CANONICAL_URL = "x-vol-canonical-url";

        public static string DEBUGFLAGSCOOKIENAME = "mz_DebugFlags";
    }
}