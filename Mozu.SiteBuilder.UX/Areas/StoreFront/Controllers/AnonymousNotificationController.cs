using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core.Actions;
using Mozu.Core.Api.Client;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.OAF;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Kibo.Fulfillment.Contracts.Api;
using Microsoft.AspNetCore.Mvc;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    public class AnonymousNotificationController : BaseApiController
    {
        private readonly IShipmentControllerApiClient _shipmentControllerApiClient;

        public AnonymousNotificationController( Kibo.Fulfillment.Contracts.Api.IShipmentControllerApiClient  shipmentControllerApiClient)
        {
            _shipmentControllerApiClient = shipmentControllerApiClient;
        }

        [HttpGet]
        public async Task<IActionResult> RenderShipmentView(int shipmentNumber, string orderId)
        {
            var model = (await _shipmentControllerApiClient.CloneWithoutUserClaims().GetShipmentUsingGET(shipmentNumber)).ReadAsSync();

            if (model == null)
            {
                return NotFound();
            }

            if (model.OrderId != orderId)
            {
                return StatusCode(401);
            }
            var template = SiteContext.Theme.BackOfficeTemplates.SingleOrDefault(x => x.Id.EqualsIgnoreCase("mobile-notification"));
            if (template == null)
            {
                return NotFound( "Could not find MobileNotification template for the current Theme.");
            }
            return  View(template.Template, model);
        }
    }
}