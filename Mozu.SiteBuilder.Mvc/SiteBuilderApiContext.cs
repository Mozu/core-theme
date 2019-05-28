using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;
using Autofac;
using Mozu.Core.Api;
using Mozu.Core.Api.Client;
using Mozu.Core;
using Mozu.Core.Behaviors;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using Mozu.Core.Extensions;
using System.Diagnostics;

namespace Mozu.SiteBuilder.Mvc
{
    public class SiteBuilderApiContext : MozuServiceApiContext, ISiteBuilderApiContext, ICloneable
    {
        private readonly ICookieProvider _cookieProvider;
        private readonly ISettings _settings;
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly HttpRequestMessage _httpRequestMessage;

        public bool IsDebugMode { get; set; }
        public SiteBuilderApiContext( ICookieProvider cookieProvider, ISettings settings, IAuthenticationHelper authenticationHelper, HttpRequestMessage httpRequestMessage, IDataViewModeFinderOuter dvmGetter, IEditModeFinderOuter editModeGetter)
            : base()
        {
            TenantId = -1;
            _cookieProvider = cookieProvider;
            _settings = settings;
            _authenticationHelper = authenticationHelper;
            _httpRequestMessage = httpRequestMessage;

            IsEditMode = editModeGetter.IsEditMode();
            

            Load();
            if ( !this.MasterCatalogId.HasValue )
            {
               this.MasterCatalogId = this.MasterCatalogId;
            }
            LoadUser();
            ValidateUser();
            LoadDefaultAnonShopperClaims();               
            SetDebugMode();
            SetDebugModeFlags();

            DataViewMode = dvmGetter.GetDataViewMode(UserClaims);
            PreviewDate = GetNowValue();




            var cur = cookieProvider.GetRequestCookie("currency_code_override")?.Value;
           if (!string.IsNullOrEmpty(cur))
            {
                this.CurrencyCodeOverride = cur;
            }
           

        }
        private SiteBuilderApiContext() { }
        public static SiteBuilderApiContext Create()
        {
            return new SiteBuilderApiContext()
            {

            };
        }

        private void SetDebugMode()
        {
            var isDebugMode = false;
            var cookie = _cookieProvider.GetRequestCookie(Constants.DEBUGCOOKIENAME);
            if (cookie != null)
            {
                isDebugMode = cookie.Value == "t";
            }
            var val = _httpRequestMessage.GetQueryNameValuePairs().Where(x => string.Equals( x.Key, "debugmode",  StringComparison.OrdinalIgnoreCase)).Select(x => x.Value).FirstOrDefault();
            if (val != null)
            {
                isDebugMode = string.Equals(val, Boolean.TrueString , StringComparison.OrdinalIgnoreCase);

                var newCookie =new HttpCookie(Mvc.Constants.DEBUGCOOKIENAME, isDebugMode ? "t" : "f");
                if (!isDebugMode)
                {
                    newCookie.Expires = DateTime.MinValue;
                }
                
                _cookieProvider.SaveResponseCookie(Mvc.Constants.DEBUGCOOKIENAME, newCookie, false);

            }
            this.IsDebugMode = isDebugMode;
        }

       
        

        

        private DateTime? GetNowValue()
        {
            DateTime? now = null;
            if (this.DataViewMode == DataViewModeType.Pending)
            {
                HttpCookie cookie;
                DateTime temp;
                var val = _httpRequestMessage.GetQueryNameValuePairs().Where(x => string.Equals(x.Key, "mz_now", StringComparison.OrdinalIgnoreCase)).Select(x => x.Value).FirstOrDefault();
                if (val != null)
                {
                    if (DateTime.TryParse(val, out temp))
                    {
                        now = temp;
                        cookie = new HttpCookie(Constants.NOWCOOKIENAME, now.Value.ToUniversalTime().ToString("o"));
                    }
                    else
                    {
                        cookie = new HttpCookie(Constants.NOWCOOKIENAME, "");
                        cookie.Expires = DateTime.MinValue;
                    }


                    _cookieProvider.SaveResponseCookie(Constants.NOWCOOKIENAME, cookie, false);

                }
                else
                {

                    var reqCookie = _cookieProvider.GetRequestCookie(Constants.NOWCOOKIENAME);
                    if (reqCookie != null)
                    {

                        if (DateTime.TryParse(reqCookie.Value, out temp))
                        {
                            now = temp;
                        }

                    }
                }
            }
            return now;
        }

        

