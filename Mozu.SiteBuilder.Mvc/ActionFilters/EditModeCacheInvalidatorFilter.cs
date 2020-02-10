using System.Web.Http.Controllers;
using Mozu.Core.Api.Client.Caching;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class EditModeCacheInvalidatorFilter : Microsoft.AspNetCore.Mvc.Filters.ActionFilterAttribute
    {
        public bool AllowMultiple
        {
            get { return false; }
        }
        public override  void OnActionExecuting(HttpActionContext actionContext)
        {
            var apiContext = actionContext.Request.Resolve<ISiteBuilderApiContext>();
            if (!apiContext.IsEditMode)
                return;

            var invalidator = actionContext.Request.Resolve<IDirtyCacheInvalidator>();
            invalidator.Invalidate();
        }
        
    }
}