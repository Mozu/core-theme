using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using System.Web.Http.Routing;

namespace Mozu.SiteBuilder.UX.Configuration
{
    public class RouteConfig
    {
        public void Register(HttpRouteCollection routes)
        {



            routes.MapHttpRoute(
              "favicon",
              "favicon.ico",
                     new {controller = "Resource", action = "misc" , pathinfo="images/favicon.ico" });
              



            
            routes.MapHttpRoute(
                "search",
                "search",
                new { controller = "Search", action = "index" });


           

            routes.MapHttpRoute(
                "StoreFront_productDetails_SEO",
                "{slug}/p/{productCode}",
                new {controller = "Catalog", action = "ProductDetail"});

            routes.MapHttpRoute(
               "StoreFront_productDetails",
               "product/{productCode}",
               new { controller = "Catalog", action = "ProductDetail" });

            routes.MapHttpRoute(
               "StoreFront_productDetailsShort",
               "p/{productCode}",
               new { controller = "Catalog", action = "ProductDetail" });

            routes.MapHttpRoute(
               "StoreFront_pages",
               "pages/{name}",
               new { controller = "cmspages", action = "Page", list = "pages@mozu" });


            routes.MapHttpRoute(
               "Misc_content_3",
               "cms/files/{documentId}",
               new { action = "index", controller = "content", list = "files@mozu" }
               );


            routes.MapHttpRoute(
               "cms_page",
               "cms/{list}/{name}",
               new { controller = "cmspages", action = "Page" });

            routes.MapHttpRoute(
               "StoreFront_pages_list",
               "cms/{list}",
               new { controller = "cmspages", action = "contentIndex" });



            routes.MapHttpRoute(
                "StoreFront_categories_SEO",
                "{slug}/c/{categoryId}",
                new { controller = "Catalog", action = "Category" }
                );


            routes.MapHttpRoute(
                "StoreFront_categories",
                "category/{categoryId}",
                new { controller = "Catalog", action = "Category" });

            routes.MapHttpRoute(
                "StoreFront_categories_short",
                "c/{categoryId}",
                new { controller = "Catalog", action = "Category" });



            routes.MapHttpRoute(
                "Storefront_User_ResetPAssword",
                "user/resetpasswordconfirm",
                new { controller = "Auth", action = "ResetPassword" });

            routes.MapHttpRoute(
                "Storefront_MyAccount2",
                "myaccount",
                new {controller = "MyAccount", action = "Index"});


            routes.MapHttpRoute(
                "Storefront_location",
                "location/{action}/{id}",
                new { controller = "Location", action = "Index", id = RouteParameter.Optional });

          


            routes.MapHttpRoute(
                "StoreFront_home",
                "",
                new {controller = "Home", action = "Index"});

            routes.MapHttpRoute(
                "StoreFront_404",
                "404",
                new {controller = "Home", action = "NotFound",});

            routes.MapHttpRoute(
                "hyprlivecontext",
                "hyprlivecontext",
                new {controller = "Resource", action = "hyprcontextaction"});

            routes.MapHttpRoute(
                "storefront_navigation",
                "nav",
                new {controller = "Resource", action = "AjaxNavigation"});

            routes.MapHttpRoute(
                "Visit_Tracking_Pixel",
                "_mzblank.gif",
                new {controller = "Visit", action = "TrackingPixel"});

            routes.MapHttpRoute(
                "scripts",
                "scripts/{*pathInfo}",
                new {controller = "Resource", action = "Scripts"});


            routes.MapHttpRoute(
                "compiledscripts",
                "compiled/scripts/{*pathInfo}",
                new { controller = "Resource", action = "CompiledScripts" });

            routes.MapHttpRoute(
                "stylesheets",
                "stylesheets/{*pathInfo}",
                new {controller = "Resource", action = "Stylesheets"});

            routes.MapHttpRoute(
                "livetemplates",
                "livetemplates",
                new {controller = "Resource", action = "LiveTemplates"});

            routes.MapHttpRoute("builtinscripts",
                "js/{action}-{mode}.js",
                new {controller = "BuiltinScripts", mode = "min"});


            routes.MapHttpRoute(
                "mozu_receiver",
                "receiver",
                new { controller = "Resource", action = "MozuReceiver" });
            
            routes.MapHttpRoute(
                "StoreFront_feeds_categories",
                "feeds/category/{categoryId}",
                new { controller = "Catalog", action = "CategoryFeed" });

           

            routes.MapHttpRoute(
                "StoreFront_rss",
                "blogs/rss",
                new {controller = "Blogs", action = "Rss"});

            routes.MapHttpRoute(
                "StoreFront_blogs",
                "blogs/{post}",
                new {controller = "Blogs", action = "Post"});

            

            

            routes.MapHttpRoute(
                "StoreFront_ajax_Configure",
                "product/configure",
                new {controller = "Catalog", action = "Configure"});


            

            routes.MapHttpRoute(
                "StoreFront_checkout",
                "checkout/{orderId}/{action}",
                new { controller = "Checkout", action = "Index", orderId = RouteParameter.Optional });

            

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
                "sitemap.xml/{action}/{page}",
                new { controller = "Sitemap", action = "Index", page = RouteParameter.Optional });

