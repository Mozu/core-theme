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
            
            var rc = await next();
            var controller = (ApiControllerBase)context.Controller;
           
            if (controller != null) 
            {
                var tasks =  controller.GetContextInitializationTasks();
        
                if ( tasks.IsCompleted && controller.PageContext?.CmsContext != null && !controller.PageContext.CmsContext.Initialized)
                {
                    await new CmsHelper(controller.CmsService).InitCmsPageContext(controller.PageContext,
                            controller.SiteContext,
                            controller.SbApiContext,
                            controller.ExpressionEvaluator,
                            controller.PageRuleVisitor)
                        .ContinueWith(y => rc.Result);
                }
                else
                {
                    await tasks.ContinueWith(y => rc.Result);
                }
            }
        }
    }
}