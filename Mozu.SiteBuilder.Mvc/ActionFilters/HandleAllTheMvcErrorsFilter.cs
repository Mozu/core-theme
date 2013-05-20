using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Mozu.Core.Logging;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    /// <summary>
    /// Handles uncaught exceptions in MVC controllers
    /// logs them and returns the template's error view.
    /// </summary>
    public class HandleAllTheMvcErrorsFilter : HandleErrorAttribute
    {
        /// <summary>
        /// Public constructor.
        /// </summary>
        public HandleAllTheMvcErrorsFilter()
        {
            View = "Error";
        }

        /// <summary>
        /// Handle the exception.
        /// </summary>
        public override void OnException(ExceptionContext filterContext)
        {
            if (filterContext.IsChildAction || filterContext.ExceptionHandled)
                return;

            base.OnException(filterContext);

            var log = LoggingService.LoggerFor<HandleAllTheMvcErrorsFilter>();
            log.Error("Unhandled exception was caught by global exception filter.", filterContext.Exception);

            // render a custom error
            if (filterContext.HttpContext.IsCustomErrorEnabled)
            {
                var result = (ViewResult)filterContext.Result;

                // add a couple of extra things to viewdata.
                if (result != null)
                {
                    result.ViewData["ActivityId"] = Trace.CorrelationManager.ActivityId.Equals(Guid.Empty) ? null : Trace.CorrelationManager.ActivityId.ToString("N");
                }
            }

            // Return the YSOD -- but return it ourselves. This allows us to maintain our custom HTTP headers.
            else
            {
                var ex = filterContext.Exception as HttpUnhandledException ?? new HttpUnhandledException(null, filterContext.Exception);

                if (ex != null)
                {
                    var response = filterContext.HttpContext.Response;

                    response.Clear();
                    response.StatusCode = 500;
                    response.TrySkipIisCustomErrors = true;
                    filterContext.ExceptionHandled = true;

                    filterContext.Result = new ContentResult {
                        Content = ex.GetHtmlErrorMessage(),
                        ContentType = "text/html"
                    };
                }
            }
        }
    }
}
