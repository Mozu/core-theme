using System.Net.Http.Headers;
using System.Web.Http;
using System.Web.Http.Routing;
using System.Web.Routing;


namespace Mozu.SiteBuilder.UX.Configuration
{
    public class RouteConfig
    {
    


        public void Register(HttpRouteCollection routes)
        {
            routes.MapHttpRoute(
                "Storefront_MyAccount2",
                "user/myaccount",
                new {controller = "MyAccount", action = "Index"});


            routes.MapHttpRoute(
                "StoreFront_home_pages",
                "pages",
                new {controller = "Home", action = "Index"});


            routes.MapHttpRoute(
                "StoreFront_home",
                "",
                new {controller = "Home", action = "Index"});

            routes.MapHttpRoute(
                "StoreFront_404",
                "404",
                new {controller = "Home", action = "NotFound",});

            routes.MapHttpRoute(
               "scripts",
               "scripts/{*pathInfo}",
               new { controller = "Resource", action = "Scripts" });

            routes.MapHttpRoute(
                "stylesheets",
                "stylesheets/{*pathInfo}",
                new { controller = "Resource", action = "Stylesheets" });

            routes.MapHttpRoute(
                "livetemplates",
                "livetemplates",
                new { controller = "Resource", action = "LiveTemplates" });

            routes.MapHttpRoute("builtinscripts",
               "js/{action}-{mode}.js",
               new { controller = "BuiltinScripts", mode = "min" });

            routes.MapHttpRoute(
                "StoreFront_pages",
                "pages/{pageName}",
                new {controller = "cmspages", action = "Page", collection = "pages"});

            routes.MapHttpRoute(
                "StoreFront_pages_create",
                "pages/create/{pageName}",
                new {controller = "CmsPages", action = "Create", collection = "pages"});

            routes.MapHttpRoute(
                "StoreFront_rss",
                "blogs/rss",
                new {controller = "Blogs", action = "Rss"});

            routes.MapHttpRoute(
                "StoreFront_blogs",
                "blogs/{post}",
                new {controller = "Blogs", action = "Post"});

            routes.MapHttpRoute(
                "StoreFront_feeds_categories",
                "feeds/category/{categoryId}",
                new {controller = "Catalog", action = "CategoryFeed"});

            routes.MapHttpRoute(
                "StoreFront_categories",
                "category/{categoryId}",
                new {controller = "Catalog", action = "Category"});

            routes.MapHttpRoute(
                "StoreFront_ajax_Configure",
                "product/configure",
                new {controller = "Catalog", action = "Configure"});

            routes.MapHttpRoute(
                "StoreFront_productDetails",
                "product/{productCode}",
                new {controller = "Catalog", action = "ProductDetail"});

            routes.MapHttpRoute(
                "StoreFront_checkout",
                "checkout/{orderId}/{action}",
                new {controller = "Checkout", action = "Index"});

            routes.MapHttpRoute(
                "StoreFront_cart",
                "cart/{action}",
                new {controller = "Cart", action = "Index"});

            routes.MapHttpRoute(
                "StoreFront_Store",
                "store",
                new {controller = "Catalog", action = "Store"});

            routes.MapHttpRoute(
                "StoreFront_Localization",
                "localization/{colKey}/{key}",
                new {controller = "Localization", action = "Index"});

            routes.MapHttpRoute(
                "StoreFront_LocCollection",
                "localization/collections/{keys}",
                new {controller = "Localization", action = "collections"});

            routes.MapHttpRoute(
                "StoreFront_Sitemap",
                "sitemap.xml",
                new {controller = "Sitemap", action = "Index"});

            routes.MapHttpRoute(
                "Widgets",
                "widgets/{action}",
                new {controller = "Widgets", action = "Index"});

            routes.MapHttpRoute(
                "templates",
                "templates/{templateId}",
                new {controller = "Templates", action = "Index"});

            routes.MapHttpRoute(
                "resources",
                "resources/{*pathinfo}",
                new { controller = "Resource", action = "Misc" });

            routes.MapHttpRoute(
                "StoreFront_Prefixed_default",
                "storefront/{controller}/{action}/{id}",
                new {action = "Index"},
                new {controller = @"catalog|pages|email|cart|auth|checkout|cmspages|myaccount|localization|sitemap|template|widget"}
                );
            //removing default... add a matching route above
            routes.MapHttpRoute(
                "StoreFront_default",
                "{controller}/{action}/{id}",
                new {action = "Index"},
                new {controller = @"catalog|pages|email|cart|auth|checkout|cmspages|myaccount|localization|sitemap|template|widget"}
                );




            routes.MapHttpRoute(
               "Misc_default",
               "Misc/{controller}/{action}/{id}",
               new { action = "Index" }
           );

            routes.MapHttpRoute(
               "Misc_content",
               "files/{tenant}/{sitegroup}/{documentId}",
               new { action = "index", controller = "content", collection = "files", site = "" }
           );


            routes.MapHttpRoute(
                "Set Site Context",
                "_gosite/{siteId}",
                new { action = "GoSite", controller = "Testing" }
            );

            routes.MapHttpRoute(
                "Set Theme Override",
                "setTheme/{themeType}",
                new { action = "ForceTheme", controller = "Testing" }
            );

            //routes.MapHttpRoute("resources",
            //   "resources/{action}/{*pathInfo}",
            //   new { controller = "Resource", Action = "script", pathInfo = UrlParameter.Optional });






            routes.MapHttpRoute(
                "AJAX Login",
                "login",
                new { controller = "Auth", action = "AjaxLogin" }, new ContentTypeConstraint("text/html", false));


            routes.MapHttpRoute(
                "Login",
                "login",
                new { controller = "Auth", action = "Login" }, new ContentTypeConstraint("text/html", true));

            routes.MapHttpRoute(
                "Reset Password",
                "resetpassword",
                new { controller = "Auth", action = "ResetPassword" });

            routes.MapHttpRoute(
                "Error",
                "{*url}",
                new {controller = "Home", action = "NotFound"}
                );

            //routes.MapHttpRoute(
            //    "Storefront_SignIn",
            //    "user/{action}",
            //    new { controller = "Auth", action = "SignIn" });
        }

        class ContentTypeConstraint : IHttpRouteConstraint 
        {
            private readonly bool _include;

            private MediaTypeWithQualityHeaderValue _conetntTypeValue;
            public ContentTypeConstraint(string contentType, bool include = true  )
            {
                _include = include;
                _conetntTypeValue= new MediaTypeWithQualityHeaderValue(contentType );
            }


            public bool Match(System.Net.Http.HttpRequestMessage request, IHttpRoute route, string parameterName, System.Collections.Generic.IDictionary<string, object> values, HttpRouteDirection routeDirection)
            {
                var ret = request.Headers.Accept.Contains(_conetntTypeValue);
                return (_include == ret);
                
                
            }
        }
    }
}