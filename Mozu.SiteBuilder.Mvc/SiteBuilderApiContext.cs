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
            SetDebugMode();

            DataViewMode = dvmGetter.GetDataViewMode(UserClaims);
            this.Now = new Lazy<DateTime>(GetNowValue);
            
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

                cookie =new HttpCookie(Mvc.Constants.DEBUGCOOKIENAME, isDebugMode ? "t" : "f");
                if (!isDebugMode)
                {
                    cookie.Expires = DateTime.MinValue;
                }
                
                _cookieProvider.SaveResponseCookie(Mvc.Constants.DEBUGCOOKIENAME, cookie);

            }
            this.IsDebugMode = isDebugMode;
        }

        private DateTime GetNowValue()
        {
            var now = RoundMinueteToLowest10(DateTime.UtcNow);
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
                        cookie = new HttpCookie(Constants.NOWCOOKIENAME, now.ToUniversalTime().ToString("o"));
                    }
                    else
                    {
                        cookie = new HttpCookie(Constants.NOWCOOKIENAME, "");
                        cookie.Expires = DateTime.MinValue;
                    }


                    _cookieProvider.SaveResponseCookie(Constants.NOWCOOKIENAME, cookie);

                }
                else
                {

                    cookie = _cookieProvider.GetRequestCookie(Constants.NOWCOOKIENAME);
                    if (cookie != null)
                    {

                        if (DateTime.TryParse(cookie.Value, out temp))
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
            if (!string.IsNullOrEmpty(adminAccessToken) && LightweightUserClaims.TryParse(accessToken, out claims))
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
                this.HasInvalidCredentials = true;
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
                    this.UserClaims = LightweightUserClaims.CreateForAdminUser(Guid.NewGuid().ToString("N"), new int[0], new UserScope() { Id = this.TenantId, Type = UserScopeType.Tenant }, DateTime.Today.AddYears(1));
                    this.UserClaims.IsAnonymous = true;
                }
                this.HasInvalidCredentials = true;
                return false;

            }
            if (ScopeType == UserScopeType.Shopper && (!this.UserClaims.Bag.TryGetValue("SiteId", out bagVal) || !int.TryParse(bagVal, out tmpInt) || tmpInt != this.SiteId))
            {
                this.UserClaims = null;
                return false;
            }
            return true;
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



        public void Load()
        {
            IEnumerable<string> values;
            if (_httpRequestMessage.Headers.TryGetValues(Mozu.Core.Api.Contracts.Constants.Headers.TENANT, out values))
            {
                this.InitFromHeaders(_httpRequestMessage.Headers);
            }
            else if (!_httpRequestMessage.Headers.TryGetValues(Mozu.Core.Api.Contracts.Constants.Headers.ORIGINAL_URL, out values))
            {

                //todo:hyper check rp flag.
                //testing without proxy...
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

            if (string.IsNullOrEmpty(this.LocaleCode) && this.SiteId.HasValue)
            {
                Site site = g_SiteIdSiteLookup.GetOrAdd(this.SiteId.Value, LookupSiteById );
                if (site != null)
                {
                    LocaleCode = site.DefaultLocaleCode;
                    CurrencyCode = site.DefaultCurrencyCode;
                }
            }
        }

        private void LoadFromCookie(ICookieProvider cookieProvider)
        {
            var cookie = cookieProvider.GetRequestCookie(Mvc.Constants.COOKIENAME);
            if (cookie != null && cookie.HasKeys)
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

        public bool HasInvalidCredentials { get; set; }

        public LightweightUserClaims AdminUserClaim { get; set; }
        public Lazy<DateTime> Now { get; private set; }

        public void SetDataMode(DataViewModeType dataViewMode)
        {
            this.DataViewMode = dataViewMode;
        }
    }

    public static class Constants
    {
        public const string DefaultTheme = "Core6";
        public const string COOKIENAME = "SBCONTEXT";
        public const string DEBUGCOOKIENAME = "SBD";
		public const string NOWCOOKIENAME = "MZ_NOW";

    }
}