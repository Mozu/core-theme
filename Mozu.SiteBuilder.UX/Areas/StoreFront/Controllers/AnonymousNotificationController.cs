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

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    public class AnonymousNotificationController : BaseApiController
    {
        private readonly IFulfillmentProxyWebApiClient _fulfillmentProxyClient;

        public AnonymousNotificationController(IFulfillmentProxyWebApiClient fulfillmentProxyClient)
        {
            _fulfillmentProxyClient = fulfillmentProxyClient;
        }

        [HttpGet]
        public async Task<HttpResponseMessage> RenderShipmentView(int shipmentNumber, string orderId)
        {
            var model = (await _fulfillmentProxyClient.CloneWithoutUserClaims().GetShipment(shipmentNumber)).ReadAsSync();

            if (model == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            if (model.OrderId != orderId)
            {
                throw new HttpResponseException(HttpStatusCode.Forbidden);
            }
            var template = SiteContext.Theme.BackOfficeTemplates.SingleOrDefault(x => x.Id.EqualsIgnoreCase("mobile-notification"));
            if (template == null)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Could not find MobileNotification template for the current Theme.");
            }
            return Request.CreateResponse(HttpStatusCode.OK, View(template.Template, model));
        }
    }
}