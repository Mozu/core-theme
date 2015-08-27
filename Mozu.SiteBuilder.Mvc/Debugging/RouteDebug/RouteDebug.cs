using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Routing;

namespace Mozu.SiteBuilder.Mvc.Debugging.RouteDebug
{
    public class DebugHttpHandler : IHttpHandler
{
    // Methods
    private static string FormatRouteValueDictionary(RouteValueDictionary values)
    {
        if ((values == null) || (values.Count == 0))
        {
            return "(null)";
        }
        string str = string.Empty;
      
        return string.Join( "<br>", values.Keys.Select(str2 => string.Format("{0} = {1}", str2, ObjectFormat(values[str2]))).ToArray());
        //foreach (string str2 in values.Keys)
        //{

        //    str = str + string.Format("{0} = {1}<br/> ", str2, ObjectFormat(values[str2]));
        //}
        //if (str.EndsWith(", "))
        //{
        //    str = str.Substring(0, str.Length - 2);
        //}
        //return str;
    }
    static string ObjectFormat(object obj)
    {
        if (obj == null)
        {
            return null;
        }
        var ver = obj as Mozu.Core.Api.Routing.MozuVersionConstraint;
        if (ver != null)
        {
            var ret = string.Format("MozuVersionConstraint:{0}", string.Join(",",
                                 typeof(Mozu.Core.Api.Routing.MozuVersionConstraint)
                                     .GetFields(BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic).Select(x => string.Format("[{0}:{1}]", x.Name, x.GetValue(ver))).ToArray()
                                  )
                );
            return ret;
        }
        var meth = obj as System.Web.Http.Routing.HttpMethodConstraint;
        if (meth != null)
        {
            var ret= string.Format("HttpMethod:{0}", string.Join(",", meth.AllowedMethods.Select(x => x.Method.ToString()).ToArray()));
            return ret;
        }
        return obj.ToString();
    }


