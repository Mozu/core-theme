using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;

namespace Mozu.SiteBuilder.UX.Controllers
{
    public class ErrorController : BaseApiController 
    {
        public object  NotFound()
        {
            var sc = this.SiteContext;
            return new HttpNotFoundResult();
        }

    }
}
