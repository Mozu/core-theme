using System.Reflection;
using System.Web.Mvc;
using System.Web.Routing;
using Mozu.Core.Api;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Logging;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.UX.ActionFilters;
using Mozu.Tenant.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Configuration
{
    public  class BootStrapperUX : AbstractWebApiBootstrapper
    {
        protected override void AddMessageHandlers(System.Web.Http.HttpConfiguration httpConfiguration)
        {
            base.AddMessageHandlers(httpConfiguration);
            GlobalFilters.Filters.Add(new AddCorrelationHeaderFilterAttribute());
            GlobalFilters.Filters.Add(new PreserveApiContextFilterAttribute());
            GlobalFilters.Filters.Add(new NotFoundActionFilter());

            GlobalFilters.Filters.Add(new HandleAllTheErrorsFilter());
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
            
            // TODO: we really break abstraction here.
            var fac = LoggingService.LoggingServiceFactory as Log4NetServiceFactory;
            if (fac != null)
                fac.AddContextProvider(new CurrentRequestLoggingContextProvider());
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
#pragma warning disable 0162
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
#pragma warning restore 0162
    }
}
