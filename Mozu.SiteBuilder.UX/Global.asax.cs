using System.Configuration;
using System.Web.Http;
using System.Web.Routing;
using Autofac;
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
            if (_bs != null) return; 
            _bs =  new BootStrapperUX();
            _bs.Bootstrap(  GlobalConfiguration.Configuration );
       
            if (ConfigurationManager.AppSettings["routeDebug"] == "true")
            {
                RouteDebugger.RewriteRoutesForTesting(RouteTable.Routes);
            }
        }

        protected void Application_End()
        {
            // dispose of the IServiceBus and of the container
            if (_bs != null && _bs.Container != null)
            {
                var sb = _bs.Container.ResolveOptional<Burrows.IServiceBus>();
                if (sb != null)
                    sb.Dispose();

                _bs.Container.Dispose();
            }
        }
       
    }


}