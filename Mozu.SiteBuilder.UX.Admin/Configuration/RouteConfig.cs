using System;
using System.Linq;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Routing;
using System.Web.Routing;
using Mozu.SiteBuilder.Mvc.ActionResults;
using HttpMethodConstraint = System.Web.Routing.HttpMethodConstraint;


namespace Mozu.SiteBuilder.UX.Admin.Configuration
{
    public class RouteConfig
    {



        public void Register(HttpRouteCollection routes)
        {
            routes.MapHttpRoute("img", "img/{collection}/{documentId}",
                                new {action = "Index", controller = "img"});

            routes.MapHttpRoute("adminTest", "test/{action}",
                                new {action = "Index", controller = "test"});

            routes.MapHttpRoute("download", "download/{collection}/{documentId}",
                                new {action = "Download", controller = "img"});


            routes.MapHttpRoute("authticket", "auth/ticket",
                                new {action = "LoginTicket", controller = "auth"});

            routes.MapHttpRoute("auth", "auth/{action}",
                                new {action = "Index", controller = "auth"});

            routes.MapHttpRoute("authpants", "auth/pants",
                                new {action = "Index", controller = "auth"});

            routes.MapHttpRoute("login", "auth",
                                new {action = "Index", controller = "auth"});

            routes.MapHttpRoute("order details", "s-{siteId}/orderdetails/{orderId}",
                                new {action = "Deets", controller = "OrderDetails"});

            routes.Add("scripts/{*.pathInfo}", new IgnoreRoute("scripts/{*.pathInfo}"));
            routes.Add("{file}.txt", new IgnoreRoute("{file}.txt"));
            routes.Add("{file}.htm", new IgnoreRoute("{file}.htm"));
            routes.Add("favicon.ico", new IgnoreRoute("favicon.ico"));
            routes.Add("{resource}.axd/{*pathInfo}", new IgnoreRoute("{resource}.axd/{*pathInfo}"));
            routes.Add("script/{*pathInfo}", new IgnoreRoute("script/{*pathInfo}"));
        
            routes.MapHttpRoute("RIA", "{*url}",
                                new {action = "Index", controller = "home"},
                                new
                                {
                                    httpMethod = new HttpMethodConstraint(HttpMethod.Get.ToString()),
                                    accpts = new AcceptsConstraint("text/html")
                                });



            // ,
            //  new {url = @"^((?!api|\.).)*$", httpMethod = new HttpMethodConstraint(HttpMethod.Get.ToString())});



        }
        class AcceptsConstraint : IRouteConstraint
        {
            private readonly string _filter;

            public AcceptsConstraint(string filter)
            {
                _filter = filter;
            }

            public bool Match(System.Web.HttpContextBase httpContext, Route route, string parameterName, RouteValueDictionary values, RouteDirection routeDirection)
            {
                return Enumerable.Any((httpContext.Request.AcceptTypes ?? new string[0]), x => x.IndexOf(_filter, StringComparison.OrdinalIgnoreCase) != -1);
            }
        }
        class MyRoute  : IHttpRoute
        {

            public System.Collections.Generic.IDictionary<string, object> Constraints
            {
                get { throw new System.NotImplementedException(); }
            }

            public System.Collections.Generic.IDictionary<string, object> DataTokens
            {
                get { throw new System.NotImplementedException(); }
            }

            public System.Collections.Generic.IDictionary<string, object> Defaults
            {
                get { throw new System.NotImplementedException(); }
            }

            public IHttpRouteData GetRouteData(string virtualPathRoot, HttpRequestMessage request)
            {
                throw new System.NotImplementedException();
            }

            public IHttpVirtualPathData GetVirtualPath(HttpRequestMessage request, System.Collections.Generic.IDictionary<string, object> values)
            {
                throw new System.NotImplementedException();
            }

            public HttpMessageHandler Handler
            {
                get { throw new System.NotImplementedException(); }
            }

            public string RouteTemplate
            {
                get { throw new System.NotImplementedException(); }
            }
        }
     

    }
}