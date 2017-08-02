using Mozu.Core.Actions;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Filters;
using Newtonsoft.Json.Linq;
using System.Net.Http;
using System.Web.Http;
using Mozu.SiteBuilder.Mvc.OAF;
using System.Threading;
using Mozu.Location.Contracts.Clients;
using Mozu.Core.Api.Routing;
using Mozu.Core.Api.Session;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
    [DataViewModeEnforcement]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController, Priority = ActionFilterConstants.GlobalPageBeforePriority)]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageAfterAction, executionType: ActionExtensionExecutionTypes.AfterController, Priority = ActionFilterConstants.GlobalPageAfterPriority)]
    public class LocationController : BaseApiController
    {
        ILocationRuntimeWebApiClient _locationRuntimeWebApiClient;
        IMozuSession _session;
        public LocationController(Mozu.Location.Contracts.Clients.ILocationRuntimeWebApiClient locationRuntimeWebApiClient, IMozuSession session )
        {
            _locationRuntimeWebApiClient = locationRuntimeWebApiClient;
            _session = session;
        }
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
        public async Task<Mozu.Location.Contracts.Location> Set(string code)
        {
            Mozu.Location.Contracts.Location location = null;
            if (!string.IsNullOrWhiteSpace(code))
            {
                location = (await _locationRuntimeWebApiClient.GetLocation(code)).ReadAsSync();
            }
            await _session.SetValueAsync(Mozu.Core.Constants.Session.LOCATION_CODE_KEY, location?.Code);

            return location;

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
