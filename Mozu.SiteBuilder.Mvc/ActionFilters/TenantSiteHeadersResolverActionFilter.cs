//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Web.Mvc;
//using System.Web;
//using Mozu.Core;
//using Mozu.SiteBuilder.Mvc.Extensions;
//using Mozu.Tenant.Contracts;
//using Mozu.Tenant.Contracts.Clients;
//using Mozu.Core.Api.Client;
//using Mozu.Core.Api;
//using System.Runtime.Caching;

//namespace Mozu.SiteBuilder.Mvc.ActionFilters
//{
//    public class TenantSiteHeadersResolverActionFilter : ActionFilterAttribute
//    {
        
        

//        public override void OnActionExecuting(ActionExecutingContext filterContext)
//        {
//            var request = filterContext.RequestContext.HttpContext.Request;
//            Site site = GetSiteByHostName(request.Url.Host);

//            if (site != null)
//            {
//                request.Headers.Add("x-vol-site", site.Id.ToString());
//                request.Headers.Add("x-vol-tenant", site.Id.ToString());

//                if (!request.Headers.AllKeys.Contains("x-vol-locale"))
//                {
//                    request.Headers.Add("x-vol-locale", site.LocaleCode);
//                }

//                if (!request.Headers.AllKeys.Contains("x-vol-currency"))
//                {
//                    request.Headers.Add("x-vol-currency", site.Currency);
//                }
//            }
//            base.OnActionExecuting(filterContext);
//        }

//        private Site GetSiteByHostName(string hostName)
//        {
//            Site site = (Site)MemoryCache.Default.Get(hostName);
//            if (site == null)
//            {
//                var client = new SitesWebApiClient(new ServiceClientMessageHandler(new ApiContext() ,  settings ));

//                var task = client.GetSites(0, 1, null, string.Format("content.domainname eq \"{0}\"", hostName));
//                site = task.Result.ReadAsSync().Items.FirstOrDefault();
                
//                if(site != null)
//                    MemoryCache.Default.Add(hostName,site, new DateTimeOffset(DateTime.Now.AddHours(24), System.TimeZone.CurrentTimeZone.GetUtcOffset(DateTime.Now)));
//            }

//            return site;
//        }
//    }
//}
