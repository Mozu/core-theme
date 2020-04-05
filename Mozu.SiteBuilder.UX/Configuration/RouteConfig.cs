using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using System.Web.Http.Hosting;
using System.Web.Http.Routing;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.AspNetCore.Routing;
using Mozu.Core.Configuration;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.SEO.Mappings;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using Mozu.SiteBuilder.Mvc.SEO.Constraints;
using IInlineConstraintResolver = Microsoft.AspNetCore.Routing.IInlineConstraintResolver;

namespace Mozu.SiteBuilder.UX.Configuration
{
    public class RouteConfig : IRouteConfig
    {
        private static IRouter _defaultHandler;
        private static IInlineConstraintResolver _constraintResolver;

        //private static IList<IRouter> _systemRoutes;
        private static IList<IRouter> _standardRoutes;

        //public IList<IRouter> SystemRoutes => _systemRoutes ??= GetSystemRoutes();
        public IList<IRouter> DefaultRoutes => _standardRoutes ??= GetStandardRoutes();

        public static void Register(IRouteBuilder builder)
        {
            GetSystemRoutes(builder);
        }
        public static IList<IRouter> GetSystemRoutes(IRouteBuilder builder)
        {
            var routes = builder.Routes;

            _defaultHandler ??= builder.DefaultHandler;
            _constraintResolver ??= builder.ServiceProvider.Resolve<IInlineConstraintResolver>();

            routes.MapRoute(_defaultHandler, 
                "favicon", 
                "favicon.ico", 
                new { controller = "Resource", action = "misc", pathinfo = "images/favicon.ico" }, 
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
               "Misc_content_3",
               "cms/files/{documentId}",
               new { action = "index", controller = "content", list = "files@mozu" }, 
               _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "hyprlivecontext",
                "hyprlivecontext",
                new { controller = "Resource", action = "hyprcontextaction" },
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "storefront_navigation",
                "nav",
                new { controller = "Resource", action = "AjaxNavigation" }, 
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "Visit_Tracking_Pixel",
                "_mzblank.gif",
                new { controller = "Visit", action = "TrackingPixel" }, 
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "scripts",
                "scripts/{*pathInfo}",
                new { controller = "Resource", action = "Scripts" }, 
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "compiledscripts",
                "compiled/scripts/{*pathInfo}",
                new { controller = "Resource", action = "CompiledScripts" }, 
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "stylesheets",
                "stylesheets/{*pathInfo}",
                new { controller = "Resource", action = "Stylesheets" }, 
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "livetemplates",
                "livetemplates",
                new { controller = "Resource", action = "LiveTemplates" },
                _constraintResolver);

            routes.MapRoute(_defaultHandler,"builtinscripts",
                "js/{action}-{mode}.js",
                new { controller = "BuiltinScripts", mode = "min" },
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "mozu_receiver",
                "receiver",
                new { controller = "Resource", action = "MozuReceiver" },
                _constraintResolver);
            
            routes.MapRoute(_defaultHandler,
              "Widgets",
              "widgets/{action}",
              new { controller = "Widgets", action = "Index" }, 
              _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "templates",
                "templates/{templateId}",
                new { controller = "Templates", action = "Index" },
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "resources",
                "resources/{*pathinfo}",
                new { controller = "Resource", action = "Misc" },
                _constraintResolver);
            routes.MapRoute(_defaultHandler,
                "resources-Site-Thumbnail",
                "SiteThumbnail",
                new { controller = "Resource", action = "SiteThumbnail" }, 
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "auth/pants",
                "auth/pants",
                new { controller = "Pants", action = "pants" }, 
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "Set Site Context",
                "_gosite/{siteId}",
                new { action = "GoSite", controller = "Testing" },
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "testing controller",
                "testing/{action}",
                  new { controller = "Testing", action = "echo" },
              _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "Set Theme Override",
                "setTheme/{themeType}",
                new { action = "ForceTheme", controller = "Testing" }, 
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
              "Static_Content",
              "staticContent/{*relativePath}",
              new { controller = "Resource", action = "StaticContentShare" }, 
              _constraintResolver);

            routes.MapRoute(_defaultHandler,
               "gaverify",
               "google{hash}.html",
               new { controller = "Home", action = "GoogleSiteVerification" }, 
               _constraintResolver);

            routes.MapRoute(_defaultHandler,
               "mzActions",
               "_mzActions/{action}",
               new { controller = "MiscActions",  }, 
               _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "order details (back office)",
                "back-office/orders/{orderId}",
                new { controller = "BackOffice", action = "OrderSummary" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
                "packing slip (back office)",
                "back-office/orders/{orderId}/packages/{packageId}",
                new { controller = "BackOffice", action = "PackingSlip" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
                "back office (admin view) - PREVIEW",
                "back-office-preview/{templateid}",
                new { controller = "BackOffice", action = "Preview" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
              "Storefront_User_ResetPAssword",
              "user/resetpasswordconfirm",
              new { controller = "Auth", action = "ResetPassword" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
                "Storefront_MyAccount2",
                "myaccount",
                new { controller = "MyAccount", action = "Index" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
                "StoreFront_ajax_Configure",
                "product/configure",
                new { controller = "Catalog", action = "Configure" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
               "StoreFront_feeds_categories",
               "feeds/category/{categoryId}",
               new { controller = "Catalog", action = "CategoryFeed" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
               "StoreFront_checkout",
               "checkout/{orderId}/{action}",
               new { controller = "Checkout", action = "Index", orderId = RouteParameter.Optional },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
               "StoreFront_checkoutv2",
               "checkoutv2/{checkoutId}/{action}",
               new { controller = "CheckoutV2", action = "Index", checkoutId = RouteParameter.Optional },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
               "StoreFront_international_checkout",
               "international-checkout",
               new { controller = "Checkout", action = "InternationalCheckout" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
                "Logout",
                "logout",
                new { controller = "Auth", action = "LogOut" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
                "AJAX Login",
                "user/login",
                new { controller = "Auth", action = "AjaxLogin" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
                "Login",
                "user/login",
                new { controller = "Auth", action = "Login" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
                "Order Status",
                "user/order-status",
                new { controller = "Auth", action = "OrderStatus" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
                "Order Status Login",
                "user/anonymous-login",
                new { controller = "Auth", action = "AnonymousOrderLogin" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
                "Anonymous Order Status",
                "my-anonymous-account",
                new { controller = "MyAnonymousAccount", action = "Index" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
                "refresh tokens",
                "token/refresh",
                new { controller = "testing", action = "RefreshAPiContextHeaders" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
                "AjaxCreateAccount",
                "user/create",
                new { controller = "Auth", action = "AjaxCreateAccount" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
                "CreateAccount",
                "user/create",
                new { controller = "Auth", action = "CreateAccount" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
                "Sign Up",
                "user/signup",
                new { controller = "Auth", action = "CreateAccount" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
                "AjaxResetPassword",
                "user/resetpassword",
                new { controller = "Auth", action = "AjaxResetPassword" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
               "AjaxForgotPassword",
               "user/forgotpassword",
               new { controller = "Auth", action = "AjaxForgotPassword" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
               "beep boop",
               "robots.txt",
               new { controller = "Home", action = "RobotsTxt" },
				_constraintResolver);

            //old tbd remove
            routes.MapRoute(_defaultHandler,
                "Misc_content",
                "files/{tenant}/{mastercat}/{documentId}",
                new { action = "index", controller = "content", list = "files@mozu" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
                "Misc_content_2",
                "cms/{site}/files/{documentId}",
                new { action = "index", controller = "content", list = "files@mozu" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
                "Misc_content_4",
                "{tenant}-{site}/cms/files/{documentId}",
                new { action = "index", controller = "content", list = "files@mozu" },
				_constraintResolver);
          
            routes.MapRoute(_defaultHandler,
                "DevDocs",
                "devdocs/{action}/{id}",
                new { action = "Index", id = RouteParameter.Optional, controller = "DeveloperDocumentation" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
                "StoreFront_Sitemap",
                "sitemap.xml/{action}/{page}",
                new { controller = "Sitemap", action = "Index", page = RouteParameter.Optional },
				_constraintResolver);

            routes.Add(new NonSystemRoute(_defaultHandler, _constraintResolver));

            return routes;
        }
      
        public static IList<IRouter> GetStandardRoutes()
        {
            var routes = new List<IRouter>();

            routes.MapCustomRoute(_defaultHandler,
                "StoreFront_productDetails_SEO",
                "{productSlug}/p/{productCode}",
                null,
                null,
                null,
                FancyRoute.ProductDetails,
                true,
                _constraintResolver);
            
            routes.MapCustomRoute(_defaultHandler,
                "search",
                "search",
                null,
                null,
                null,
                FancyRoute.Search,
                true,
                _constraintResolver);

            routes.MapCustomRoute(_defaultHandler,
                "StoreFront_cart",
                "cart",
                null,
                null,
                null,
                FancyRoute.Cart,
                true,
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "StoreFront_cart_checkout",
                "cart/checkout",
                new { controller = "Cart", action = "Checkout" },
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
               "StoreFront_productDetails",
               "product/{productCode}",
               new { controller = "Catalog", action = "ProductDetail" },
               _constraintResolver);

            routes.MapRoute(_defaultHandler,
               "StoreFront_productDetailsShort",
               "p/{productCode}",
               new { controller = "Catalog", action = "ProductDetail" },
               _constraintResolver);

            routes.MapRoute(_defaultHandler,
               "StoreFront_pages",
               "pages/{documentName}",
               new { controller = "cmspages", action = "Page", documentListName = "pages@mozu" },
               _constraintResolver);

            routes.MapRoute(_defaultHandler,
               "cms_page",
               "cms/{documentListName}/{documentName}",
               new { controller = "cmspages", action = "Page" }, 
               _constraintResolver);

            routes.MapRoute(_defaultHandler,
               "cms_page_variation",
               "cms/{documentListName}/{documentName}/variation/{variationId}",
               new { controller = "cmspages", action = "Page" }, 
               _constraintResolver);

            routes.MapRoute(_defaultHandler,
               "StoreFront_pages_list",
               "cms/{documentListName}",
               new { controller = "cmspages", action = "contentIndex" }, 
               _constraintResolver);

            routes.MapCustomRoute(_defaultHandler,
                "StoreFront_categories_SEO",
                "{categorySlug}/c/{categoryId}",
                null,
                null,
                null,
                FancyRoute.Category,
                true,
                _constraintResolver);

            routes.MapCustomRoute(_defaultHandler,
                "StoreFront_categories_short",
                "c/{categoryId}",
                 null,
                null,
                null,
                FancyRoute.Category,
                false,
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "Storefront_location",
                "location/{action}/{id}",
                new { controller = "Location", action = "Index", id = RouteParameter.Optional },
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "StoreFront_home",
                "",
                new {controller = "Home", action = "Index"},
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "StoreFront_404",
                "404",
                new {controller = "Home", action = "NotFound",},
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "StoreFront_rss",
                "blogs/rss",
                new {controller = "Blogs", action = "Rss"}, 
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "StoreFront_blogs",
                "blogs/{post}",
                new {controller = "Blogs", action = "Post"},
                _constraintResolver);
           
            routes.MapRoute(_defaultHandler,
                "StoreFront_Store",
                "store",
                new {controller = "Catalog", action = "Store"},
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "StoreFront_Localization",
                "localization/{colKey}/{key}",
                new {controller = "Localization", action = "Index"}, 
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "StoreFront_LocCollection",
                "localization/collections/{keys}",
                new {controller = "Localization", action = "collections"}, 
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "vlegacy_product",
                "{slug}-p/{productCode}.htm",
                 new { controller = "Catalog", action = "ProductDetail" },
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
               "vlegacy_product_asp",
               "ProductDetails.asp",
                new { controller = "Catalog", action = "ProductDetail" },
               _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "vlegacy_category",
                "{slug}-s/{categoryId}.htm",
                 new { controller = "Catalog", action = "Category" }, 
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "StoreFront_Prefixed_default",
                "storefront/{controller}/{action}",
                new {action = "Index"},
                new Dictionary<string, object>{{"controller", @"catalog|pages|email|cart|auth|checkout|cmspages|myaccount|localization|sitemap|template|widget|testing|health"}}, 
                _constraintResolver);
            //removing default... add a matching route above
            routes.MapRoute(_defaultHandler,
                "StoreFront_default",
                "{controller}/{action}/{id}",
                new { action = "Index", id = RouteParameter.Optional },
                new Dictionary<string, object>{{"controller", @"catalog|pages|email|cart|auth|checkout|cmspages|myaccount|localization|sitemap|template|widget|testing"}}, 
                _constraintResolver);

            //routes.MapRoute(_defaultHandler,"resources",
            //   "resources/{action}/{*pathInfo}",
            //   new { controller = "Resource", Action = "script", pathInfo = UrlParameter.Optional }, _constraintResolver);

            /*********************************************************************
             * 
             *          Single name routes go above here.
             * 
             *****************************************************************/

            routes.MapCustomRoute(_defaultHandler,
                "StoreFront_pages_seo",
                 "{documentName}",
                 new { controller = "cmspages", action = "Page", documentListName = "pages@mozu" },
                 new Dictionary<ICustomRouteConstraint, string[]> { { new RegexRouteConstraint("[^=\\?]+"), new string[] { "documentName" } } },
                 null,
                 FancyRoute.CmsPage,
                true, 
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "StoreFront_home_pages",
                "pages",
                new { controller = "Home", action = "Index" },
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "apiforwarding",
                "api/{*url}",
                new { controller = "testing", action = "api" },
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "Error",
                "{*url}",
                new {controller = "Home", action = "NotFound"},
                _constraintResolver);

            return routes;
        }

        //public void RouteIncomingSystemRouteRequest(RouteContext context)
        //{
        //    DoReRoute(context, SystemRoutes);
        //}

        public void RouteIncomingDefaultRouteRequest(RouteContext context)
        {
            DoReRoute(context, DefaultRoutes);
        }

        private static void DoReRoute(RouteContext context, IList<IRouter> routeCollection )
        {
            if (!routeCollection.TryMatchRoute(context.HttpContext, out var routeData)) return;
            
            //context.Items[HttpPropertyKeys.HttpRouteDataKey] = 

            if (routeData.Routers.Last() is CustomRoute cr)
            {
                cr.RewriteRouteData(context.HttpContext, routeData.Values);
            }

            context.RouteData = routeData;
        }
    }
}