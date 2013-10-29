using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http.Filters;
using Mozu.Core;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.User.Contracts.Clients;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class RefreshUserAuthTicketFilter : ActionFilterAttribute
    {
        private StoreFrontAuthorizeAttribute _storeFrontAuthorizeAttribute = new StoreFrontAuthorizeAttribute();
       
        public override void OnActionExecuting(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            _storeFrontAuthorizeAttribute.RefreshUserAuthTicket(actionContext);


        }
    }
}
