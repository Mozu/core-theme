using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Http.Filters;
using System.Web.UI.WebControls;
using Autofac;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{




    /// <summary>
    /// Handles uncaught exceptions in MVC controllers
    /// logs them and returns the template's error view.
    /// </summary>
    public class HandleAllTheMvcErrorsFilter : ExceptionFilterAttribute
    {
        /// <summary>
        /// Public constructor.
        /// </summary>
        public HandleAllTheMvcErrorsFilter()
        {

        }


        public override void OnException(HttpActionExecutedContext actionExecutedContext)
        {

            base.OnException(actionExecutedContext);

            var log = LoggingService.LoggerFor<HandleAllTheMvcErrorsFilter>();
            log.Error("Unhandled exception was caught by global exception filter.", actionExecutedContext.Exception);

            var ltScope = (ILifetimeScope) actionExecutedContext.Request.GetDependencyScope().GetService(typeof (ILifetimeScope));

            var httpContext = ltScope.Resolve<HttpContextBase>();

            // render a custom error
            if (httpContext.IsCustomErrorEnabled)
            {
                var oc = actionExecutedContext.ActionContext.Response.Content as ObjectContent;
                if (oc != null && oc.Value is ViewResult)
                {


                    var result = (ViewResult) oc.Value;

                    // add a couple of extra things to viewdata.
                    if (result != null)
                    {
                        result.ViewData["ActivityId"] = Trace.CorrelationManager.ActivityId.Equals(Guid.Empty) ? null : Trace.CorrelationManager.ActivityId.ToString("N");
                    }
                }

                    // Return the YSOD -- but return it ourselves. This allows us to maintain our custom HTTP headers.
                else
                {
                    var ex = actionExecutedContext.Exception as HttpUnhandledException ?? new HttpUnhandledException(null, actionExecutedContext.Exception);

                    var response = httpContext.Response;

                    response.Clear();
                    response.StatusCode = 500;
                    response.TrySkipIisCustomErrors = true;
                    //filterContext.ExceptionHandled = true;

                    var html = ex.GetHtmlErrorMessage();

                    if (Trace.CorrelationManager.ActivityId != Guid.Empty)
                    {
                        string correlationId = Trace.CorrelationManager.ActivityId.ToString("N");
                        html = html.Replace("<b> Description: </b>", "<b> Correlation Id: </b>" + correlationId + "<br /><br /><b> Description: </b>");
                    }

                    actionExecutedContext.ActionContext.Response = new HttpResponseMessage(HttpStatusCode.InternalServerError);

                    actionExecutedContext.ActionContext.Response.Content = new ObjectContent(typeof (ContentResult), new ContentResult
                                                                                                                         {
                                                                                                                             Content = html,
                                                                                                                             ContentType = "text/html"
                                                                                                                         }, null);
                }
            }
        }
    }
}