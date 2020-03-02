using System;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Filters;
using Mozu.Core;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class StoreFrontAuthorizeAttribute : IAuthorizationFilter
    {
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var sbc = context.HttpContext.RequestServices.GetService<ISiteBuilderApiContext>();
            if (sbc.UserClaims == null || sbc.UserClaims.IsAnonymous || !sbc.UserClaims.IsAuthenticationHot)
            {
                context.Result = new ForbidResult();
            }
        }
    }
}