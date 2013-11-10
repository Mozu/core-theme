using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Web;
using Autofac;
using Mozu.Core.Api;
using Mozu.Core.Api.Client;
using Mozu.Core;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Behaviors;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using Mozu.User.Contracts.Clients;
using Constants = Mozu.Core.Api.Contracts.Constants;

namespace Mozu.SiteBuilder.Mvc
{
    public class SiteBuilderApiContext : MozuServiceApiContext, ISiteBuilderApiContext, ICloneable
    {
        private readonly ICookieProvider _cookieProvider;
        private readonly ISettings _settings;
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly HttpRequestMessage _httpRequestMessage;


        internal const string COOKIENAME = "SBCONTEXT";




        public SiteBuilderApiContext(System.Web.HttpContextBase context, ICookieProvider cookieProvider, ISettings settings, IAuthenticationHelper authenticationHelper, HttpRequestMessage httpRequestMessage)
            : base()
        {
            TenantId = -1;
            _cookieProvider = cookieProvider;
            _settings = settings;
            _authenticationHelper = authenticationHelper;
            _httpRequestMessage = httpRequestMessage;

            DataViewMode = DataViewModeType.Live;
            IsEditMode = false;

            Load();
            if ( !this.MasterCatalogId.HasValue )
            {
               this.MasterCatalogId = this.MasterCatalogId;
            }
            LoadUser();
            ValidateUser();
            ValidateDataMode();
        }

        private static System.Collections.Concurrent.ConcurrentDictionary<string, Site> g_domainSiteLookup = new ConcurrentDictionary<string, Site>(StringComparer.OrdinalIgnoreCase);



        public void LoadUser()
        {


            IEnumerable<string> values;
            if (_httpRequestMessage.Headers.TryGetValues(Mozu.Core.Api.Contracts.Constants.Headers.USER_CLAIMS, out values))
            {
                return;
            }

            //todo check refreshToken Loc
          
            var accessToken = _authenticationHelper.GetAccessToken();
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

            


        }
        private static int PublishBehavorID = new PublishPreviewBehavior().Id;

        void ValidateDataMode()
        {
            if (ScopeType != UserScopeType.Shopper 
                || this.DataViewMode != DataViewModeType.Pending)
            {
                return;
            }
             if (this.UserClaims == null)
             {
                 return;
              
             }
            if (this.UserClaims.BehaviorIds == null)
            {
                this.UserClaims.BehaviorIds = new int[0];
            }
            if (!this.UserClaims.BehaviorIds.Contains(PublishBehavorID))
            {
                this.UserClaims.BehaviorIds = this.UserClaims.BehaviorIds.Concat(new int[] { PublishBehavorID }).ToArray();
            }
        }

        bool ValidateUser()
        {
            string bagVal;
            int tmpInt;
            if (this.UserClaims == null)
            {
                this.HasInvalidCredentials = true;
                return false;
            }
            if (!this.UserClaims.Bag.TryGetValue("TenantId", out bagVal) || !int.TryParse(bagVal, out tmpInt) || tmpInt != this.TenantId)
            {
                if (ScopeType == UserScopeType.Shopper)
                {
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
            this.LocaleCode = "en-US";
            this.CurrencyCode = "usd";





            IEnumerable<string> values;
            if (_httpRequestMessage.GetQueryNameValuePairs().Any(x => string.Equals(x.Key, "IsEditMode", StringComparison.OrdinalIgnoreCase) && x.Value == "true"))
            {
                this.IsEditMode = true;
                this.DataViewMode = DataViewModeType.Pending;
            }
            else
            {
                DataViewModeType dmt;

                if (_httpRequestMessage.Headers.TryGetValues(Constants.Headers.DATA_VIEW_MODE, out values))
                {
                    this.DataViewMode = (DataViewModeType)Enum.Parse(typeof(DataViewModeType), values.First());
                }

            }


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
                    this.TenantId = site.TenantId;
                    return;
                }
            }

            if (!SiteId.HasValue)
            {
                LoadFromCookie(_cookieProvider);
            }









        }

        private void LoadFromCookie(ICookieProvider cookieProvider)
        {
            var cookie = cookieProvider.GetRequestCookie(COOKIENAME);
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
                DataViewModeType dataViewModeType;
                if (Enum.TryParse<DataViewModeType>(cookie["dataview"], true, out dataViewModeType))
                {
                    this.DataViewMode = dataViewModeType;
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






        public void SetUser(LightweightUserClaims user)
        {
            this.UserClaims = user;
        }

        public bool IsEditMode { get; set; }

        public bool HasInvalidCredentials { get; set; }

        public object Clone()
        {
            return this.MemberwiseClone();
        }
    }
}
