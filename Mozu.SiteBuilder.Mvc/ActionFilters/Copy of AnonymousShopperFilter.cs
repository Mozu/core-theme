using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http.Filters;
using Mozu.Core;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Cms;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class InitCmsPageContextActionFilterAttribute : System.Attribute, IActionFilter 
    {

        public Task<System.Net.Http.HttpResponseMessage> ExecuteActionFilterAsync(System.Web.Http.Controllers.HttpActionContext actionContext, System.Threading.CancellationToken cancellationToken, Func<Task<System.Net.Http.HttpResponseMessage>> continuation)
        {
            var tasks= continuation().ContinueWith(actionResult =>
                {
                    var pc = actionContext.Request.Resolve<Mozu.SiteBuilder.Mvc.Contexts.PageContext>();
                    if (pc.CmsContext != null && !pc.CmsContext.Initialized)
                    {
                        var cmsHelper = actionContext.Request.Resolve<CmsHelper>();
                        return cmsHelper.InitCmsPageContext(pc.CmsContext).ContinueWith(_ => actionResult.Result );
                    }
                    return actionResult;
                 //   return tcs.Task;
                });
            return tasks.Unwrap();

        }

        public bool AllowMultiple
        {
            get { return false; }
        }
    }
}
