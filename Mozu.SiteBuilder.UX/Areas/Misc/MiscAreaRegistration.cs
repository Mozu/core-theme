using System.Web.Mvc;

namespace Mozu.SiteBuilder.UX.Areas.Misc
{
    public class MiscAreaRegistration : AreaRegistration
    {
        public override string AreaName
        {
            get
            {
                return "Misc";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context)
        {
            context.MapRoute(
                "Misc_default",
                "Misc/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional }
            );

            context.MapRoute(
               "Misc_content",
               "files/{tenant}/{sitegroup}/{documentId}",
               new { action = "index", controller = "content", collection = "files", site = ""}
           );


            context.MapRoute(
                "Set Site Context",
                "_gosite/{siteId}",
                new { action = "GoSite", controller = "Testing" }
            );

            context.MapRoute(
                "Set Theme Override",
                "setTheme/{themeType}",
                new { action = "ForceTheme", controller = "Testing" }
            );

            context.MapRoute("resources",
               "resources/{action}/{*pathInfo}",
               new { controller = "Resource", Action = "script", pathInfo = UrlParameter.Optional });

            context.MapRoute("sdkdist",
               "sdk/{action}.js",
               new { controller = "SDKResource", Action = "all", pathInfo = UrlParameter.Optional });
        }
    }
}
