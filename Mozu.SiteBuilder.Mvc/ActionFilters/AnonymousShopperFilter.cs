using System.Linq;
using System.Web.Http.Filters;
using Mozu.Core;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class AnonymousShopperFilterAttribute : ActionFilterAttribute
    {
        public override bool AllowMultiple { get { return false; } }

        public override void OnActionExecuting(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            var apiContext = actionContext.Request.Resolve<ISiteBuilderApiContext>();

            if (NeedsAnonymousUserClaims(apiContext) && apiContext.SiteId.HasValue)
            {
                apiContext.SetUser(LightweightUserClaims.CreateForAnonymousShopper(apiContext.TenantId, apiContext.SiteId.Value));

                actionContext.Request.Resolve<IAuthenticationHelper>().SaveStoreFrontAccessToken(apiContext.UserClaims.ToAccessToken(), null);
            }
            base.OnActionExecuting(actionContext);
        }

        private bool NeedsAnonymousUserClaims(IApiContext apiContext)
        {
            if (apiContext.UserClaims == null) return true;

            // With the introduction of B2B shopper permissions, anonymous shoppers should have FullAccountAccessBehavior.
            // Shopper claims start at Id 1000. The behavior check here is to migrate existing anonymous shopper cookies to include new behavior.
            // Shopper cookies (which contain the user claims via access token) are valid for 1 year, so we need this till probably the beginning of 2020.
            if (apiContext.IsAnonymousShopper())
            {
                if (apiContext.UserClaims.BehaviorIds == null) return true;
                if (!apiContext.UserClaims.BehaviorIds.Any(x => x >= 1000)) return true;
            }

            return false;
        }
    }
}