        private static DateTime RoundMinueteToLowest10(DateTime now)
        {
            now = new DateTime(now.Year, now.Month, now.Day, now.Hour, (int)Math.Floor((decimal)now.Minute / 10) * 10, 0, DateTimeKind.Utc);
            return now;
        }

        private static System.Collections.Concurrent.ConcurrentDictionary<string, Site> g_domainSiteLookup = new ConcurrentDictionary<string, Site>(StringComparer.OrdinalIgnoreCase);
        private static System.Collections.Concurrent.ConcurrentDictionary<int, Site> g_SiteIdSiteLookup = new ConcurrentDictionary<int, Site>();



        public void LoadUser()
        {


            IEnumerable<string> values;
            if (_httpRequestMessage.Headers.TryGetValues(Mozu.Core.Api.Contracts.Constants.Headers.USER_CLAIMS, out values))
            {
                return;
            }

            //todo check refreshToken Loc
            string accessToken = null;
            string adminAccessToken = null;
            if (this.ScopeType == UserScopeType.Shopper)
            {
                accessToken = _authenticationHelper.GetStoreFrontAccessToken();

                adminAccessToken = _authenticationHelper.GetAdminAccessToken();

            }
            else
            {
                accessToken = _authenticationHelper.GetAdminAccessToken();
            }
            
            LightweightUserClaims claims;

            /*********************************************
             * 
             * //todo:validate has admin cookie somehow?!!!
             * 
             * ******************************************/
            if (!string.IsNullOrEmpty(accessToken) && LightweightUserClaims.TryParse(accessToken, out claims))
            {
                //todo validate tenant and site 
                this.UserClaims = claims;
            }
            if (!string.IsNullOrEmpty(adminAccessToken) && LightweightUserClaims.TryParse(adminAccessToken, out claims))
            {
                this.AdminUserClaim = claims;
            }
            


        }
        private static int PublishBehavorID = new PublishPreviewBehavior().Id;

        bool ValidateUser()
        {
            string bagVal;
            int tmpInt;

            if (this.UserClaims != null && this.UserClaims.BehaviorIds == null)
            {
                this.UserClaims.BehaviorIds = new int[0];
            }

            if (this.UserClaims == null)
            {
                return false;
            }
            if (!this.UserClaims.Bag.TryGetValue("TenantId", out bagVal) || !int.TryParse(bagVal, out tmpInt) || tmpInt != this.TenantId)
            {
                if (ScopeType == UserScopeType.Shopper)
                {
                    this.UserClaims = null;
                    return false;
             
                }
                else
                {
                    this.UserClaims = LightweightUserClaims.CreateForAdminUser(Guid.NewGuid().ToString("N"), string.Empty, string.Empty, new int[0], new UserScope() { Id = this.TenantId, Type = UserScopeType.Tenant }, DateTime.Today.AddYears(1));
                    this.UserClaims.IsAnonymous = true;
                }
              
               

            }
            if (ScopeType == UserScopeType.Shopper && (!this.UserClaims.Bag.TryGetValue("SiteId", out bagVal) || !int.TryParse(bagVal, out tmpInt) || tmpInt != this.SiteId))
            {
                if (this.SiteId.HasValue)
                {
                    this.UserClaims.Bag["SiteId"] = this.SiteId.ToString();
                    this.UserClaims.Bag["SiteId"] = this.SiteId.ToString();
                }
                
                //this.UserClaims = null;
                //return false;
            }
            return true;
        }

