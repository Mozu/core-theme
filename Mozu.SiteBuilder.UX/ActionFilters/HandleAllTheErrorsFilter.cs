using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Mozu.Core.Logging;

namespace Mozu.SiteBuilder.UX.ActionFilters
{
    public class HandleAllTheErrorsFilter : HandleErrorAttribute
    {
        /// <summary>
        /// Public constructor.
        /// </summary>
        public HandleAllTheErrorsFilter()
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

            var log = LoggingService.LoggerFor<HandleAllTheErrorsFilter>();
            log.Error("Unhandled exception was caught by global exception filter.", filterContext.Exception);

            if (filterContext.HttpContext.IsCustomErrorEnabled)
            {
                var result = (ViewResult)filterContext.Result;

                // add a couple of extra things to viewdata.
                if (result != null)
                {
                    result.ViewData["ActivityId"] = Trace.CorrelationManager.ActivityId.Equals(Guid.Empty) ? null : Trace.CorrelationManager.ActivityId.ToString("N");
                }
            }
        }
    }
}
