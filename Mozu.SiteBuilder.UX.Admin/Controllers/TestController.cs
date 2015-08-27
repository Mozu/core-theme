using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Controllers;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.UX.Admin.Controllers
{
    public class TestController : ApiControllerBase 
    {
        //
        // GET: /Test/

         [HttpGet]
        public ActionResult DecryptTicket()
        {
            return View("DecryptTicket");
        }
        [HttpPost]
        public ActionResult DecryptTicket(HttpRequest   collection)
        {
            
            var ticketString = collection["ticket"];
            var user = Mozu.Core.LightweightUserClaims.Parse(ticketString);
            this.ViewData["user"] = user;
            return View("DecryptTicket");
        }
    }
}
