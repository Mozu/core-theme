//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Reflection;
//using System.Text;
//using System.Threading.Tasks;
//using System.Web;
//using System.Web.Http.Routing;
//using System.Web.Routing;
//using GreenPipes;
//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.Routing;
//using Mozu.Core.Extensions;

//namespace Mozu.SiteBuilder.Mvc.Debugging.RouteDebug
//{
//    public class DebugHttpHandler
//    {
//        public DebugHttpHandler(RequestDelegate next)
//        {

//        }

//        // Methods
//        private static string FormatRouteValueDictionary(RouteValueDictionary values)
//        {
//            if ((values == null) || (values.Count == 0))
//            {
//                return "(null)";
//            }

//            return string.Join("<br>", values.Keys.Select(str2 => $"{str2} = {ObjectFormat(values[str2])}").ToArray());
//        }
//        static string ObjectFormat(object obj)
//        {
//            if (obj == null)
//            {
//                return null;
//            }

//            if (obj is Mozu.Core.Api.Routing.MozuVersionConstraint ver)
//            {
//                var ret =
//                    $"MozuVersionConstraint:{string.Join(",", typeof(Mozu.Core.Api.Routing.MozuVersionConstraint).GetFields(BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic).Select(x => $"[{x.Name}:{x.GetValue(ver)}]").ToArray())}";
//                return ret;
//            }

//            if (!(obj is HttpMethodConstraint meth)) return obj.ToString();
//            {
//                var ret = $"HttpMethod:{string.Join(",", meth.AllowedMethods.Select(x => x.Method.ToString()).ToArray())}";
//                return ret;
//            }
//        }

//        public async Task Invoke(HttpContext context)
//        {
//            var str = string.Empty;
//            var routeData = context.GetRouteData();
//            if (context.Request.Query.Count > 0)
//            {
//                var dictionary = new RouteValueDictionary();
//                foreach (var str2 in context.Request.Query.Keys)
//                {
//                    dictionary.Add(str2, context.Request.Query[str2]);
//                }

