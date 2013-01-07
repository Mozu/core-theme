// -----------------------------------------------------------------------
// <copyright file="HtmlTest1.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Mozu.SiteBuilder.Mvc.Tags.Html
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Web.Mvc.Html;
    using System.Web.Mvc;
    using System.Web.Routing;
    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    /// 
    [NDjango.ParserNodes.Description("HtmlTest1")]
    [NDjango.Interfaces.Name("html_rout_link")]
    public class RoutLinkTag : DynamicTagBase
    {

        //
        // Summary:
        //     Returns an anchor element (a element) that contains the virtual path of the
        //     specified action.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   linkText:
        //     The inner text of the anchor element.
        //
        //   routeValues:
        //     An object that contains the parameters for a route. The parameters are retrieved
        //     through reflection by examining the properties of the object. The object
        //     is typically created by using object initializer syntax.
        //
        // Returns:
        //     An anchor element (a element).
        //
        // Exceptions:
        //   System.ArgumentException:
        //     The linkText parameter is null or empty.
        public MvcHtmlString Process(string linkText, object routeValues)
        {
            return Html.RouteLink(linkText, routeValues);
        }
        //
        // Summary:
        //     Returns an anchor element (a element) that contains the virtual path of the
        //     specified action.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   linkText:
        //     The inner text of the anchor element.
        //
        //   routeValues:
        //     An object that contains the parameters for a route.
        //
        // Returns:
        //     An anchor element (a element).
        //
        // Exceptions:
        //   System.ArgumentException:
        //     The linkText parameter is null or empty.
        public MvcHtmlString Process(string linkText, RouteValueDictionary routeValues)
        {
            return Html.RouteLink(linkText, routeValues);
        }
        //
        // Summary:
        //     Returns an anchor element (a element) that contains the virtual path of the
        //     specified action.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   linkText:
        //     The inner text of the anchor element.
        //
        //   routeName:
        //     The name of the route that is used to return a virtual path.
        //
        // Returns:
        //     An anchor element (a element).
        //
        // Exceptions:
        //   System.ArgumentException:
        //     The linkText parameter is null or empty.
        public MvcHtmlString Process(string linkText, string routeName)
        {
            return Html.RouteLink(linkText, routeName);
        }
        //
        // Summary:
        //     Returns an anchor element (a element) that contains the virtual path of the
        //     specified action.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   linkText:
        //     The inner text of the anchor element.
        //
        //   routeValues:
        //     An object that contains the parameters for a route. The parameters are retrieved
        //     through reflection by examining the properties of the object. The object
        //     is typically created by using object initializer syntax.
        //
        //   htmlAttributes:
        //     An object that contains the HTML attributes to set for the element.
        //
        // Returns:
        //     An anchor element (a element).
        //
        // Exceptions:
        //   System.ArgumentException:
        //     The linkText parameter is null or empty.
        public MvcHtmlString Process(string linkText, object routeValues, object htmlAttributes)
        {
            return Html.RouteLink(linkText, routeValues, htmlAttributes);
        }
        //
        // Summary:
        //     Returns an anchor element (a element) that contains the virtual path of the
        //     specified action.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   linkText:
        //     The inner text of the anchor element.
        //
        //   routeValues:
        //     An object that contains the parameters for a route.
        //
        //   htmlAttributes:
        //     An object that contains the HTML attributes to set for the element.
        //
        // Returns:
        //     An anchor element (a element).
        //
        // Exceptions:
        //   System.ArgumentException:
        //     The linkText parameter is null or empty.
        public MvcHtmlString Process(string linkText, RouteValueDictionary routeValues, IDictionary<string, object> htmlAttributes)
        {
            return Html.RouteLink( linkText,  routeValues, htmlAttributes);
        }

        //
        // Summary:
        //     Returns an anchor element (a element) that contains the virtual path of the
        //     specified action.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   linkText:
        //     The inner text of the anchor element.
        //
        //   routeName:
        //     The name of the route that is used to return a virtual path.
        //
        //   routeValues:
        //     An object that contains the parameters for a route. The parameters are retrieved
        //     through reflection by examining the properties of the object. The object
        //     is typically created by using object initializer syntax.
        //
        // Returns:
        //     An anchor element (a element).
        //
        // Exceptions:
        //   System.ArgumentException:
        //     The linkText parameter is null or empty.
        public MvcHtmlString Process(string linkText, string routeName, object routeValues)
        {
            return Html.RouteLink( linkText,  routeName,  routeValues);
        }
        //
        // Summary:
        //     Returns an anchor element (a element) that contains the virtual path of the
        //     specified action.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   linkText:
        //     The inner text of the anchor element.
        //
        //   routeName:
        //     The name of the route that is used to return a virtual path.
        //
        //   routeValues:
        //     An object that contains the parameters for a route.
        //
        // Returns:
        //     An anchor element (a element).
        //
        // Exceptions:
        //   System.ArgumentException:
        //     The linkText parameter is null or empty.
        public MvcHtmlString Process(string linkText, string routeName, RouteValueDictionary routeValues)
        {
            return Html.RouteLink( linkText,  routeName,  routeValues);
        }
        //
        // Summary:
        //     Returns an anchor element (a element) that contains the virtual path of the
        //     specified action.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   linkText:
        //     The inner text of the anchor element.
        //
        //   routeName:
        //     The name of the route that is used to return a virtual path.
        //
        //   routeValues:
        //     An object that contains the parameters for a route. The parameters are retrieved
        //     through reflection by examining the properties of the object. The object
        //     is typically created by using object initializer syntax.
        //
        //   htmlAttributes:
        //     An object that contains the HTML attributes to set for the element.
        //
        // Returns:
        //     An anchor element (a element).
        //
        // Exceptions:
        //   System.ArgumentException:
        //     The linkText parameter is null or empty.
        public MvcHtmlString Process(string linkText, string routeName, object routeValues, object htmlAttributes)
        {
            return Html.RouteLink( linkText,  routeName,  routeValues,  htmlAttributes);
        }
        //
        // Summary:
        //     Returns an anchor element (a element) that contains the virtual path of the
        //     specified action.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   linkText:
        //     The inner text of the anchor element.
        //
        //   routeName:
        //     The name of the route that is used to return a virtual path.
        //
        //   routeValues:
        //     An object that contains the parameters for a route.
        //
        //   htmlAttributes:
        //     An object that contains the HTML attributes to set for the element.
        //
        // Returns:
        //     An anchor element (a element).
        //
        // Exceptions:
        //   System.ArgumentException:
        //     The linkText parameter is null or empty.
        public MvcHtmlString Process(string linkText, string routeName, RouteValueDictionary routeValues, IDictionary<string, object> htmlAttributes)
        {
            return Html.RouteLink( linkText,  routeName,  routeValues,  htmlAttributes);
        }
        //
        // Summary:
        //     Returns an anchor element (a element) that contains the virtual path of the
        //     specified action.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   linkText:
        //     The inner text of the anchor element.
        //
        //   routeName:
        //     The name of the route that is used to return a virtual path.
        //
        //   protocol:
        //     The protocol for the URL, such as "http" or "https".
        //
        //   hostName:
        //     The host name for the URL.
        //
        //   fragment:
        //     The URL fragment name (the anchor name).
        //
        //   routeValues:
        //     An object that contains the parameters for a route. The parameters are retrieved
        //     through reflection by examining the properties of the object. The object
        //     is typically created by using object initializer syntax.
        //
        //   htmlAttributes:
        //     An object that contains the HTML attributes to set for the element.
        //
        // Returns:
        //     An anchor element (a element).
        //
        // Exceptions:
        //   System.ArgumentException:
        //     The linkText parameter is null or empty.
        public MvcHtmlString Process(string linkText, string routeName, string protocol, string hostName, string fragment, object routeValues, object htmlAttributes)
        {
            return Html.RouteLink( linkText,  routeName,  protocol,  hostName,  fragment,  routeValues,  htmlAttributes);
        }
        //
        // Summary:
        //     Returns an anchor element (a element) that contains the virtual path of the
        //     specified action.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   linkText:
        //     The inner text of the anchor element.
        //
        //   routeName:
        //     The name of the route that is used to return a virtual path.
        //
        //   protocol:
        //     The protocol for the URL, such as "http" or "https".
        //
        //   hostName:
        //     The host name for the URL.
        //
        //   fragment:
        //     The URL fragment name (the anchor name).
        //
        //   routeValues:
        //     An object that contains the parameters for a route.
        //
        //   htmlAttributes:
        //     An object that contains the HTML attributes to set for the element.
        //
        // Returns:
        //     An anchor element (a element).
        //
        // Exceptions:
        //   System.ArgumentException:
        //     The linkText parameter is null or empty.
        public MvcHtmlString Process(string linkText, string routeName, string protocol, string hostName, string fragment, RouteValueDictionary routeValues, IDictionary<string, object> htmlAttributes)
        {
            return Html.RouteLink( linkText,  routeName,  protocol,  hostName,  fragment,  routeValues,  htmlAttributes);
        }
    }
}