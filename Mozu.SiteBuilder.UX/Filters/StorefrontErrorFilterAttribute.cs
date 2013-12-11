using System.Diagnostics;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Mozu.Core.Api.Filters.Exception;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;

namespace Mozu.SiteBuilder.UX.Filters
{
    public class StorefrontErrorFilterAttribute : System.Web.Http.Filters.ExceptionFilterAttribute
    {
        private ApiExceptionFilter _chainFilter;

        public StorefrontErrorFilterAttribute(ApiExceptionFilter chainFilter)
        {
            _chainFilter = chainFilter;
        }

        public override void OnException(System.Web.Http.Filters.HttpActionExecutedContext actionExecutedContext)
        {
            // Call the Mozu.Core.Api exception filter first. That way, if it sets ActionContext.Response, we can overwrite it.
            _chainFilter.OnException(actionExecutedContext);

            var controller =  actionExecutedContext.ActionContext.ControllerContext.Controller as BaseApiController;
            if (controller != null )
            {
                var model = new HttpError(actionExecutedContext.Exception, true);
                model["activityId"] = Trace.CorrelationManager.ActivityId;
                var pageContext = actionExecutedContext.Request.Resolve<PageContext>();
                if (pageContext != null && pageContext.Visit != null)
                {
                    model["visitId"] = pageContext.Visit.VisitId;
                }

                var view = new ViewResult() {Model = model, ViewName = "error"};
                actionExecutedContext.ActionContext.Response = actionExecutedContext.ActionContext.Request.CreateResponse(HttpStatusCode.InternalServerError, view);
            }
        }
    }
}
