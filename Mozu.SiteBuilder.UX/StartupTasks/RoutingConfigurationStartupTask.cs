//using System.Web.Mvc;
//using System.Web.Routing;
//using Autofac;
//using Mozu.Core.Configuration;
//using Volusion.SiteBuilder.UX.Models;

//namespace Mozu.SiteBuilder.UX.StartupTasks
//{
//    /// <summary>
//    /// Registers routes for the web application
//    /// </summary>
//    public class RoutingConfigurationStartupTask : StartUpTask
//    {
//        #region Implementation of IStartupTask
//        public override void Execute()
//        {
//            /*RouteTable.Routes.IgnoreRoute("favicon.ico");
//            AreaRegistration.RegisterAllAreas();
//            RegisterContentRoutes(RouteTable.Routes);
//            RegisterRoutes(RouteTable.Routes);*/
//        }

//        public void RegisterRoutes(RouteCollection routes)
//        {
//            // routes.Clear();

//            routes.MapRoute(
//                "Robots",
//                "robots.txt",
//                new { controller = "Home", action = "RobotsTxt" });

//            routes.MapRoute(
//                "GoogleSiteVerification",
//                "google{hash}.html",
//                new { controller = "Home", action = "GoogleSiteVerification" },
//                new { hash = @"[a-f0-9]{16}" }
//                );

//            // Ignore text, html, files.
//            routes.IgnoreRoute("{file}.txt");
//            routes.IgnoreRoute("{file}.htm");
//            routes.IgnoreRoute("{file}.html");

//            // Ignore axd files such as assest, image, sitemap etc
//            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

//            routes.MapRoute(
//                "Default", // Route name
//                "{controller}/{action}/{id}", // URL with parameters
//                new { controller = "home", action = "Index", area = "StoreFront", id = UrlParameter.Optional } // Parameter defaults
//          );
//            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");
//            routes.IgnoreRoute("favicon.ico");
//        }

//        protected void RegisterContentRoutes(RouteCollection routes)
//        {
//            routes.MapRoute("resources",
//              "resources/{action}/{*pathInfo}",
//              new { controller = "Resource", Action = "script", pathInfo = UrlParameter.Optional });

//            routes.MapRoute("legacyContent",
//                 "v/{*pathInfo}",
//                 new { controller = "Resource", Action = "LegacyStoreContent", pathInfo = UrlParameter.Optional });
//        }

//        #endregion
//    }
//}