            routes.MapHttpRoute(
                "Widgets",
                "widgets/{action}",
                new {controller = "Widgets", action = "Index"});

            routes.MapHttpRoute(
                "templates",
                "templates/{templateId}",
                new {controller = "Templates", action = "Index"});

            routes.MapHttpRoute(
                "vlegacy_product",
                "{slug}-p/{productCode}.htm",
                 new { controller = "Catalog", action = "ProductDetail" });

            routes.MapHttpRoute(
               "vlegacy_product_asp",
               "ProductDetails.asp",
                new { controller = "Catalog", action = "ProductDetail" });
            

            routes.MapHttpRoute(
                "vlegacy_category",
                "{slug}-s/{categoryId}.htm",
                 new { controller = "Catalog", action = "Category" });

  //          Premium-18-Powered-Subwoofer-Cabinets-Pair-p/magma-118s-pw-pair.htm





            routes.MapHttpRoute(
                "resources",
                "resources/{*pathinfo}",
                new {controller = "Resource", action = "Misc"});
            routes.MapHttpRoute(
                "resources-Site-Thumbnail",
                "SiteThumbnail",
                new {controller = "Resource", action = "SiteThumbnail"});


            routes.MapHttpRoute(
                "StoreFront_Prefixed_default",
                "storefront/{controller}/{action}",
                new {action = "Index"},
                new { controller = @"catalog|pages|email|cart|auth|checkout|cmspages|myaccount|localization|sitemap|template|widget|testing" }
                );
            //removing default... add a matching route above
            routes.MapHttpRoute(
                "StoreFront_default",
                "{controller}/{action}/{id}",
                new { action = "Index", id = RouteParameter.Optional },
                new {controller = @"catalog|pages|email|cart|auth|checkout|cmspages|myaccount|localization|sitemap|template|widget|testing"}
                );



          





            

            //old tbd remove
            routes.MapHttpRoute(
                "Misc_content",
                "files/{tenant}/{mastercat}/{documentId}",
                new { action = "index", controller = "content", list = "files@mozu"  }
                );

         


            routes.MapHttpRoute(
                "Misc_content_2",
                "cms/{site}/files/{documentId}",
                new { action = "index", controller = "content", list = "files@mozu" }
                );

           


            routes.MapHttpRoute(
                "Misc_content_4",
                "{tenant}-{site}/cms/files/{documentId}",
                new { action = "index", controller = "content", list = "files@mozu" }
                );



            //http://txwks3164.corp.volusion.com/2083-2116/cms/7332/files/b1bf3cab-1d7c-42f8-901a-bff60b56d778?size=60

           


            routes.MapHttpRoute(
                "Set Site Context",
                "_gosite/{siteId}",
                new {action = "GoSite", controller = "Testing"}
                );

            routes.MapHttpRoute(
                "Set Theme Override",
                "setTheme/{themeType}",
                new {action = "ForceTheme", controller = "Testing"}
                );


            //todo remove before launch
            routes.MapHttpRoute(
                "widgettest",
                "widgettest",
                new {action = "widgettest", controller = "Testing"}
                );

            routes.MapHttpRoute(
                "DevDocs",
                "devdocs/{action}/{id}",
                new { action = "Index", 
                    id = RouteParameter.Optional ,
                    controller = "DeveloperDocumentation" }
                );


            //routes.MapHttpRoute("resources",
            //   "resources/{action}/{*pathInfo}",
            //   new { controller = "Resource", Action = "script", pathInfo = UrlParameter.Optional });


