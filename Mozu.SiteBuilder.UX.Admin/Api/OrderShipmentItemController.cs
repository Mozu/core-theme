using Mozu.Core.Api.Routing;
using Mozu.Fulfillment.Contracts.Model;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using DC = Mozu.CommerceRuntime.Contracts.Orders;
using DCp = Mozu.CommerceRuntime.Contracts.Products;
using DCs = Mozu.CommerceRuntime.Contracts.Fulfillment;

namespace Mozu.SiteBuilder.UX.Admin.Api
{

    public partial class OrderController
    {
        public class ReassignShipmentItemArgs
        {
            public int ShipmentNumber { get; set; }
            public List<ReassignItem> ShipmentItems { get; set; }

        }
        [HttpPostRoute(UriTemplate = "shipment/items/reassign")]
        public Response<ResourceOfShipment> ReassignShipmentItems(ReassignShipmentItemArgs args)
        {
            var serviceResponse = _fulfillerApiWrapper.ReassignShipmentItems(args.ShipmentNumber, args.ShipmentItems);
            return Single2(serviceResponse);
        }


        public class CancelShipmentItemArgs
        {
            public int ShipmentNumber { get; set; }
            public List<CanceledItem> CanceledItems { get; set; }

        }
        [HttpPostRoute(UriTemplate = "shipment/items/cancel")]
        public Response<ResourceOfShipment> CancelShipmentItems(CancelShipmentItemArgs args)
        {
            var serviceResponse = _fulfillerApiWrapper.CancelItems(args.CanceledItems, args.ShipmentNumber);
            return Single2(serviceResponse);
        }

        public class MoveItemToBackOrderArgs
        {
            public int? ShipmentNumber { get; set; }
            public List<DCs.BackorderItem> BackorderItems { get; set; }
        }
        [HttpPostRoute(UriTemplate = "shipment/moveItemToBackOrder")]
        public async Task<Response<List<DCs.Shipment>>> MoveItemToBackOrder(MoveItemToBackOrderArgs args)
        {
            var shipment = (await _orderWebApiClient.MoveItemToBackOrder(args.ShipmentNumber, args.BackorderItems)).ReadAsSync();
            return List2(shipment);
        }

        public class BackorderItemsUpdateArgs
        {
            public int? ShipmentNumber { get; set; }
            public BackorderItemsRequest BackorderItemsRequest { get; set; }
        }
        [HttpPostRoute(UriTemplate = "shipment/backorderItemsUpdate")]
        public Response<ResourceOfShipment> BackorderItemsUpdate(BackorderItemsUpdateArgs args)
        {
            var serviceResponse = _fulfillerApiWrapper.BackorderItemsUpdate(args.BackorderItemsRequest, args.ShipmentNumber);
            return Single2(serviceResponse);
        }
    }
}
