using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Net.Http;
using Mozu.CommerceRuntime.Contracts.Carts;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.UX.Controllers;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{


    [ContextInitialization]
    [ErrorFormattingActionFilter]
    public class LocationController : BaseApiController
    {
        //
        // GET: /StoreFront/Locations/

        [HttpGet]
        public ActionResult Index()
        {
            return View("location");
        }

        [HttpGet]
        public ActionResult ProductGet(string productCode)
        {
            return View("product-location");
        }


        [HttpPost]
        public ActionResult Product()
        {
            var form = this.Request.Content.ReadAsFormDataAsync().Result;
            var prod = JObject.Parse(form["item"]);
            return View("product-location", prod);
        }

    }
}
