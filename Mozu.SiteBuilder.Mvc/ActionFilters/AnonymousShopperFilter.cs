using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http.Filters;
using Mozu.Core;
using Mozu.Core.Behaviors;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class AnonymousShopperFilterAttribute : ActionFilterAttribute
    {
        public override bool AllowMultiple { get { return false; } }

        private static int PublishBehavorID = new PublishPreviewBehavior().Id;
        public override void OnActionExecuting(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            var apiContext = actionContext.Request.Resolve<ISiteBuilderApiContext >();
            if (apiContext.UserClaims == null && apiContext.SiteId.HasValue )
            {
                apiContext.SetUser(LightweightUserClaims.CreateForAnonymousShopper(apiContext.TenantId, apiContext.SiteId.Value));
               
                actionContext.Request.Resolve<IAuthenticationHelper>().SaveStoreFrontAccessToken(apiContext.UserClaims.ToAccessToken(), null);
            }
            base.OnActionExecuting(actionContext);
        }
    }
}
