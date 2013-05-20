using System;
using System.Diagnostics;
using System.Web.Mvc;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    /// <summary>
    /// Duplicates the job of <code>CorrelationHeaderMessageHandler</code>
    /// However, DelegatingHandlers only work for Web API controllers
    /// and sometimes we need the same functionality on MVC controllers.
    /// </summary>
    public class AddCorrelationHeaderFilterAttribute : ActionFilterAttribute, IExceptionFilter
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            base.OnActionExecuting(filterContext);

            var request = filterContext.HttpContext.Request;
            string correlationId = request.Headers[Mozu.Core.Api.Contracts.Constants.Headers.CORRELATION];
            
            if (String.IsNullOrEmpty(correlationId))
            {
                correlationId = Guid.NewGuid().ToString("N");
                request.Headers.Add(Mozu.Core.Api.Contracts.Constants.Headers.CORRELATION, correlationId);
            }

            Trace.CorrelationManager.ActivityId = new Guid(correlationId);
        }

        public override void OnResultExecuted(ResultExecutedContext filterContext)
        {
            base.OnResultExecuted(filterContext);

            AddFiltersToResponse(filterContext);
        }

        public void OnException(ExceptionContext filterContext)
        {
            AddFiltersToResponse(filterContext);
        }

        private void AddFiltersToResponse(ControllerContext context)
        {
            var response = context.HttpContext.Response;
            string correlationId = Trace.CorrelationManager.ActivityId.ToString("N");

            if (correlationId != "00000000000000000000000000000000" && String.IsNullOrEmpty(response.Headers[Mozu.Core.Api.Contracts.Constants.Headers.CORRELATION]))
                response.AppendHeader(Mozu.Core.Api.Contracts.Constants.Headers.CORRELATION, correlationId);
        }
    }
}
