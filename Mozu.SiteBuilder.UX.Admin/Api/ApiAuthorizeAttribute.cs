using System;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Mozu.SiteBuilder.UX.Admin.Filters;
using Mozu.User.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public class AllowAnonymousAttribute : Attribute
    {
        
    }

    [AttributeUsage(AttributeTargets.Method)]
    public class ApiAuthorizeAttribute : Attribute
    {
        public string Roles { get; set; }
    }

    public class AuthOperationHandler //: HttpOperationHandler<HttpRequestMessage, HttpRequestMessage>
    {
        private readonly ApiAuthorizeAttribute _authorizeAttribute;
        private SiteBuilderAuthorizeAttribute _sbAtt;

        public AuthOperationHandler(ApiAuthorizeAttribute authorizeAttribute)
            //: base("response")
        {
            _authorizeAttribute = authorizeAttribute;
            _sbAtt = new SiteBuilderAuthorizeAttribute();
        }



        protected /*override*/ HttpRequestMessage OnHandle(HttpRequestMessage input)
        {
            var httpContext = new System.Web.HttpContextWrapper(System.Web.HttpContext.Current);

            if (!_sbAtt.IsAuthorized(httpContext))
            {
                throw new HttpResponseException(HttpStatusCode.Unauthorized);
            }
            return input;
        }
    }

}