using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using System.Web.Http.Hosting;
using System.Web.Http.Routing;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.SEO.Mappings;
using Mozu.SiteSettings.General.Contracts.General.Routing;

namespace Mozu.SiteBuilder.UX.Configuration
{

   
    public class RouteConfig : IRouteConfig
    {

        static System.Web.Http.HttpRouteCollection _systemRoutes;
        static System.Web.Http.HttpRouteCollection _standarRoutes;
        public  HttpRouteCollection SystemRoutes
        {
            get
            {
                if (_systemRoutes == null)
                {
                    _systemRoutes = GetSystemRoutes();
                }
                return _systemRoutes;
            }
        }

        public  HttpRouteCollection DefaultRoutes
        {
            get
            {
                if (_standarRoutes == null)
                {
                    _standarRoutes = GetStandardRoutes();
                }
                return _standarRoutes;
            }
        }

        public void Register(System.Web.Http.HttpRouteCollection routes)
        {
            GetSystemRoutes(routes);
        }
        public static HttpRouteCollection GetSystemRoutes(System.Web.Http.HttpRouteCollection routes = null)
        {
            routes = routes??new System.Web.Http.HttpRouteCollection();
            routes.MapHttpRoute(
             "favicon",
             "favicon.ico",
                    new { controller = "Resource", action = "misc", pathinfo = "images/favicon.ico" });

            

            routes.MapHttpRoute(
               "Misc_content_3",
               "cms/files/{documentId}",
               new { action = "index", controller = "content", list = "files@mozu" }
               );



            routes.MapHttpRoute(
                "hyprlivecontext",
                "hyprlivecontext",
                new { controller = "Resource", action = "hyprcontextaction" });

            routes.MapHttpRoute(
                "storefront_navigation",
                "nav",
                new { controller = "Resource", action = "AjaxNavigation" });

            routes.MapHttpRoute(
                "Visit_Tracking_Pixel",
                "_mzblank.gif",
                new { controller = "Visit", action = "TrackingPixel" });

            routes.MapHttpRoute(
                "scripts",
                "scripts/{*pathInfo}",
                new { controller = "Resource", action = "Scripts" });


            routes.MapHttpRoute(
                "compiledscripts",
                "compiled/scripts/{*pathInfo}",
                new { controller = "Resource", action = "CompiledScripts" });

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
                "mozu_receiver",
                "receiver",
                new { controller = "Resource", action = "MozuReceiver" });


            routes.MapHttpRoute(
              "Widgets",
              "widgets/{action}",
              new { controller = "Widgets", action = "Index" });

            routes.MapHttpRoute(
                "templates",
                "templates/{templateId}",
                new { controller = "Templates", action = "Index" });

            routes.MapHttpRoute(
                "resources",
                "resources/{*pathinfo}",
                new { controller = "Resource", action = "Misc" });
            routes.MapHttpRoute(
                "resources-Site-Thumbnail",
                "SiteThumbnail",
                new { controller = "Resource", action = "SiteThumbnail" });

            routes.MapHttpRoute(
                "auth/pants",
                "auth/pants",
                new { controller = "Pants", action = "pants" });

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

            routes.MapHttpRoute(
              "Static_Content",
              "staticContent/{*relativePath}",
              new { controller = "Resource", action = "StaticContentShare" });


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


            routes.MapHttpRoute(
              "Storefront_User_ResetPAssword",
              "user/resetpasswordconfirm",
              new { controller = "Auth", action = "ResetPassword" });

            routes.MapHttpRoute(
                "Storefront_MyAccount2",
                "myaccount",
                new { controller = "MyAccount", action = "Index" });


            routes.MapHttpRoute(
                "StoreFront_ajax_Configure",
                "product/configure",
                new { controller = "Catalog", action = "Configure" });

            routes.MapHttpRoute(
               "StoreFront_feeds_categories",
               "feeds/category/{categoryId}",
               new { controller = "Catalog", action = "CategoryFeed" });

            routes.MapHttpRoute(
               "StoreFront_checkout",
               "checkout/{orderId}/{action}",
               new { controller = "Checkout", action = "Index", orderId = RouteParameter.Optional });

            


            routes.MapHttpRoute(
                "Logout",
                "logout",
                new { controller = "Auth", action = "LogOut" },
                new { acceptConstraint = new AcceptConstraint("application/json", false) });

            routes.MapHttpRoute(
                "AJAX Login",
                "user/login",
                new { controller = "Auth", action = "AjaxLogin" },
                new { acceptConstraint = new AcceptConstraint("application/json", true) });

            routes.MapHttpRoute(
                "Login",
                "user/login",
                new { controller = "Auth", action = "Login" },
                new { acceptConstraint = new AcceptConstraint("application/json", false) });

            routes.MapHttpRoute(
                "Order Status Login",
                "user/anonymous-login",
                new { controller = "Auth", action = "AnonymousOrderLogin" },
                new { acceptConstraint = new AcceptConstraint("application/json", true) });

            routes.MapHttpRoute(
                "Anonymous Order Status",
                "my-anonymous-account",
                new { controller = "MyAnonymousAccount", action = "Index" });

            routes.MapHttpRoute(
                "refresh tokens",
                "token/refresh",
                new { controller = "testing", action = "RefreshAPiContextHeaders" });

