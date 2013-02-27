using System.Reflection;
using System.Web.Http;
using Autofac;
using Autofac.Integration.Mvc;
using Mozu.Core.Api;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.UX.Configuration;
using System.Web.Routing;
using System.Web.Mvc;
using Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers;
using System.Web;
using System;
using System.IO;
using Mozu.Tenant.Contracts.Clients;


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