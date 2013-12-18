using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using Magnum.Reflection;
using Mozu.Core;
using Mozu.Core.Api.Client.Caching;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Controllers;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.ViewEngine;


namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class ContextInitializationAttribute : System.Attribute, IActionFilter 
    {
        public Task<HttpResponseMessage> ExecuteActionFilterAsync(HttpActionContext actionContext, CancellationToken cancellationToken, Func<Task<HttpResponseMessage>> continuation)
        {
            var controller = (ApiControllerBase)actionContext.ControllerContext.Controller;
            if (controller != null || !controller.ContextInitilaztionTasks.IsCompleted)
            {
                return continuation().ContinueWith(x => controller.ContextInitilaztionTasks.ContinueWith(y => x.Result)).Unwrap();
            }
            return continuation();
        }

        public  bool AllowMultiple
        {
            get { return false; }
        }
    }

    public class EditModeCacheInvalidatorFilter : System.Web.Http.Filters.ActionFilterAttribute
    {
        public override bool AllowMultiple
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
