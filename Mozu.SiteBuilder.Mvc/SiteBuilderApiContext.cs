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
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using Constants = Mozu.Core.Api.Contracts.Constants;

namespace Mozu.SiteBuilder.Mvc
{
    public class SiteBuilderApiContext : MozuServiceApiContext, ISiteBuilderApiContext
    {
        private readonly ICookieProvider _cookieProvider;
        private readonly ISettings _settings;
        private readonly IAuthenticationHelper _authenticationHelper;

        internal const string CONTEXT_KEY = "V:STORECTX";
        internal const string COOKIENAME = "SBCONTEXT";




        public SiteBuilderApiContext(System.Web.HttpContextBase context, ICookieProvider cookieProvider, ISettings settings, IAuthenticationHelper authenticationHelper)
            : base()
        {
            TenantId = -1;
            _cookieProvider = cookieProvider;
            _settings = settings;
            _authenticationHelper = authenticationHelper;

            //if using the rp then default to active.  rp will send the datamode header.
            CmsDraftState = _settings.AppSettings("ReverseProxy") == "true" ? Mozu.Content.Contracts.PublishStates.Active  : Mozu.Content.Contracts.PublishStates.Latest;// "active";

            Load(context, cookieProvider);
            LoadUser(context, cookieProvider);
        }

        private static System.Collections.Concurrent.ConcurrentDictionary<string, Site> g_domainSiteLookup = new ConcurrentDictionary<string, Site>(StringComparer.OrdinalIgnoreCase);

        /// <summary>
        /// "active" or "draft".
        /// </summary>
        public string CmsDraftState { get; set; }

        public void LoadUser(HttpContextBase ctx, ICookieProvider cookieProvider)
        {
            var accessToken = _authenticationHelper.GetAccessToken();
            LightweightUserClaims claims;
            if (!string.IsNullOrEmpty(accessToken) && LightweightUserClaims.TryParse(accessToken, out claims))
            {
                //todo validate tenant and site 
                this.UserClaims = claims;
            }
                
        }

       

        

        public void Load(HttpContextBase ctx, ICookieProvider cookieProvider)
        {
            this.LocaleCode = "en-US";
            this.CurrencyCode = "usd";
            
            HttpRequestBase req = null;
            try
            {
                if ( ctx != null )
                {
                    req = ctx.Request;
                }
            }
            catch 
            {
                
            }
            
            if (req != null)
            {
                if (req.QueryString["IsEditMode"] == "true")
                {
                    CmsDraftState = Mozu.Content.Contracts.PublishStates.Latest;
                }
                //used to demo outside of rp 
                else if (req.QueryString["publishMode"] == "true")
                {
                    CmsDraftState = Mozu.Content.Contracts.PublishStates.Active;
                }
                DataViewModeType dmt;
                if (Enum.TryParse<DataViewModeType>(req.Headers[Constants.Headers.DATA_VIEW_MODE], out dmt))
                {
                    this.DataViewMode = dmt;
                    this.CmsDraftState = dmt == DataViewModeType.Pending ?  Mozu.Content.Contracts.PublishStates.Latest : Mozu.Content.Contracts.PublishStates.Active;
                }

                if (req.Headers.AllKeys.Any(x => x == Mozu.Core.Api.Contracts.Constants.Headers.TENANT))
                {

                    var headers = new HttpRequestMessage().Headers;

                    foreach (var key in req.Headers.AllKeys.Where(x => x.StartsWith("x-")))
                    {
                        headers.TryAddWithoutValidation(key, req.Headers.GetValues(key));
                    }

                    this.InitFromHeaders(headers);
                    
                }
                else
                {
                    string host = req.Url.Host;
                    Site site = g_domainSiteLookup.GetOrAdd(host, LookupSiteByDomain);

                    if (site != null)
                    {
                        this.SiteId = site.Id;
                        this.SiteGroupId = site.SiteGroupId;
                        this.TenantId = site.TenantId;
                        return;
                    }    
                }
                if (!SiteId.HasValue)
                {
                    InitFromCookie(cookieProvider);    
                }
                
                    
                

               
               
            }
            
            
        }

        private void InitFromCookie(ICookieProvider cookieProvider)
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
                if (int.TryParse(cookie["sitegroup"], out tmpInt))
                {
                    this.SiteGroupId = tmpInt;
                }
            }
        }

        Site LookupSiteByDomain(string host )
        {
            var client = new SitesWebApiClient(new ServiceClientMessageHandler(new ApiContext(), _settings ));
            var sites = client.GetSites(filter: "domainname eq " + host).Result.ReadAsSync();
            return sites.Items.FirstOrDefault();

        }


    
        


        public void SetUser(LightweightUserClaims user)
        {
            this.UserClaims = user;
        }
    }
}
