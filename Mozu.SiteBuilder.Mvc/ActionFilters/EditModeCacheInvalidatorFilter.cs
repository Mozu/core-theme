using Microsoft.AspNetCore.Mvc.Filters;
using Mozu.Core.Api.Client.Caching;
using Mozu.Core.Configuration;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class EditModeCacheInvalidatorFilter : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext actionContext)
        {
            var apiContext = actionContext.HttpContext.RequestServices.Resolve<ISiteBuilderApiContext>();
            if (!apiContext.IsEditMode)
                return;

            var invalidator = actionContext.HttpContext.RequestServices.Resolve<IDirtyCacheInvalidator>();
            invalidator.Invalidate();
        }
    }
}