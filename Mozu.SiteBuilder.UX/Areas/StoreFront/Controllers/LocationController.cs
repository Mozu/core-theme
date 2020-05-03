using Microsoft.AspNetCore.Mvc;
using Mozu.Core.Actions;
using Mozu.Core.Api.Session;
using Mozu.Location.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.OAF;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Filters;
using Newtonsoft.Json.Linq;
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
        public IActionResult Index()
        {
            return View("location");
        }

        [HttpGet]
        public IActionResult ProductGet(string productCode)
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
            await _session.SetValueAsync(Mozu.Core.Constants.Session.PURCHASE_LOCATION_KEY, location?.Code);

            return location;
        }

        [HttpPost]
        public IActionResult Product()
        {
            var form = Request.Form;
            var prod = JObject.Parse(form["item"]);
            return View("product-location", prod);
        }
    }
}