            routes.MapHttpRoute(
                "AjaxCreateAccount",
                "user/create",
                new { controller = "Auth", action = "AjaxCreateAccount" },
                new { acceptConstraint = new AcceptConstraint("application/json", true) });

            routes.MapHttpRoute(
                "CreateAccount",
                "user/create",
                new { controller = "Auth", action = "CreateAccount" },
                new { acceptConstraint = new AcceptConstraint("application/json", false) });

            routes.MapHttpRoute(
                "Sign Up",
                "user/signup",
                new { controller = "Auth", action = "CreateAccount" },
                new { acceptConstraint = new AcceptConstraint("application/json", false) });

            routes.MapHttpRoute(
                "AjaxResetPassword",
                "user/resetpassword",
                new { controller = "Auth", action = "AjaxResetPassword" },
                new { acceptConstraint = new AcceptConstraint("application/json", true) });

            routes.MapHttpRoute(
               "AjaxForgotPassword",
               "user/forgotpassword",
               new { controller = "Auth", action = "AjaxForgotPassword" },
               new { acceptConstraint = new AcceptConstraint("application/json", false) });



            routes.MapHttpRoute(
               "beep boop",
               "robots.txt",
               new { controller = "Home", action = "RobotsTxt" });



            //old tbd remove
            routes.MapHttpRoute(
                "Misc_content",
                "files/{tenant}/{mastercat}/{documentId}",
                new { action = "index", controller = "content", list = "files@mozu" }
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
            

          
            routes.MapHttpRoute(
                "DevDocs",
                "devdocs/{action}/{id}",
                new
                {
                    action = "Index",
                    id = RouteParameter.Optional,
                    controller = "DeveloperDocumentation"
                }
                );



            routes.Add("SiteRoutes", new NonSystemRoute());

            return routes;
        }
      
        public static HttpRouteCollection GetStandardRoutes()
        {
            System.Web.Http.HttpRouteCollection routes = new System.Web.Http.HttpRouteCollection();

            routes.MapCustomHttpRoute(
                "StoreFront_productDetails_SEO",
                "{productSlug}/p/{productCode}",
                 null,
              null,
              null,
              FancyRoute.ProductDetails,
              true,
              CustomRoute.Scheme.Http);


    
            routes.MapCustomHttpRoute(
                "search",
                "search",
                null,
                null,
                null,
                FancyRoute.Search,
                true,
                CustomRoute.Scheme.Http);

            routes.MapCustomHttpRoute(
                           "StoreFront_cart",
                           "cart",
                           null,
                           null,
                           null,
                           FancyRoute.Cart,
                           true,
                           CustomRoute.Scheme.Https);

            routes.MapHttpRoute(
                "StoreFront_cart_checkout",
                "cart/checkout",
                new { controller = "Cart", action = "Checkout" });

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
               "pages/{documentName}",
               new { controller = "cmspages", action = "Page", documentListName = "pages@mozu" });


          

            

            routes.MapHttpRoute(
               "cms_page",
               "cms/{documentListName}/{documentName}",
               new { controller = "cmspages", action = "Page" });

            routes.MapHttpRoute(
               "StoreFront_pages_list",
               "cms/{documentListName}",
               new { controller = "cmspages", action = "contentIndex" });

            routes.MapCustomHttpRoute(
                "StoreFront_categories_SEO",
                "{categorySlug}/c/{categoryId}",
                null,
                null,
                null,
                FancyRoute.Category,
                true,
                CustomRoute.Scheme.Http);




            routes.MapCustomHttpRoute(
                "StoreFront_categories_short",
                "c/{categoryId}",
                 null,
                null,
                null,
                FancyRoute.Category,
                false,
                CustomRoute.Scheme.Http);



          


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
                "StoreFront_rss",
                "blogs/rss",
                new {controller = "Blogs", action = "Rss"});

            routes.MapHttpRoute(
                "StoreFront_blogs",
                "blogs/{post}",
                new {controller = "Blogs", action = "Post"});

            

            

            


            

           
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



          





            


            //routes.MapHttpRoute("resources",
            //   "resources/{action}/{*pathInfo}",
            //   new { controller = "Resource", Action = "script", pathInfo = UrlParameter.Optional });





            


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
               "{documentName}",
               new { controller = "cmspages", action = "Page", documentListName = "pages@mozu" });



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
            return routes;
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
        public void RouteIncomingSystemRouteRequest(HttpRequestMessage request)
        {
            DoReRoute(request, SystemRoutes);
        }

        public void RouteIncomingDefaultRouteRequest(HttpRequestMessage request)
        {
            DoReRoute(request, DefaultRoutes);
            
        }

        void DoReRoute(HttpRequestMessage request , HttpRouteCollection routeCollection )
        {
            var rerouteData = routeCollection.GetRouteData(request);
            if (rerouteData != null)
            {
                request.Properties[HttpPropertyKeys.HttpRouteDataKey] = rerouteData;

                if (rerouteData.Route is CustomRoute)
                {
                    var cr = rerouteData.Route as CustomRoute;

                    cr.RewriteRouteData(request, rerouteData.Values);
                }

                var rctx = request.GetRequestContext();
                rctx.RouteData = rerouteData;
            }
        }
    }
}