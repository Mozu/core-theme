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
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;

namespace Mozu.SiteBuilder.Mvc
{
    public interface IUniversalSiteApiClient : ISitesWebApiClient
    {
    }

    public class UniversalSiteApiClient : SitesWebApiClient, IUniversalSiteApiClient
    {
        private readonly ISettings _setting;
        private const int VOLUSIONSITEID = 0;
        private const int VOLUSIONTENANTID = 0;

        public UniversalSiteApiClient(ISettings setting)
            : base(new ServiceClientMessageHandler(new ApiContext() { SiteId = VOLUSIONSITEID, TenantId = VOLUSIONTENANTID }, setting))

    {
        _setting = setting;
    }
    }

    public class SiteBuilderApiContext : MozuServiceApiContext
    {
        private readonly ISettings _settings;
        internal const string CONTEXT_KEY = "V:STORECTX";
        internal const string COOKIENAME = "SBCONTEXT";

        public SiteBuilderApiContext(System.Web.HttpContextBase context, Mozu.SiteBuilder.Mvc.Security.AuthenticationHelper authHelper, ICookieProvider cookieProvider , ISettings settings )
            : base()
        {
            _settings = settings;


            Load(context, cookieProvider);
        }

        private static System.Collections.Concurrent.ConcurrentDictionary<string, Site> g_domainSiteLookup = new ConcurrentDictionary<string, Site>(StringComparer.OrdinalIgnoreCase);

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
                if ( req.Headers.AllKeys.Any(x => x == Mozu.Core.Api.Contracts.Constants.Headers.SITE))
                {

                    var headers = new HttpRequestMessage().Headers;

                    foreach (var key in req.Headers.AllKeys.Where(x => x.StartsWith("x-")))
                    {
                        headers.TryAddWithoutValidation(key, req.Headers.GetValues(key));
                    }

                    this.InitFromHeaders(headers);
                    return;
                }

                string host = req.Url.Host;
                Site site = g_domainSiteLookup.GetOrAdd(host, LookupSiteByDomain);

                if (site != null)
                {
                    this.SiteId = site.Id;
                    this.TenantId = site.TenantId;
                    return;
                }

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
                        this.TenantId = tmpInt;
                    }
                    if (int.TryParse(cookie["sitegroup"], out tmpInt))
                    {
                        this.SiteGroupId  = tmpInt;
                    }
                    
                    return;
                }
            }
           // this.SiteId = int.Parse(System.Configuration.ConfigurationManager.AppSettings["default-site"]);
           this.TenantId = int.Parse(System.Configuration.ConfigurationManager.AppSettings["default-tenant"]);
            
        }

        Site LookupSiteByDomain(string host )
        {
            var client = new SitesWebApiClient(new ServiceClientMessageHandler(new ApiContext(), _settings ));
            var sites = client.GetSites(0, 1, null, "domainname eq " + host).Result.ReadAsSync();
            return sites.Items.FirstOrDefault();

        }
    }
}
