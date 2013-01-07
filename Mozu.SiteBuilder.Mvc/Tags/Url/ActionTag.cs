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


    [NDjango.Interfaces.Name("url_action")]
    public class ActionTag : DynamicTagBase
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


        // Summary:
        //     Generates a fully qualified URL to an action method by using the specified
        //     action name.
        //
        // Parameters:
        //   actionName:
        //     The name of the action method.
        //
        // Returns:
        //     The fully qualified URL to an action method.
        public string Process(string actionName)
        {
            return Url.Action(actionName);
        }
        //
        // Summary:
        //     Generates a fully qualified URL to an action method by using the specified
        //     action name and route values.
        //
        // Parameters:
        //   actionName:
        //     The name of the action method.
        //
        //   routeValues:
        //     An object that contains the parameters for a route. The parameters are retrieved
        //     through reflection by examining the properties of the object. The object
        //     is typically created by using object initializer syntax.
        //
        // Returns:
        //     The fully qualified URL to an action method.
        public string Process(string actionName, object routeValues)
        {
            return Url.Action(actionName, routeValues);
        }
        //
        // Summary:
        //     Generates a fully qualified URL to an action method for the specified action
        //     name and route values.
        //
        // Parameters:
        //   actionName:
        //     The name of the action method.
        //
        //   routeValues:
        //     An object that contains the parameters for a route.
        //
        // Returns:
        //     The fully qualified URL to an action method.
        public string Process(string actionName, RouteValueDictionary routeValues)
        {
            return Url.Action(actionName , routeValues);
        }
        //
        // Summary:
        //     Generates a fully qualified URL to an action method by using the specified
        //     action name and controller name.
        //
        // Parameters:
        //   actionName:
        //     The name of the action method.
        //
        //   controllerName:
        //     The name of the controller.
        //
        // Returns:
        //     The fully qualified URL to an action method.
        public string Process(string actionName, string controllerName)
        {
            return Url.Action(actionName, controllerName);
        }
        //
        // Summary:
        //     Generates a fully qualified URL to an action method by using the specified
        //     action name, controller name, and route values.
        //
        // Parameters:
        //   actionName:
        //     The name of the action method.
        //
        //   controllerName:
        //     The name of the controller.
        //
        //   routeValues:
        //     An object that contains the parameters for a route. The parameters are retrieved
        //     through reflection by examining the properties of the object. The object
        //     is typically created by using object initializer syntax.
        //
        // Returns:
        //     The fully qualified URL to an action method.
        public string Process(string actionName, string controllerName, object routeValues)
        {
            return Url.Action(actionName, controllerName, routeValues);
        }
        //
        // Summary:
        //     Generates a fully qualified URL to an action method by using the specified
        //     action name, controller name, and route values.
        //
        // Parameters:
        //   actionName:
        //     The name of the action method.
        //
        //   controllerName:
        //     The name of the controller.
        //
        //   routeValues:
        //     An object that contains the parameters for a route.
        //
        // Returns:
        //     The fully qualified URL to an action method.
        public string Process(string actionName, string controllerName, RouteValueDictionary routeValues)
        {
            return Url.Action(actionName, controllerName, routeValues);
        }
        //
        // Summary:
        //     Generates a fully qualified URL to an action method by using the specified
        //     action name, controller name, route values, and protocol to use.
        //
        // Parameters:
        //   actionName:
        //     The name of the action method.
        //
        //   controllerName:
        //     The name of the controller.
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
        //     The fully qualified URL to an action method.
        public string Process(string actionName, string controllerName, object routeValues, string protocol)
        {
            return Url.Action(actionName, controllerName, routeValues, protocol);
        }
        //
        // Summary:
        //     Generates a fully qualified URL for an action method by using the specified
        //     action name, controller name, route values, protocol to use, and host name.
        //
        // Parameters:
        //   actionName:
        //     The name of the action method.
        //
        //   controllerName:
        //     The name of the controller.
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
        //     The fully qualified URL to an action method.
        public string Process(string actionName, string controllerName, RouteValueDictionary routeValues, string protocol, string hostName)
        {
            return Url.Action ( actionName,  controllerName,  routeValues,  protocol,  hostName);
        }
       


    }

}