//                VirtualPathData virtualPath = null;
//                routeData.Routers.OfType<RouteCollection>().ForEach(r =>
//                {
//                    if (virtualPath == null)
//                    {
//                        virtualPath = r.GetVirtualPath(new VirtualPathContext(context, dictionary, null));
//                    }
//                });
//                if (virtualPath != null)
//                {
//                    str = "<p><label>Generated URL</label>: ";
//                    str = str + "<strong style=\"color: #00a;\">" + virtualPath.VirtualPath + "</strong>";
//                    //var route = virtualPath.;
//                    //if (route != null)
//                    //{
//                    //    str = str + " using the route \"" + route.Url + "\"</p>";
//                    //}
//                }
//            }
//            const string format = "<html>\r\n<head>\r\n    <title>Route Tester</title>\r\n    <style>\r\n        body, td, th {{font-family: verdana; font-size: small;}}\r\n        .message {{font-size: .9em;}}\r\n        caption {{font-weight: bold;}}\r\n        tr.header {{background-color: #ffc;}}\r\n        label {{font-weight: bold; font-size: 1.1em;}}\r\n        .false {{color: #c00;}}\r\n        .true {{color: #0c0;}}\r\n    </style>\r\n</head>\r\n<body>\r\n<h1>Route Tester</h1>\r\n<div id=\"main\">\r\n    <p class=\"message\">\r\n        Type in a url in the address bar to see which defined routes match it. \r\n        A {{*catchall}} route is added to the list of routes automatically in \r\n        case none of your routes match.\r\n    </p>\r\n    <p class=\"message\">\r\n        To generate URLs using routing, supply route values via the query string. example: <code>http://localhost:14230/?id=123</code>\r\n    </p>\r\n    <p><label>Matched Route</label>: {1}</p>\r\n    {5}\r\n    <div style=\"float: left;\">\r\n        <table border=\"1\" cellpadding=\"3\" cellspacing=\"0\" width=\"300\">\r\n            <caption>Route Data</caption>\r\n            <tr class=\"header\"><th>Key</th><th>Value</th></tr>\r\n            {0}\r\n        </table>\r\n    </div>\r\n    <div style=\"float: left; margin-left: 10px;\">\r\n        <table border=\"1\" cellpadding=\"3\" cellspacing=\"0\" width=\"300\">\r\n            <caption>Data Tokens</caption>\r\n            <tr class=\"header\"><th>Key</th><th>Value</th></tr>\r\n            {4}\r\n        </table>\r\n    </div>\r\n    <hr style=\"clear: both;\" />\r\n    <table border=\"1\" cellpadding=\"3\" cellspacing=\"0\">\r\n        <caption>All Routes</caption>\r\n        <tr class=\"header\">\r\n            <th>Matches Current Request</th>\r\n            <th>Url</th>\r\n            <th>Defaults</th>\r\n            <th>Constraints</th>\r\n            <th>DataTokens</th>\r\n        </tr>\r\n        {2}\r\n    </table>\r\n    <hr />\r\n    <h3>Current Request Info</h3>\r\n    <p>\r\n        AppRelativeCurrentExecutionFilePath is the portion of the request that Routing acts on.\r\n    </p>\r\n    <p><strong>AppRelativeCurrentExecutionFilePath</strong>: {3}</p>\r\n</div>\r\n</body>\r\n</html>";
//            var str4 = string.Empty;
//            var router = routeData.Routers.OfType<RouteCollection>().First();
//            var values = routeData.Values;
//            RouteBase base2 = routeData.Route;
//            var str5 = string.Empty;
//            using (RouteTable.Routes.GetReadLock())
//            {
//                foreach (RouteBase base3 in RouteTable.Routes)
//                {
//                    bool flag = base3.GetRouteData(this.RequestContext.HttpContext) != null;
//                    var str6 = string.Format("<span class=\"{0}\">{0}</span>", flag);
//                    var url = "n/a";
//                    var str8 = "n/a";
//                    var str9 = "n/a";
//                    var str10 = "n/a";
//                    if (base3 is Route route2)
//                    {
//                        url = route2.RouteTemplate;
//                        str8 = FormatRouteValueDictionary(route2.Defaults);
//                        str9 = FormatRouteValueDictionary(route2.Constraints);
//                        str10 = FormatRouteValueDictionary(route2.DataTokens);
//                    }
//                    str5 += string.Format("<tr><td>{0}</td><td>{1}</td><td>{2}</td><td>{3}</td><td>{4}</td></tr>", new object[] { str6, url, str8, str9, str10 });
//                }
//            }
//            var str11 = "n/a";
//            var str12 = "";
//            if (base2 is DebugRoute)
//            {
//                str11 = "<strong class=\"false\">NO MATCH!</strong>";
//            }
//            else
//            {
//                str4 = values.Keys.Aggregate(str4, (current, str2) => current +
//                                                                      $"\t<tr><td>{str2}</td><td>{values[str2]}&nbsp;</td></tr>");
//                str12 = routeData.DataTokens.Keys.Aggregate(str12, (current, str2) => current +
//                                                                                      $"\t<tr><td>{str2}</td><td>{routeData.DataTokens[str2]}&nbsp;</td></tr>");
//                if (base2 is Route route3)
//                {
//                    str11 = route3.Url;
//                }
//            }
//            await context.Response.WriteAsync(string.Format(format, new object[] { str4, str11, str5, context.Request.AppRelativeCurrentExecutionFilePath, str12, str }));
//        }

//        // Properties
//        public bool IsReusable => true;

//        public RequestContext RequestContext { get; set; }
//    }

//    public class DebugRoute : Route
//    {
//        // Methods
//        private DebugRoute()
//            : base("{*catchall}", new DebugRouteHandler())
//        {
//        }

//        // Properties
//        public static DebugRoute Singleton { get; } = new DebugRoute();
//    }


//    public class DebugRouteHandler : IRouteHandler
//    {
//        // Methods
//        public IHttpHandler GetHttpHandler(RequestContext requestContext)
//        {
//            return new DebugHttpHandler { RequestContext = requestContext };
//        }
//    }


//    public static class RouteDebugger
//    {
//        // Methods
//        public static void RewriteRoutesForTesting(RouteCollection routes)
//        {
//            using (routes.GetReadLock())
//            {
//                var flag = false;
//                foreach (RouteBase base2 in routes)
//                {
//                    var route = base2 as Route;
//                    if (route != null)
//                    {
//                        route.RouteHandler = new DebugRouteHandler();
//                    }
//                    if (route == DebugRoute.Singleton)
//                    {
//                        flag = true;
//                    }
//                }
//                if (!flag)
//                {
//                    routes.Add(DebugRoute.Singleton);
//                }
//            }
//        }
//    }
//}
