using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using Mozu.Core.Api;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.UX.Models;
using Mozu.Tenant.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Configuration
{
    public  class BootStrapperUX : AbstractWebApiBootstrapper
    {
        protected override void AddMessageHandlers(System.Web.Http.HttpConfiguration httpConfiguration)
        {
            base.AddMessageHandlers(httpConfiguration);
            //GlobalFilters.Filters.Add(new JsonHandleError());
            //GlobalFilters.Filters.Add(new PageHandleError());
        }
        protected override void ApplicationStart(System.Web.Http.HttpConfiguration httpConfiguration)
        {
            base.ApplicationStart(httpConfiguration);
        }
        public override void InitializeAutoMapperProfiles(System.Web.Http.HttpConfiguration httpConfiguration)
        {
            base.InitializeAutoMapperProfiles(httpConfiguration);
        }
        protected override void InitializeContainerFactory(Core.Configuration.AutofacContainerFactory containerFactory)
        {
            base.InitializeContainerFactory(containerFactory);
            containerFactory.UsingAssembly(Assembly.Load("Mozu.Core.Api"))
               .UsingAssembly(typeof(ISitesWebApiClient).Assembly)
               //.UsingAssembly(typeof(IStartUpTask).Assembly)
               .UsingAssembly(typeof(IPermissionsRepository).Assembly)
               .UsingAssembly(Assembly.Load("Mozu.SiteBuilder.Mvc"))
               .UsingAssembly(Assembly.GetExecutingAssembly())
               ;

        }
        protected override void InitializeLoggingServiceFactory(System.Web.Http.HttpConfiguration configuration)
        {
            base.InitializeLoggingServiceFactory(configuration);
        }
        protected override void PreApplicationStart(System.Web.Http.HttpConfiguration httpConfiguration)
        {
            LogStartupMessage<MvcApplication>("Mozu.SiteBuilder.UX");
        }
        protected override void RegisterControllerRoutes(System.Web.Http.HttpConfiguration httpConfiguration)
        {
            base.RegisterControllerRoutes(httpConfiguration);
           
        }


        
        public void RegisterMvcRoutes(RouteCollection routes)
        {
            return;
            // Content Routes

            routes.MapRoute("resources",
                "resources/{action}/{*pathInfo}",
                new { controller = "Resource", Action = "script", pathInfo = UrlParameter.Optional });

            routes.MapRoute("legacyContent",
                 "v/{*pathInfo}",
                 new { controller = "Resource", Action = "LegacyStoreContent", pathInfo = UrlParameter.Optional });

            // Ignore text, html, files.
            routes.IgnoreRoute("{file}.txt");
            routes.IgnoreRoute("{file}.htm");
            routes.IgnoreRoute("{file}.html");

            // Ignore axd files such as assest, image, sitemap etc
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                "Default", // Route name
                "{controller}/{action}/{id}", // URL with parameters
                new { controller = "home", action = "Index", area = "StoreFront", id = UrlParameter.Optional } // Parameter defaults
            );
            routes.IgnoreRoute("favicon.ico");

            // Web Tools routes

            routes.MapRoute(
                "Robots",
                "robots.txt",
                new { controller = "Home", action = "RobotsTxt" });

            routes.MapRoute(
                "GoogleSiteVerification",
                "google{hash}.html",
                new { controller = "Home", action = "GoogleSiteVerification" },
                new { hash = @"[a-f0-9]{16}" }
                );

            // RIA Routes

            routes.MapRoute("img", "img/{collection}/{documentId}",
                    new { action = "Index", controller = "img" });
            routes.MapRoute("download", "download/{collection}/{documentId}",
                     new { action = "Download", controller = "img" });

            routes.IgnoreRoute("scripts/{*.pathInfo}");

            routes.MapRoute("auth", "auth/{action}",
                new { action = "Index", controller = "auth" });

            routes.MapRoute("login", "auth",
                new { action = "Index", controller = "auth" });

            routes.MapRoute("RIA", "{*url}",
                new { action = "Index", controller = "home" });
        }


        //class PageHandleError : IExceptionFilter
        //{

        //    public void OnException(ExceptionContext filterContext)
        //    {
        //        if (!filterContext.ExceptionHandled && filterContext.RequestContext.HttpContext.Request.ContentType != "application/json")
        //        {
        //            filterContext.ExceptionHandled = true;
        //            filterContext.Result = new ViewResult()
        //            {
        //                ViewName = "error",
        //                ViewData = new ViewDataDictionary(filterContext.Exception)
        //            };
        //        }

        //    }
        //}

        //class JsonHandleError : IExceptionFilter
        //{

        //    public void OnException(ExceptionContext filterContext)
        //    {
        //        if (!filterContext.ExceptionHandled && filterContext.RequestContext.HttpContext.Request.ContentType == "application/json")
        //        {
        //            filterContext.HttpContext.Response.Clear();
        //            // Prepare the response code.
        //            filterContext.ExceptionHandled = true;
        //            var mc = new List<MessageContainer>()
        //            {
        //            };
        //            var ex = filterContext.Exception.UnwrapAgg();
        //            if (ex is Mozu.Core.Api.Client.Exceptions.ApiWebClientException && ex.Data != null && ex.Data.Count > 0)
        //            {
        //                foreach (var item in ex.Data.Values)
        //                {
        //                    mc.Add(new MessageContainer() { Message = item.ToString() });
        //                }

        //            }
        //            else
        //            {
        //                mc.Add(new MessageContainer()
        //                {
        //                    Message = ex.Message,
        //                    Stack = ex.ToString()
        //                });
        //            }
        //            filterContext.Result = new JsonDCResult()
        //            {

        //                JsonRequestBehavior = JsonRequestBehavior.AllowGet,
        //                Data = new MessageContainerCollection()
        //                {
        //                    Messages = mc
        //                }
        //            };
        //        }

        //    }
        //}

    }
}
