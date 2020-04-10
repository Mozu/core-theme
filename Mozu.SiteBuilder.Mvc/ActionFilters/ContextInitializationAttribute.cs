using Microsoft.AspNetCore.Mvc.Filters;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Controllers;
using System;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class ContextInitializationAttribute : Attribute, IAsyncActionFilter 
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var controller = (ApiControllerBase)context.Controller;
            if (controller != null && !controller.ContextInitializationTasks.IsCompleted)
            {
                var rc = await next();
                if (controller.ContextInitializationTasks.IsCompleted && controller.PageContext?.CmsContext != null && !controller.PageContext.CmsContext.Initialized)
                {
                    await new CmsHelper(controller.CmsService).InitCmsPageContext(controller.PageContext,
                            controller.SiteContext,
                            controller.SbApiContext,
                            controller.ExpressionEvaluaton,
                            controller.PageRuleVisitor)
                        .ContinueWith(y => rc.Result);
                }
                else
                {
                    await controller.ContextInitializationTasks.ContinueWith(y => rc.Result);
                }
            }
            await next();
        }
    }
}