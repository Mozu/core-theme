using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Options;
using Mozu.Core.Configuration;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.SEO.Mappings;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using Mozu.SiteBuilder.Mvc.SEO.Constraints;
using IInlineConstraintResolver = Microsoft.AspNetCore.Routing.IInlineConstraintResolver;
using System.Threading.Tasks;


namespace Mozu.SiteBuilder.UX.Configuration
{
    public class RouteConfig : IRouteConfig
    {
        private static IRouter _defaultHandler;
        private static IInlineConstraintResolver _constraintResolver;

        //private static IList<IRouter> _systemRoutes;
        private static RouteCollection _standardRoutes;

        //public IList<IRouter> SystemRoutes => _systemRoutes ??= GetSystemRoutes();
        public RouteCollection DefaultRoutes => _standardRoutes ??= GetStandardRoutes();

        public IRouter DefaultHandler { get { return _defaultRrouter;} }
        static IRouter _defaultRrouter;

        public static void Register(IRouteBuilder builder)
        {
            GetSystemRoutes(builder);
            var r = GetStandardRoutes();
            for (var i=0;i< r.Count;i++)
            {
                builder.Routes.Add(r[i]);
            }
            _defaultRrouter = builder.DefaultHandler;
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

            //Used to get files (images, etc) from the content repository
            routes.MapRoute(_defaultHandler,
               "Misc_content_3",
               "cms/files/{*documentId}", //may be the documentId or a path and filename
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
                "Set Tenant Context",
                "_gotenant/{tenantId}",
                new { action = "GoTenant", controller = "Testing" },
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

           

            //start bo

            routes.MapRoute(_defaultHandler,
               "order details (back office)",
                "back-office/orders/{orderId}",
                new { controller = "BackOffice", action = "OrderSummary" },
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
               "packing slip (back office)",
                "back-office/orders/{orderId}/shipments/{shipmentNumber}",
                new { controller = "BackOffice", action = "PackingSlip" },
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
               "transfer packing slip (back office)",
                "back-office/orders/{orderId}/transfers/{shipmentNumber}",
                new { controller = "BackOffice", action = "TransferPackingSlip" },
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
               "pick wave (back office)",
                "back-office/pick-wave/{pickWaveNumber}/{printPickWave}/{printPackingLists}/{printSingleOrderSheets}",
                new { controller = "BackOffice", action = "PickWave" },
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
              "order pick sheets (back office)",
               "back-office/order-pick-sheets/{pickWaveNumber}",
               new { controller = "BackOffice", action = "OrderPickSheets" },
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "Return Receipt (back office)",
                "back-office/return-receipt/{orderId}/{returnId}",
                new { controller = "BackOffice", action = "ReturnReceipt" },
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "Print Quote (back office)",
                "back-office/quote/{quoteId}/print",
                new { controller = "BackOffice", action = "PrintQuoteSummary" },
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                 "Print Gift Receipt",
                 "back-office/gift-receipt/shipments/{shipmentNumber}",
                 new { controller = "BackOffice", action = "PrintGiftReceipt" },
                 _constraintResolver);

            routes.MapRoute(_defaultHandler,
               "back office (admin view) - PREVIEW",
                "back-office-preview/{templateid}",
                new { controller = "BackOffice", action = "Preview" },
                _constraintResolver);




            //end bo

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
              "Storefront_SellerAccount",
              "selleraccount",
              new { controller = "SellerAccount", action = "Index" },
              _constraintResolver);

            routes.MapRoute(_defaultHandler,
             "Storefront_B2BAccount",
             "b2baccount/{accountId}",
             new { controller = "B2BAccount", action = "GetB2BAccount", accountId = "" },
             _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "B2B Account Request",
                "b2baccount/b2b-account-request",
                new { controller = "B2BAccount", action = "B2BAccountRequest" },
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
               "checkout/{orderId?}/{action}",
               new { controller = "Checkout", action = "Index" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
               "StoreFront_checkoutv2",
               "checkoutv2/{checkoutId?}/{action}",
               new { controller = "CheckoutV2", action = "Index" },
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
                "Anonymous Curbside View",
                "anonymous-notification/curbsideArrive/{shipmentNumber}/{orderId}",
                new { controller = "AnonymousNotification", action = "RenderCurbsideArriveView" },
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "Anonymous Curbside Shipment Ready View",
                "anonymous-notification/curbsideShipmentReady/{shipmentNumber}/{orderId}",
                new { controller = "AnonymousNotification", action = "CurbSideShipmentReadyView" },
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
               "Anonymous Shipment Pickup Ready View",
               "anonymous-notification/ShipmentPickupReady/{shipmentNumber}/{orderId}",
               new { controller = "AnonymousNotification", action = "ShipmentPickupReady" },
               _constraintResolver);

            routes.MapRoute(_defaultHandler,
              "Anonymous Customer At Store View",
              "anonymous-notification/CustomerAtStore/{shipmentNumber}/{orderId}",
              new { controller = "AnonymousNotification", action = "CustomerAtStore" },
              _constraintResolver);


            routes.MapRoute(_defaultHandler,
                "Anonymous Shipment View",
                "anonymous-notification/shipment/{shipmentNumber}/{orderId}",
                new { controller = "AnonymousNotification", action = "RenderShipmentView" },
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "Anonymous CurbsideInfo View",
                "anonymous-notification/curbsideInfo/{shipmentNumber}/{orderId}",
                new { controller = "AnonymousNotification", action = "GetCurbsideInfo" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
                "Anonymous Curbside Survey View",
                "anonymous-notification/curbsidesurvey/{shipmentNumber}/{orderId}",
                new { controller = "AnonymousNotification", action = "GetCurbsideSurvey" },
                _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "Anonymous Save Curbside Info",
                "user/save-curbside-info",
                new { controller = "AnonymousNotification", action = "SaveCurbsideInfo" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
              "Anonymous Save Curbside Survey",
              "user/save-curbside-survey",
              new { controller = "AnonymousNotification", action = "SaveCurbsideSurvey" },
              _constraintResolver);

            routes.MapRoute(_defaultHandler,
              "Cart",
              "user/cart-details",
              new { controller = "Cart", action = "GetCart" },
              _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "Anonymous I am on My Way Endpoint",
                "anonymous-notification/customerintransit/{shipmentNumber}/{orderId}",
                new { controller = "AnonymousNotification", action = "CustomerInTransit" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
                "Curbside Partial Pickup Ready Endpoint",
                "anonymous-notification/partialCurbsideReady/{shipmentNumber}/{orderId}",
                new { controller = "AnonymousNotification", action = "PartialCurbsideReadyView" },
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
                "devdocs/{action}/{id?}",
                new { action = "Index", controller = "DeveloperDocumentation" },
				_constraintResolver);

            routes.MapRoute(_defaultHandler,
                "StoreFront_Sitemap",
                "sitemap.xml/{action}/{page?}",
                new { controller = "Sitemap", action = "Index" },
				_constraintResolver);

            routes.Add(new NonSystemRoute(_defaultHandler, _constraintResolver));

            return routes;
        }
      
        public static RouteCollection GetStandardRoutes()
        {
            var routes = new RouteCollection();

            _defaultHandler ??= new RouteHandler(_ => throw new NotImplementedException());
            _constraintResolver ??= new DefaultInlineConstraintResolver(new OptionsWrapper<RouteOptions>(new RouteOptions()), new ServiceContainer());

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
                "location/{action}/{id?}",
                new { controller = "Location", action = "Index" },
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

            // routes.MapRoute(_defaultHandler,
            //     "vlegacy_product",
            //     "{slug}-p/{productCode}.htm",
            //      new { controller = "Catalog", action = "ProductDetail" },
            //     _constraintResolver);
            //
            // routes.MapRoute(_defaultHandler,
            //    "vlegacy_product_asp",
            //    "ProductDetails.asp",
            //     new { controller = "Catalog", action = "ProductDetail" },
            //    _constraintResolver);
            //
            // routes.MapRoute(_defaultHandler,
            //     "vlegacy_category",
            //     "{slug}-s/{categoryId}.htm",
            //      new { controller = "Catalog", action = "Category" }, 
            //     _constraintResolver);

            routes.MapRoute(_defaultHandler,
                "StoreFront_Prefixed_default",
                "storefront/{controller}/{action}",
                new {action = "Index"},
                new Dictionary<string, object>{{"controller", @"catalog|pages|email|cart|auth|checkout|cmspages|myaccount|localization|sitemap|template|widget|testing|health|mobileNotification"}}, 
                _constraintResolver);
            //removing default... add a matching route above
            routes.MapRoute(_defaultHandler,
                "StoreFront_default",
                "{controller}/{action}/{id?}",
                new { action = "Index" },
                new Dictionary<string, object>{{"controller", @"catalog|pages|email|cart|auth|checkout|cmspages|myaccount|localization|sitemap|template|widget|testing|mobileNotification"}}, 
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

        // public void RouteIncomingDefaultRouteRequest(RouteContext context)
        // {
        //     DoReRoute(context, DefaultRoutes);
        // }

        public Task RouteAsync(RouteContext context)
        {
            return DefaultRoutes.RouteAsync(context);
        }

        // private static void DoReRoute(RouteContext context, RouteCollection routeCollection )
        // {
        //     if (!routeCollection.TryMatchRoute(context.HttpContext, out var routeData)) return;
        //     
        //     //context.Items[HttpPropertyKeys.HttpRouteDataKey] = 
        //
        //     if (routeData.Routers.Last() is CustomRoute cr)
        //     {
        //         cr.RewriteRouteData(context, routeData.Values);
        //     }
        //
        //     context.RouteData = routeData;
        // }
    }
}