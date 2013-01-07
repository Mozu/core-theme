using System.Web.Mvc;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront
{
    public class StoreFrontAreaRegistration : AreaRegistration
    {
        public override string AreaName
        {
            get
            {
                return "StoreFront";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context)
        {
            context.MapRoute(
              "StoreFront_home",
              "",
              new { controller = "Home", action = "Index" });

            context.MapRoute(
                "StoreFront_404",
                "404",
               new { controller = "CmsPages", action = "NotFound", });


            context.MapRoute(
                "StoreFront_default",
                "StoreFront/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional }
            );

            context.MapRoute(
               "StoreFront_pages",
               "pages/{pageName}",
               new { controller = "CmsPages", action = "Page", collection = "pages" });

            context.MapRoute(
              "StoreFront_pages_create",
              "pages/create/{pageName}",
              new { controller = "CmsPages", action = "Create", collection = "pages" });

            context.MapRoute(
            "StoreFront_rss",
            "blogs/rss",
            new { controller = "Blogs", action = "Rss" });

            context.MapRoute(
            "StoreFront_blogs",
            "blogs/{post}",
            new { controller = "Blogs", action = "Post" });


            context.MapRoute(
            "StoreFront_categories",
            "category/{categoryId}",
            new { controller = "Catalog", action = "Category" });

            context.MapRoute(
            "StoreFront_ajax_Configure",
            "product/configure",
            new { controller = "Catalog", action = "Configure" });

            context.MapRoute(
            "StoreFront_productDetails",
            "product/{productCode}",
            new { controller = "Catalog", action = "ProductDetail" });

            context.MapRoute(
            "StoreFront_cart",
            "cart",
            new { controller = "Cart", action = "Index" });

            context.MapRoute(
            "StoreFront_Store",
            "store",
            new { controller = "Catalog", action = "Store" });

            context.MapRoute(
            "StoreFront_Localization",
            "localization/{colKey}/{key}",
            new { controller = "Localization", action = "Index" });

            context.MapRoute(
            "StoreFront_LocCollection",
            "localization/collections/{keys}",
            new { controller = "Localization", action = "collections" });
           
        }
    }
}
