using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Filters;
using Newtonsoft.Json.Linq;
using System.Net.Http;
using System.Web.Http;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
    [DataViewModeEnforcement]
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