        private void LoadDefaultAnonShopperClaims()
        {
            if (this.ScopeType != UserScopeType.Shopper || this.UserClaims != null)
            {
                return;
            }
            var anonClaims = LightweightUserClaims.CreateForAnonymousShopper(this.TenantId, this.SiteId.GetValueOrDefault());
            
            SetUser(anonClaims);
            _authenticationHelper.SaveStoreFrontAccessToken(anonClaims.ToAccessToken(), null);
            if (this.UserClaims != null && this.UserClaims.BehaviorIds == null)
            {
                this.UserClaims.BehaviorIds = new int[0];
            }

        }

        UserScopeType ScopeType
        {
            get
            {
                if (String.Equals( HttpRuntime.AppDomainAppVirtualPath , "/admin",  StringComparison.OrdinalIgnoreCase))
                {
                    return UserScopeType.Tenant;
                }
                return UserScopeType.Shopper;
                ;
            }
        }



        const string EmptyHeaderTokenValue = "__mzrpt__";
        //remove the empty token from the headers... sometimes sent from the UI.  for backwards compatibility with older theme script.
        static void CleanTokenValueHeaders(HttpRequestMessage request)
        {
            var headersToRemove = request.Headers.Where(kvp =>
            request.Headers.GetValues(kvp.Key).FirstOrDefault() == EmptyHeaderTokenValue).ToList();
            headersToRemove.ForEach(kvp => request.Headers.Remove(kvp.Key));
        }

        public void Load()
        {
            CleanTokenValueHeaders(_httpRequestMessage);
            // in here, if we're not behind a reverse proxy then we have to reach out to the tenant service to get some necessary context.
            // we want to skip this when we're not local, so hide these branches behind the config setting check.

            IEnumerable<string> values;
            if (_httpRequestMessage.Headers.TryGetValues(Mozu.Core.Api.Contracts.Constants.Headers.TENANT, out values))
            {
                this.InitFromHeaders(_httpRequestMessage.Headers);
            }
            else if (!_httpRequestMessage.Headers.TryGetValues(Mozu.Core.Api.Contracts.Constants.Headers.ORIGINAL_URL, out values) && !_settings.AppSettingsAsNullableBool("ReverseProxy").GetValueOrDefault(false))
            {

                //todo:hyper check rp flag.
                //testing without proxy...
                //todo: make this configurable by flag
                string host = _httpRequestMessage.RequestUri.Host;
                Site site = g_domainSiteLookup.GetOrAdd(host, LookupSiteByDomain);

                if (site != null)
                {
                    this.SiteId = site.Id;
                    this.MasterCatalogId = site.MasterCatalogId ;
                    this.CatalogId = site.CatalogId;
                    this.TenantId = site.TenantId;
                    return;
                }
            }

            if ( this.TenantId == -1 || (  !SiteId.HasValue && this.ScopeType == UserScopeType.Shopper))
            {
                LoadFromCookie(_cookieProvider);
            }

            if (string.IsNullOrEmpty(this.LocaleCode) && this.SiteId.HasValue && _settings.AppSettingsAsNullableBool("ReverseProxy").GetValueOrDefault(false))
            {
                Site site = g_SiteIdSiteLookup.GetOrAdd(this.SiteId.Value, LookupSiteById );
                if (site != null)
                {
                    LocaleCode = site.DefaultLocaleCode;
                    CurrencyCode = site.DefaultCurrencyCode;
                }
            }
            LoadExtraInfoFromCookie(_cookieProvider);

            if (string.IsNullOrWhiteSpace(TraceContext.CorrelationId) && Trace.CorrelationManager?.ActivityId != Guid.Empty)
            {
                TraceContext.CorrelationId = Trace.CorrelationManager?.ActivityId.ToString("N");
            }
        }

