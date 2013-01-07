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
    [NDjango.Interfaces.Name("html_action")]
    public class ActionTag : DynamicTagBase
    {

        // Summary:
        //     Invokes the specified child action method and returns the result as an HTML
        //     string.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   actionName:
        //     The name of the action method to invoke.
        //
        // Returns:
        //     The child action result as an HTML string.
        //
        // Exceptions:
        //   System.ArgumentNullException:
        //     The htmlHelper parameter is null.
        //
        //   System.ArgumentException:
        //     The actionName parameter is null or empty.
        //
        //   System.InvalidOperationException:
        //     The required virtual path data cannot be found.
        public  MvcHtmlString Process ( string actionName)
        {
            return Html.Action(actionName);
        }
        //
        // Summary:
        //     Invokes the specified child action method with the specified parameters and
        //     returns the result as an HTML string.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   actionName:
        //     The name of the action method to invoke.
        //
        //   routeValues:
        //     An object that contains the parameters for a route. You can use routeValues
        //     to provide the parameters that are bound to the action method parameters.
        //     The routeValues parameter is merged with the original route values and overrides
        //     them.
        //
        // Returns:
        //     The child action result as an HTML string.
        //
        // Exceptions:
        //   System.ArgumentNullException:
        //     The htmlHelper parameter is null.
        //
        //   System.ArgumentException:
        //     The actionName parameter is null or empty.
        //
        //   System.InvalidOperationException:
        //     The required virtual path data cannot be found.
        public MvcHtmlString Process(string actionName, object routeValues)
        {
            return Html.Action(actionName, routeValues);
        }
        //
        // Summary:
        //     Invokes the specified child action method using the specified parameters
        //     and returns the result as an HTML string.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   actionName:
        //     The name of the action method to invoke.
        //
        //   routeValues:
        //     A dictionary that contains the parameters for a route. You can use routeValues
        //     to provide the parameters that are bound to the action method parameters.
        //     The routeValues parameter is merged with the original route values and overrides
        //     them.
        //
        // Returns:
        //     The child action result as an HTML string.
        //
        // Exceptions:
        //   System.ArgumentNullException:
        //     The htmlHelper parameter is null.
        //
        //   System.ArgumentException:
        //     The actionName parameter is null or empty.
        //
        //   System.InvalidOperationException:
        //     The required virtual path data cannot be found.
        public MvcHtmlString Process(string actionName, RouteValueDictionary routeValues)
        {
            return Html.Action(actionName, routeValues);
        }
        //
        // Summary:
        //     Invokes the specified child action method using the specified controller
        //     name and returns the result as an HTML string.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   actionName:
        //     The name of the action method to invoke.
        //
        //   controllerName:
        //     The name of the controller that contains the action method.
        //
        // Returns:
        //     The child action result as an HTML string.
        //
        // Exceptions:
        //   System.ArgumentNullException:
        //     The htmlHelper parameter is null.
        //
        //   System.ArgumentException:
        //     The actionName parameter is null or empty.
        //
        //   System.InvalidOperationException:
        //     The required virtual path data cannot be found.
        public MvcHtmlString Process(string actionName, string controllerName)
        {
            return Html.Action(actionName, controllerName);
        }
        //
        // Summary:
        //     Invokes the specified child action method using the specified parameters
        //     and controller name and returns the result as an HTML string.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   actionName:
        //     The name of the action method to invoke.
        //
        //   controllerName:
        //     The name of the controller that contains the action method.
        //
        //   routeValues:
        //     An object that contains the parameters for a route. You can use routeValues
        //     to provide the parameters that are bound to the action method parameters.
        //     The routeValues parameter is merged with the original route values and overrides
        //     them.
        //
        // Returns:
        //     The child action result as an HTML string.
        //
        // Exceptions:
        //   System.ArgumentNullException:
        //     The htmlHelper parameter is null.
        //
        //   System.ArgumentException:
        //     The actionName parameter is null or empty.
        //
        //   System.InvalidOperationException:
        //     The required virtual path data cannot be found.
        public MvcHtmlString Process(string actionName, string controllerName, object routeValues)
        {
            return Html.Action(actionName, controllerName, routeValues);
        }
        //
        // Summary:
        //     Invokes the specified child action method using the specified parameters
        //     and controller name and returns the result as an HTML string.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   actionName:
        //     The name of the action method to invoke.
        //
        //   controllerName:
        //     The name of the controller that contains the action method.
        //
        //   routeValues:
        //     A dictionary that contains the parameters for a route. You can use routeValues
        //     to provide the parameters that are bound to the action method parameters.
        //     The routeValues parameter is merged with the original route values and overrides
        //     them.
        //
        // Returns:
        //     The child action result as an HTML string.
        //
        // Exceptions:
        //   System.ArgumentNullException:
        //     The htmlHelper parameter is null.
        //
        //   System.ArgumentException:
        //     The actionName parameter is null or empty.
        //
        //   System.InvalidOperationException:
        //     The required virtual path data cannot be found.
        public MvcHtmlString Process(string actionName, string controllerName, RouteValueDictionary routeValues)
        {
            try
            {
                return Html.Action(actionName, controllerName, routeValues);
            }
            catch ( Exception ex )
            {
                throw new ApplicationException(string.Format("actionName=\"{0}\" controllerName=\"{1}\"", actionName, controllerName), ex);
            }
        }


        
    }
}
