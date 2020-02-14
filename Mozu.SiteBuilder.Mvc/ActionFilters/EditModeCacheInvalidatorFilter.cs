using Microsoft.AspNetCore.Mvc.Filters;
using Mozu.Core.Api.Client.Caching;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class EditModeCacheInvalidatorFilter : ActionFilterAttribute
    {
        public bool AllowMultiple => false;

        public void OnActionExecuting(ActionExecutingContext actionContext, ISiteBuilderApiContext apiContext, IDirtyCacheInvalidator invalidator)
        {
            if (!apiContext.IsEditMode)
                return;

            invalidator.Invalidate();
        }
        
    }
}