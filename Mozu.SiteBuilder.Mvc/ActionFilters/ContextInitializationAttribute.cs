using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http.Controllers;
using System.Web.Mvc;
using System.Web.UI;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Controllers;
using IActionFilter = System.Web.Http.Filters.IActionFilter;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class ContextInitializationAttribute : System.Attribute, IActionFilter 
    {
        public Task<HttpResponseMessage> ExecuteActionFilterAsync(HttpActionContext actionContext, CancellationToken cancellationToken, Func<Task<HttpResponseMessage>> continuation)
        {
            var controller = (ApiControllerBase)actionContext.ControllerContext.Controller;
            if (controller != null || !controller.ContextInitializationTasks.IsCompleted)
            {
                return continuation().ContinueWith(x => 
                    
                    {
                        if (controller.ContextInitializationTasks.IsCompleted &&
                            controller.PageContext != null &&
                            controller.PageContext.CmsContext != null &&
                            !controller.PageContext.CmsContext.Initialized)
                        {
                            return new CmsHelper(controller.CmsService).InitCmsPageContext(controller.PageContext, controller.SiteContext  ).ContinueWith(y => x.Result);

                        }
                        else
                        {
                            return controller.ContextInitializationTasks.ContinueWith(y => x.Result);    
                        }
                        
                    }).Unwrap();
            }
            return continuation();
        }

        public  bool AllowMultiple
        {
            get { return false; }
        }
    }
}