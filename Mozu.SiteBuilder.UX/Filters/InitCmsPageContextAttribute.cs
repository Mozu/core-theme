using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.UX.Controllers;

namespace Mozu.SiteBuilder.UX.Filters
{
    public class InitCmsPageContextAttribute : Attribute , System.Web.Http.Filters.IActionFilter
    {
        public System.Threading.Tasks.Task<System.Net.Http.HttpResponseMessage> ExecuteActionFilterAsync(System.Web.Http.Controllers.HttpActionContext actionContext, System.Threading.CancellationToken cancellationToken, Func<System.Threading.Tasks.Task<System.Net.Http.HttpResponseMessage>> continuation)
        {
            var controller = (BaseApiController)actionContext.ControllerContext.Controller;
            if (controller != null || controller.PageContext != null)
            {

                return continuation().ContinueWith(x =>
                    {
                        var helper = new CmsHelper(controller.CmsService);
                        return helper.InitCmsPageContext(controller.PageContext.CmsContext).ContinueWith(y => x.Result).Result;

                    });


            }
            else
            {
                return continuation();
            }

        }

        public bool AllowMultiple
        {
            get { return false; }
        }
    }
}