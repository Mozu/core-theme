using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Hosting;
using System.Web.Http.Routing;
using System.Web.Http.WebHost;
using System.Web.Routing;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using System.Linq;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UX.Configuration
{
    public class RouteConfig
    {
    


        public void Register(HttpRouteCollection routes)
        {
            routes.MapHttpRoute(
                "seoRedirect",
                "{*url}",
                new { controller = "Home", action = "SeoProcessor" },
                null,
                new SeoMessageHandler()
                );

        

            routes.MapHttpRoute(
                "Storefront_MyAccount2",
                "myaccount",
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
               "hyprlivecontext",
               "hyprlivecontext",
               new { controller = "Resource", action = "hyprcontextaction" });

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
                "resources-Site-Thumbnail",
                "SiteThumbnail",
                new { controller = "Resource", action = "SiteThumbnail" });
            
            routes.MapHttpRoute(
                "StoreFront_Prefixed_default",
                "storefront/{controller}/{action}",
                new { action = "Index" },
                new {controller = @"catalog|pages|email|cart|auth|checkout|cmspages|myaccount|localization|sitemap|template|widget"}
                );
            //removing default... add a matching route above
            routes.MapHttpRoute(
                "StoreFront_default",
                "{controller}/{action}/{id}",
                new { action = "Index", id = "1" },
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


            //todo remove before launch
            routes.MapHttpRoute(
               "widgettest",
               "widgettest",
               new { action = "widgettest", controller = "Testing" }
           );


            //routes.MapHttpRoute("resources",
            //   "resources/{action}/{*pathInfo}",
            //   new { controller = "Resource", Action = "script", pathInfo = UrlParameter.Optional });






                routes.MapHttpRoute(
                "Logout",
                "logout",
                new { controller = "Auth", action = "LogOut" },
                new { acceptConstraint = new AcceptConstraint("text/html", true) });


var r1=            routes.MapHttpRoute(
                "AJAX Login",
                "user/login",
                new { controller = "Auth", action = "AjaxLogin" },
                new { acceptConstraint = new AcceptConstraint("text/html", false) });


            var r2 = routes.MapHttpRoute(
                "Login",
                "user/login",
                new {controller = "Auth", action = "Login"},
                new { acceptConstraint = new AcceptConstraint("text/html", true) });

            routes.MapHttpRoute(
                "Reset Password",
                "resetpassword",
                new { controller = "Auth", action = "ResetPassword" });

            routes.MapHttpRoute(
                "Error",
                "{*url}",
                new {controller = "Home", action = "NotFound"}
                );

      
        }
        private class SeoMessageHandler: HttpMessageHandler
        {
            Lazy<HttpRouteCollection> _routeCollection = new Lazy<HttpRouteCollection>(() =>
                {

                    var collection = new HttpRouteCollection();
                    var routes = System.Web.Http.GlobalConfiguration.Configuration.Routes;
                    foreach (var route in routes)
                    {

                        if (!(route.Handler is SeoMessageHandler))
                        {
                            collection.Add(Guid.NewGuid().ToString(), route);
                        }


                    }
                    return collection;

            });
            Lazy<HttpMessageInvoker> _defaultInvoker = new Lazy<HttpMessageInvoker>(() =>
                {
                    return new HttpMessageInvoker(System.Web.Http.GlobalConfiguration.DefaultHandler);
                });


            private static void RemoveOptionalRoutingParameters(IDictionary<string, object> routeValueDictionary)
            {
                int count = routeValueDictionary.Count;
                int index = 0;
                string[] strArray = new string[count];
                foreach (KeyValuePair<string, object> pair in routeValueDictionary)
                {
                    if (pair.Value == RouteParameter.Optional)
                    {
                        strArray[index] = pair.Key;
                        index++;
                    }
                }
                for (int i = 0; i < index; i++)
                {
                    string key = strArray[i];
                    routeValueDictionary.Remove(key);
                }
            }

 


            protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            {
                var redirRepo = request.Resolve<IRedirectRepository>();
                
                var task = redirRepo.FetchRedirectEntries().ContinueWith(_ =>
                {
                    var redirects = _.Result;
                    var stem = request.RequestUri.AbsolutePath;
                    var redir = redirects.FirstOrDefault(x => string.Equals(stem, x.Source, StringComparison.OrdinalIgnoreCase));

                    IHttpRouteData routeData = null;
                    if (redir != null)
                    {
                        if (redir.IsRewrite.GetValueOrDefault(false))
                        {
                            var url = "~" + redir.Destination;

                            var ub = new UriBuilder();
                            ub.Host = "localhost";
                            ub.Path = url;


                            #region magicstrings

                            var req = new HttpRequestMessage(HttpMethod.Get, ub.Uri);
                            //magic strings taken from decompiled source :(
                            var httpContextBase = (HttpContextBase) request.Properties["MS_HttpContext"];
                            var myHttpContext = new MyHttpContextBase(httpContextBase, url);

                            req.Properties["MS_HttpContext"] = myHttpContext;
                            myHttpContext.Items["MS_HttpRequestMessage"] = req;

                            #endregion

                            routeData = _routeCollection.Value.GetRouteData(req);
                        }
                        else
                        {
                            var resp= request.CreateResponse(HttpStatusCode.MovedPermanently);
                            resp.Headers.Location = new Uri(redir.Destination, UriKind.RelativeOrAbsolute);
                            var tcs = new TaskCompletionSource<HttpResponseMessage>();
                            tcs.SetResult(resp);
                            return tcs.Task;
                        }
                    }
                    if (routeData == null)
                    {
                        routeData = this._routeCollection.Value.GetRouteData(request);
                    }

                    RemoveOptionalRoutingParameters(routeData.Values);
                    request.Properties[HttpPropertyKeys.HttpRouteDataKey] = routeData;

                    HttpMessageInvoker invoker = (routeData.Route.Handler == null) ? _defaultInvoker.Value : new HttpMessageInvoker(routeData.Route.Handler, false);
                    return invoker.SendAsync(request, cancellationToken);

                });
                return task.Unwrap();
            }

            class MyHttpContextBase : HttpContextBase
            {
                private HttpContextBase httpContext;
                private System.Collections.IDictionary _items;
                public override System.Collections.IDictionary Items
                {
                    get { return _items; }
                }
                public MyHttpContextBase(HttpContextBase httpContext, string pathInfo)
                {
                    // TODO: Complete member initialization
                    _items = new System.Collections.Hashtable();
                    this.httpContext = httpContext;
                    MyRequest = new MyHttpRequestBase(this.httpContext.Request, pathInfo);
                }
                public override HttpRequestBase Request
                {
                    get { return MyRequest; }
                }

                HttpRequestBase MyRequest { get; set; }
            }
            class MyHttpRequestBase : HttpRequestBase
            {
                private HttpRequestBase _httpRequestBase;
                private readonly string _appRelativeCurrentExecutionFilePath;

                public MyHttpRequestBase(HttpRequestBase httpRequestBase, string appRelativeCurrentExecutionFilePath)
                {
                    // TODO: Complete member initialization
                    this._httpRequestBase = httpRequestBase;
                    _appRelativeCurrentExecutionFilePath = appRelativeCurrentExecutionFilePath;
                }

                public override string AppRelativeCurrentExecutionFilePath
                {
                    get
                    {
                        return _appRelativeCurrentExecutionFilePath;
                    }
                }
                public override string PathInfo
                {
                    get { return ""; }
                }

            }

        }
        private class SeoConstraint : IHttpRouteConstraint
        {
            private readonly bool _forRedirect;

            public SeoConstraint(bool forRedirect)
            {
                _forRedirect = forRedirect;
            }

            public bool Match(System.Net.Http.HttpRequestMessage request, IHttpRoute route, string parameterName, System.Collections.Generic.IDictionary<string, object> values, HttpRouteDirection routeDirection)
            {
                return request.RequestUri.PathAndQuery.IndexOf("redir=") > -1;
            }
        }

        class AcceptConstraint : IHttpRouteConstraint 
        {
            private readonly bool _match;
           

            private MediaTypeWithQualityHeaderValue _mediaType ;
            public AcceptConstraint(string contentType, bool match = true)
            {
                _match = match;

                _mediaType = new MediaTypeWithQualityHeaderValue(contentType);
            }


            public bool Match(System.Net.Http.HttpRequestMessage request, IHttpRoute route, string parameterName, System.Collections.Generic.IDictionary<string, object> values, HttpRouteDirection routeDirection)
            {
                var ret = request.Headers.Accept.Contains(_mediaType);
                return (_match == ret);
                
                
            }
        }
    }
}