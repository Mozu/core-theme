using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Mozu.SiteBuilder.UX.Admin.Controllers
{
    public class TestController : Controller
    {
        //
        // GET: /Test/

        public ActionResult Index()
        {
            return View();
        }
        public ActionResult DecryptTicket()
        {
            return  View();
        }
        [HttpPost]
        public ActionResult DecryptTicket(FormCollection collection)
        {
            var ticketString = collection["ticket"];
            var user = Mozu.Core.LightweightUserClaims.Parse(ticketString);
            this.ViewData["user"] = user;
            return View();
        }
    }
}
