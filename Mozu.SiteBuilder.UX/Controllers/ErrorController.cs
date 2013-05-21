using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Mozu.SiteBuilder.UX.Controllers;

namespace Mozu.SiteBuilder.UX.Controllers
{
    public class ErrorController : BaseController 
    {
        public ActionResult NotFound()
        {
            var sc = this.SiteContext;
            return new HttpNotFoundResult();
        }

    }
}
