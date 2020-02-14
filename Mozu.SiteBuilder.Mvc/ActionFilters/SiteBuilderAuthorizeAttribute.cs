using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class StoreFrontAuthorizeAttribute : IAuthorizationFilter
    {
        private readonly ISiteBuilderApiContext _sbc;

        public StoreFrontAuthorizeAttribute(ISiteBuilderApiContext sbc)
        {
            _sbc = sbc;
        }

        public bool AllowMultiple => false;
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            if (_sbc.UserClaims == null || _sbc.UserClaims.IsAnonymous || !_sbc.UserClaims.IsAuthenticationHot)
            {
                context.Result = new ForbidResult();
            }
        }
    }
}