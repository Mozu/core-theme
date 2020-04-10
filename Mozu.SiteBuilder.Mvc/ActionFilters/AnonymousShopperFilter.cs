using System.Linq;
using Microsoft.AspNetCore.Mvc.Filters;
using Mozu.Core;
using Mozu.Core.Configuration;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class AnonymousShopperFilterAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext actionContext)
        {
            var apiContext = actionContext.HttpContext.RequestServices.Resolve<ISiteBuilderApiContext>();

            if (NeedsAnonymousUserClaims(apiContext) && apiContext.SiteId.HasValue)
            {
                apiContext.SetUser(LightweightUserClaims.CreateForAnonymousShopper(apiContext.TenantId, apiContext.SiteId.Value));
                actionContext.HttpContext.RequestServices.Resolve<IAuthenticationHelper>().SaveStoreFrontAccessToken(apiContext.UserClaims.ToAccessToken(), null);
            }

            base.OnActionExecuting(actionContext);
        }

        private bool NeedsAnonymousUserClaims(IApiContext apiContext)
        {
            if (apiContext.UserClaims == null) return true;

            // With the introduction of B2B shopper permissions, anonymous shoppers should have FullAccountAccessBehavior.
            // Shopper claims start at Id 1000. The behavior check here is to migrate existing anonymous shopper cookies to include new behavior.
            // Shopper cookies (which contain the user claims via access token) are valid for 1 year, so we need this till probably the beginning of 2020.
            if (!apiContext.IsAnonymousShopper()) return false;
            if (apiContext.UserClaims.BehaviorIds == null) return true;
            return !apiContext.UserClaims.BehaviorIds.Any(x => x >= 1000);
        }
    }
}
