// -----------------------------------------------------------------------
// <copyright file="RouteUrl.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Mozu.SiteBuilder.Mvc.Tags.Url
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Web.Mvc;
    using System.Web.Routing;


    [NDjango.Interfaces.Name("url_route_url")]
    public class RouteUrlTag : DynamicTagBase
    {

        UrlHelper _url;
        public UrlHelper Url
        {
            get
            {
                if (_url == null)
                {
                    _url = new UrlHelper(Html.ViewContext.RequestContext);
                }
                return _url;
            }
        }
        //
        // Summary:
        //     Generates a fully qualified URL for the specified route values.
        //
        // Parameters:
        //   routeValues:
        //     An object that contains the parameters for a route. The parameters are retrieved
        //     through reflection by examining the properties of the object. The object
        //     is typically created by using object initializer syntax.
        //
        // Returns:
        //     The fully qualified URL.
        public string Process(object routeValues)
        {
            return Url.RouteUrl(routeValues);
        }
        //
        // Summary:
        //     Generates a fully qualified URL for the specified route values.
        //
        // Parameters:
        //   routeValues:
        //     An object that contains the parameters for a route.
        //
        // Returns:
        //     The fully qualified URL.
        public string Process(RouteValueDictionary routeValues)
        {
            return Url.RouteUrl(routeValues);
        }
        //
        // Summary:
        //     Generates a fully qualified URL for the specified route name.
        //
        // Parameters:
        //   routeName:
        //     The name of the route that is used to generate the URL.
        //
        // Returns:
        //     The fully qualified URL.
        public string Process(string routeName)
        {
            return Url.RouteUrl(routeName);
        }
        //
        // Summary:
        //     Generates a fully qualified URL for the specified route values by using a
        //     route name.
        //
        // Parameters:
        //   routeName:
        //     The name of the route that is used to generate the URL.
        //
        //   routeValues:
        //     An object that contains the parameters for a route. The parameters are retrieved
        //     through reflection by examining the properties of the object. The object
        //     is typically created by using object initializer syntax.
        //
        // Returns:
        //     The fully qualified URL.
        public string Process(string routeName, object routeValues)
        {
            return Url.RouteUrl(routeName, routeValues);
        }
        //
        // Summary:
        //     Generates a fully qualified URL for the specified route values by using a
        //     route name.
        //
        // Parameters:
        //   routeName:
        //     The name of the route that is used to generate the URL.
        //
        //   routeValues:
        //     An object that contains the parameters for a route.
        //
        // Returns:
        //     The fully qualified URL.
        public string Process(string routeName, RouteValueDictionary routeValues)
        {
            return Url.RouteUrl(routeName, routeValues);
        }
        //
        // Summary:
        //     Generates a fully qualified URL for the specified route values by using a
        //     route name and the protocol to use.
        //
        // Parameters:
        //   routeName:
        //     The name of the route that is used to generate the URL.
        //
        //   routeValues:
        //     An object that contains the parameters for a route. The parameters are retrieved
        //     through reflection by examining the properties of the object. The object
        //     is typically created by using object initializer syntax.
        //
        //   protocol:
        //     The protocol for the URL, such as "http" or "https".
        //
        // Returns:
        //     The fully qualified URL.
        public string Process(string routeName, object routeValues, string protocol)
        {
            return Url.RouteUrl(routeName, routeValues, protocol);
        }
        //
        // Summary:
        //     Generates a fully qualified URL for the specified route values by using the
        //     specified route name, protocol to use, and host name.
        //
        // Parameters:
        //   routeName:
        //     The name of the route that is used to generate the URL.
        //
        //   routeValues:
        //     An object that contains the parameters for a route.
        //
        //   protocol:
        //     The protocol for the URL, such as "http" or "https".
        //
        //   hostName:
        //     The host name for the URL.
        //
        // Returns:
        //     The fully qualified URL.
        public string Process(string routeName, RouteValueDictionary routeValues, string protocol, string hostName)
        {
            return Url.RouteUrl(routeName, routeValues, protocol, hostName);
        }
    }

}