            routes.MapHttpRoute(
                "Logout",
                "logout",
                new {controller = "Auth", action = "LogOut"},
                new {acceptConstraint = new AcceptConstraint("text/html", true)});


            routes.MapHttpRoute(
                "AJAX Login",
                "user/login",
                new {controller = "Auth", action = "AjaxLogin"},
                new {acceptConstraint = new AcceptConstraint("text/html", false)});


            routes.MapHttpRoute(
                "Login",
                "user/login",
                new {controller = "Auth", action = "Login"},
                new {acceptConstraint = new AcceptConstraint("text/html", true)});

            routes.MapHttpRoute(
                "refresh tokens",
                "token/refresh",
                new {controller = "testing", action = "RefreshAPiContextHeaders"});




            routes.MapHttpRoute(
                "AjaxCreateAccount",
                "user/create",
                new {controller = "Auth", action = "AjaxCreateAccount"},
                new {acceptConstraint = new AcceptConstraint("text/html", false)});


            routes.MapHttpRoute(
                "CreateAccount",
                "user/create",
                new {controller = "Auth", action = "CreateAccount"},
                new {acceptConstraint = new AcceptConstraint("text/html", true)});


            routes.MapHttpRoute(
                "AjaxResetPassword",
                "user/resetpassword",
                new {controller = "Auth", action = "AjaxResetPassword"},
                new {acceptConstraint = new AcceptConstraint("text/html", false)});


            

            



            routes.MapHttpRoute(
               "beep boop",
               "robots.txt",
               new { controller = "Home", action = "RobotsTxt" });


            routes.MapHttpRoute(
               "gaverify",
               "google{hash}.html",
               new { controller = "Home", action = "GoogleSiteVerification" });


            routes.MapHttpRoute(
                "order details (back office)",
                "back-office/orders/{orderId}",
                new { controller = "BackOffice", action = "OrderSummary" });

            routes.MapHttpRoute(
                "packing slip (back office)",
                "back-office/orders/{orderId}/packages/{packageId}",
                new { controller = "BackOffice", action = "PackingSlip" });

            routes.MapHttpRoute(
                "back office (admin view) - PREVIEW",
                "back-office-preview/{templateid}",
                new { controller = "BackOffice", action = "Preview" });


            /*********************************************************************
             * 
             *          Single name routes go above here.
             * 
             * 
             * 
             * 
             * 
             *****************************************************************/


            routes.MapHttpRoute(
               "StoreFront_pages_seo",
               "{name}",
               new { controller = "cmspages", action = "Page", list = "pages@mozu" });



            routes.MapHttpRoute(
                "StoreFront_home_pages",
                "pages",
                new { controller = "Home", action = "Index" });

            routes.MapHttpRoute(
                "apiforwarding",
                "api/{*url}",
                new { controller = "testing", action = "api" });

            

            routes.MapHttpRoute(
                "Error",
                "{*url}",
                new {controller = "Home", action = "NotFound"}
                );
        }

        private class AcceptConstraint : IHttpRouteConstraint
        {
            private readonly bool _match;


            private readonly MediaTypeWithQualityHeaderValue _mediaType;

            public AcceptConstraint(string contentType, bool match = true)
            {
                _match = match;

                _mediaType = new MediaTypeWithQualityHeaderValue(contentType);
            }


            public bool Match(HttpRequestMessage request, IHttpRoute route, string parameterName, IDictionary<string, object> values, HttpRouteDirection routeDirection)
            {
                bool ret = request.Headers.Accept.Contains(_mediaType);
                return (_match == ret);
            }
        }


        private class QuseryStringConstraint : IHttpRouteConstraint
        {
            private readonly string _queryString;


            public QuseryStringConstraint(string queryString)
            {
                _queryString = queryString;
            }


            public bool Match(HttpRequestMessage request, IHttpRoute route, string parameterName, IDictionary<string, object> values, HttpRouteDirection routeDirection)
            {
                if (string.IsNullOrEmpty(request.RequestUri.Query))
                {
                    return false;
                }
                var val = request.GetQueryNameValuePairs().Where(x => string.Equals(x.Key, _queryString, StringComparison.OrdinalIgnoreCase)).Select(x => x.Value).FirstOrDefault();
                if (string.IsNullOrEmpty(val))
                {
                    return false;
                }
                values[parameterName] = val;

                return true;
            }
        }
    }
}