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

            context.MapRoute("resources",
               "resources/{action}/{*pathInfo}",
               new { controller = "Resource", Action = "script", pathInfo = UrlParameter.Optional });

            context.MapRoute("sdkdist",
               "sdk/{action}.js",
               new { controller = "SDKResource", Action = "all", pathInfo = UrlParameter.Optional });
        }
    }
}
