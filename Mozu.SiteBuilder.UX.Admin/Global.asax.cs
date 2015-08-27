using System.Configuration;
using System.Linq;
using System.Web.Http;
using System.Web.Routing;
using Autofac.Integration.WebApi;
using Mozu.Core.Api;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Debugging.RouteDebug;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Admin.Configuration;

namespace Mozu.SiteBuilder.UX.Admin
{
    public class MvcApplication : WebApiApplicationBase
    {
        private BootStrapperAdmin _bsa;


        protected void Application_Start()
        {
            if (_bsa != null)
            {
                return;
            }
            _bsa = new BootStrapperAdmin();
            _bsa.Bootstrap(GlobalConfiguration.Configuration);

            

            GlobalConfiguration.Configuration.DependencyResolver = new AutofacWebApiDependencyResolver(_bsa.Container);

            

           

           
            if (ConfigurationManager.AppSettings["routeDebug"] == "true")
            {
                RouteDebugger.RewriteRoutesForTesting(RouteTable.Routes);
            }
        }

      

        
    }
}