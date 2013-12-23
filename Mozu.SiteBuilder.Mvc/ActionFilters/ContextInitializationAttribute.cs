using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using Mozu.SiteBuilder.Mvc.Controllers;

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
}