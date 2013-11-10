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
        private static int PublishBehavorID = new PublishPreviewBehavior().Id;
        public override void OnActionExecuting(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            var apiContext = actionContext.Request.Resolve<ISiteBuilderApiContext >();
            if (apiContext.UserClaims == null && apiContext.SiteId.HasValue )
            {
                apiContext.SetUser(LightweightUserClaims.CreateForAnonymousShopper(apiContext.TenantId, apiContext.SiteId.Value));
                if (apiContext.DataViewMode == DataViewModeType.Pending)
                {
                    if (apiContext.UserClaims.BehaviorIds == null)
                    {
                        apiContext.UserClaims.BehaviorIds = new int[0];
                    }
                    if (!apiContext.UserClaims.BehaviorIds.Contains(PublishBehavorID))
                    {
                        apiContext.UserClaims.BehaviorIds = apiContext.UserClaims.BehaviorIds.Concat(new int[] { PublishBehavorID }).ToArray();
                    }
                }
                actionContext.Request.Resolve<IAuthenticationHelper>().SaveAccessToken(apiContext.UserClaims.ToAccessToken());
            }
            base.OnActionExecuting(actionContext);
        }
    }
}
