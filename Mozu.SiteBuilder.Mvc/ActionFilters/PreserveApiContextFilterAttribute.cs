using System;
using System.Diagnostics;
using System.Web.Mvc;
using Autofac.Core;
using Mozu.Core;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    /// <summary>
    /// Stores ApiContext in HttpContext.Current.Items for possible access by the logging system.
    /// </summary>
    public class PreserveApiContextFilterAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            base.OnActionExecuting(filterContext);

            var apiContext = DependencyResolver.Current.GetService<IApiContext>();

            if (apiContext != null && filterContext.HttpContext.Items != null && !filterContext.HttpContext.Items.Contains(Mozu.Core.Constants.LoggerApiContextKey))
                filterContext.HttpContext.Items[Mozu.Core.Constants.LoggerApiContextKey] = apiContext;
        }
    }
}
