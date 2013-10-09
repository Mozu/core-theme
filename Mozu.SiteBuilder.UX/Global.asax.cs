using System;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Security.Principal;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;

using System.Web.Routing;
using Autofac;

using Mozu.Core.Api;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Debugging.RouteDebug;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Configuration;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Filters;
using Newtonsoft.Json;


namespace Mozu.SiteBuilder.UX
{
    public class MvcApplication : WebApiApplicationBase
    {
        private BootStrapperUX _bs;
        protected void Application_Start()
        {
            if (_bs != null)
            {
                return;
            }
            _bs =  new BootStrapperUX();
            _bs.Bootstrap(  GlobalConfiguration.Configuration );
             NDjango.Utilities.Comparer = new DjangoComparer();
       
            if (ConfigurationManager.AppSettings["routeDebug"] == "true")
            {
                RouteDebugger.RewriteRoutesForTesting(RouteTable.Routes);
            }
        }


       

        

        
       
    }


}