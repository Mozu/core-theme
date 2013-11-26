using System.Net;
using System.Net.Http;
using Mozu.Core.Api.Filters.Exception;
using Mozu.SiteBuilder.Mvc.ActionResults;
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
                var view = new ViewResult() {Model = actionExecutedContext.Exception, ViewName = "error"};
                actionExecutedContext.ActionContext.Response = actionExecutedContext.ActionContext.Request.CreateResponse(HttpStatusCode.InternalServerError, view);
            }
        }
    }
}
