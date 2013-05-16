using System;
using System.Configuration;
using System.IO;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;
using Autofac.Integration.Mvc;
using Mozu.Core.Api;
using Mozu.SiteBuilder.Mvc.Debugging.RouteDebug;
using Mozu.SiteBuilder.UX.Configuration;


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
            _bs.Bootstrap(GlobalConfiguration.Configuration);
            _bs.RegisterMvcRoutes(RouteTable.Routes);
               
            AreaRegistration.RegisterAllAreas();
            DependencyResolver.SetResolver(new AutofacDependencyResolver(_bs.Container ));


            if (ConfigurationManager.AppSettings["routeDebug"] == "true")
            {
                RouteDebugger.RewriteRoutesForTesting(RouteTable.Routes);
            }
        }

 

        protected void Application_EndRequest()
        {
            if (Context.Response.StatusCode == 404)
            {
                if (Context.Request.RawUrl.IndexOf ("favicon" , StringComparison.OrdinalIgnoreCase ) > -1)
                {
                    return;
                }
                if (Path.GetExtension(Context.Request.Path).Length > 0)
                {
                    return;
                }
                if (Context.Request.RawUrl.IndexOf("404") > -1)
                {
                    return;
                }
               
                Context.Response.RedirectToRoute("StoreFront_404");
            }
        }
    }


}