    public void ProcessRequest(HttpContext context)
    {
        string str = string.Empty;
        if (context.Request.QueryString.Count > 0)
        {
            RouteValueDictionary dictionary = new RouteValueDictionary();
            foreach (string str2 in context.Request.QueryString.Keys)
            {
                dictionary.Add(str2, context.Request.QueryString[str2]);
            }

            

            VirtualPathData virtualPath = RouteTable.Routes.GetVirtualPath(this.RequestContext, dictionary);
            if (virtualPath != null)
            {
                str = "<p><label>Generated URL</label>: ";
                str = str + "<strong style=\"color: #00a;\">" + virtualPath.VirtualPath + "</strong>";
                Route route = virtualPath.Route as Route;
                if (route != null)
                {
                    str = str + " using the route \"" + route.Url + "\"</p>";
                }
            }
        }
        string format = "<html>\r\n<head>\r\n    <title>Route Tester</title>\r\n    <style>\r\n        body, td, th {{font-family: verdana; font-size: small;}}\r\n        .message {{font-size: .9em;}}\r\n        caption {{font-weight: bold;}}\r\n        tr.header {{background-color: #ffc;}}\r\n        label {{font-weight: bold; font-size: 1.1em;}}\r\n        .false {{color: #c00;}}\r\n        .true {{color: #0c0;}}\r\n    </style>\r\n</head>\r\n<body>\r\n<h1>Route Tester</h1>\r\n<div id=\"main\">\r\n    <p class=\"message\">\r\n        Type in a url in the address bar to see which defined routes match it. \r\n        A {{*catchall}} route is added to the list of routes automatically in \r\n        case none of your routes match.\r\n    </p>\r\n    <p class=\"message\">\r\n        To generate URLs using routing, supply route values via the query string. example: <code>http://localhost:14230/?id=123</code>\r\n    </p>\r\n    <p><label>Matched Route</label>: {1}</p>\r\n    {5}\r\n    <div style=\"float: left;\">\r\n        <table border=\"1\" cellpadding=\"3\" cellspacing=\"0\" width=\"300\">\r\n            <caption>Route Data</caption>\r\n            <tr class=\"header\"><th>Key</th><th>Value</th></tr>\r\n            {0}\r\n        </table>\r\n    </div>\r\n    <div style=\"float: left; margin-left: 10px;\">\r\n        <table border=\"1\" cellpadding=\"3\" cellspacing=\"0\" width=\"300\">\r\n            <caption>Data Tokens</caption>\r\n            <tr class=\"header\"><th>Key</th><th>Value</th></tr>\r\n            {4}\r\n        </table>\r\n    </div>\r\n    <hr style=\"clear: both;\" />\r\n    <table border=\"1\" cellpadding=\"3\" cellspacing=\"0\">\r\n        <caption>All Routes</caption>\r\n        <tr class=\"header\">\r\n            <th>Matches Current Request</th>\r\n            <th>Url</th>\r\n            <th>Defaults</th>\r\n            <th>Constraints</th>\r\n            <th>DataTokens</th>\r\n        </tr>\r\n        {2}\r\n    </table>\r\n    <hr />\r\n    <h3>Current Request Info</h3>\r\n    <p>\r\n        AppRelativeCurrentExecutionFilePath is the portion of the request that Routing acts on.\r\n    </p>\r\n    <p><strong>AppRelativeCurrentExecutionFilePath</strong>: {3}</p>\r\n</div>\r\n</body>\r\n</html>";
        string str4 = string.Empty;
        RouteData routeData = this.RequestContext.RouteData;
        RouteValueDictionary values = routeData.Values;
        RouteBase base2 = routeData.Route;
        string str5 = string.Empty;
        using (RouteTable.Routes.GetReadLock())
        {
            foreach (RouteBase base3 in RouteTable.Routes)
            {
                bool flag = base3.GetRouteData(this.RequestContext.HttpContext) != null;
                string str6 = string.Format("<span class=\"{0}\">{0}</span>", flag);
                string url = "n/a";
                string str8 = "n/a";
                string str9 = "n/a";
                string str10 = "n/a";
                Route route2 = base3 as Route;
                if (route2 != null)
                {
                    url = route2.Url;
                    str8 = FormatRouteValueDictionary(route2.Defaults);
                    str9 = FormatRouteValueDictionary(route2.Constraints);
                    str10 = FormatRouteValueDictionary(route2.DataTokens);
                }
                str5 = str5 + string.Format("<tr><td>{0}</td><td>{1}</td><td>{2}</td><td>{3}</td><td>{4}</td></tr>", new object[] { str6, url, str8, str9, str10 });
            }
        }
        string str11 = "n/a";
        string str12 = "";
        if (base2 is DebugRoute)
        {
            str11 = "<strong class=\"false\">NO MATCH!</strong>";
        }
        else
        {
            foreach (string str2 in values.Keys)
            {
                str4 = str4 + string.Format("\t<tr><td>{0}</td><td>{1}&nbsp;</td></tr>", str2, values[str2]);
            }
            foreach (string str2 in routeData.DataTokens.Keys)
            {
                str12 = str12 + string.Format("\t<tr><td>{0}</td><td>{1}&nbsp;</td></tr>", str2, routeData.DataTokens[str2]);
            }
            Route route3 = base2 as Route;
            if (route3 != null)
            {
                str11 = route3.Url;
            }
        }
        context.Response.Write(string.Format(format, new object[] { str4, str11, str5, context.Request.AppRelativeCurrentExecutionFilePath, str12, str }));
    }

    // Properties
    public bool IsReusable
    {
        get
        {
            return true;
        }
    }

    public RequestContext RequestContext { get; set; }
}

    public class DebugRoute : Route
    {
        // Fields
        private static DebugRoute singleton = new DebugRoute();

        // Methods
        private DebugRoute()
            : base("{*catchall}", new DebugRouteHandler())
        {
        }

        // Properties
        public static DebugRoute Singleton
        {
            get
            {
                return singleton;
            }
        }
    }


    public class DebugRouteHandler : IRouteHandler
    {
        // Methods
        public IHttpHandler GetHttpHandler(RequestContext requestContext)
        {
            return new DebugHttpHandler { RequestContext = requestContext };
        }
    }


    public static class RouteDebugger
    {
        // Methods
        public static void RewriteRoutesForTesting(RouteCollection routes)
        {
            using (routes.GetReadLock())
            {
                bool flag = false;
                foreach (RouteBase base2 in routes)
                {
                    Route route = base2 as Route;
                    if (route != null)
                    {
                        route.RouteHandler = new DebugRouteHandler();
                    }
                    if (route == DebugRoute.Singleton)
                    {
                        flag = true;
                    }
                }
                if (!flag)
                {
                    routes.Add(DebugRoute.Singleton);
                }
            }
        }
    }

 


 

 


 

}
