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
        }
    }
}
