using System;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Mvc;
using Autofac;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ViewEngine;

using Mozu.SiteBuilder.Mvc.Security;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class StoreFrontAuthorizeAttribute : System.Web.Http.AuthorizeAttribute

    {
      
        protected override bool IsAuthorized(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            var sbc = actionContext.Request.Resolve<ISiteBuilderApiContext>();
            if (sbc.UserClaims == null || sbc.UserClaims.IsAnonymous || !sbc.UserClaims.IsAuthenticationHot )
            {
                return false;
            }

            return true;

        }

        public override bool AllowMultiple
        {
            get { return false; }
        }

    }
}