        private void LoadExtraInfoFromCookie (ICookieProvider cookieProvider)
        {
            var cookie = cookieProvider.GetRequestCookie(Mvc.Constants.COOKIENAME);
            if (cookie?.Values != null)
            {
                if (!string.IsNullOrEmpty(cookie["adminmode"]))
                {
                    this.IsAdminMode = bool.Parse(cookie["adminmode"]);
                }
                if(!string.IsNullOrEmpty(cookie["variationId"]))
                {
                    this.VariationId = cookie["variationId"];
                }
            }
        }
        private void LoadFromCookie(ICookieProvider cookieProvider)
        {
            var cookie = cookieProvider.GetRequestCookie(Mvc.Constants.COOKIENAME);
            if (cookie?.Values != null)
            {
                int tmpInt;
                if (int.TryParse(cookie["site"], out tmpInt))
                {
                    this.SiteId = tmpInt;
                }
                if (int.TryParse(cookie["tenant"], out tmpInt))
                {
                    //if set from header and doesnt match cookie then return
                    if (this.TenantId > 0 && this.TenantId != tmpInt)
                    {
                        return;
                    }
                    this.TenantId = tmpInt;
                }
                if (int.TryParse(cookie["masterCatalog"], out tmpInt))
                {
                    this.MasterCatalogId = tmpInt;
                }
                if (int.TryParse(cookie["catalog"], out tmpInt))
                {
                    this.CatalogId  = tmpInt;
                }
                if (!string.IsNullOrEmpty( cookie["locale"]))
                {
                    this.LocaleCode = cookie["locale"];
                }
                if (!string.IsNullOrEmpty(cookie["currency"]))
                {
                    this.CurrencyCode = cookie["currency"];
                }
                LoadExtraInfoFromCookie(cookieProvider);
            }
        }

        Site LookupSiteByDomain(string host)
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

        private Site LookupSiteById(int siteId)
        {
            var client = new SitesWebApiClient(new ServiceClientMessageHandler(new ApiContext(), _settings));
            var res = client.GetSite(siteId).Result;
            if (((int) res.ResponseMessage.StatusCode) >= 500)
            {
                throw res.ReadException();
            }
            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                return res.ReadAsSync();
            }
            return null;
          
        }

        public void SetUser(LightweightUserClaims user)
        {
            this.UserClaims = user;
        }

        public bool IsEditMode { get; set; }
        public bool IsAdminMode { get; set; }
        public string VariationId { get; set; }
       

       

        public LightweightUserClaims AdminUserClaim { get; set; }

        public void SetDataMode(DataViewModeType dataViewMode)
        {
            this.DataViewMode = dataViewMode;
        }
     
        public void SetPriceListCode(string plCode)
        {
            this.PriceListCode = plCode;
        }

       
        private void SetDebugModeFlags()
        {
            this.DebugFlags = DebugModeFlagValues.Default;
            var qsVal = _httpRequestMessage.GetQueryNameValuePairs()
                    .Where(x => string.Equals(x.Key, Mvc.Constants.DEBUGFLAGSCOOKIENAME, StringComparison.OrdinalIgnoreCase)).Select(x => x.Value).FirstOrDefault();

            if (qsVal != null)
            {
                DebugFlags = qsVal.Split(new char[','], StringSplitOptions.RemoveEmptyEntries)
                    .Select(x => (DebugModeFlagValues)Enum.Parse(typeof(DebugModeFlagValues), x, true))
                    .Aggregate(DebugFlags, (a, b) => a | b);

                DebugFlags = DebugFlags.HasFlag(DebugModeFlagValues.None) ? DebugModeFlagValues.None : DebugFlags;


                var cookie = new HttpCookie(Mvc.Constants.DEBUGFLAGSCOOKIENAME, ((int)DebugFlags).ToString());
                if (DebugFlags == DebugModeFlagValues.None)
                {
                    cookie.Expires = DateTime.MinValue;
                }

                _cookieProvider.SaveResponseCookie(Mvc.Constants.DEBUGFLAGSCOOKIENAME, cookie, false);

            }
            else
            {
                var cookie = _cookieProvider.GetRequestCookie(Constants.DEBUGFLAGSCOOKIENAME);
                int cookieVal;
                if (int.TryParse(cookie?.Value, out cookieVal))
                {
                    DebugFlags = (DebugModeFlagValues)cookieVal;
                }

            }

        }

        public DebugModeFlagValues DebugFlags
        {
            get; set;
        }
      
        public string CurrencyCodeOverride { get; set; }
    }

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