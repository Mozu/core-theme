using Mozu.Core.Api.Routing;
using Kibo.Fulfillment.Contracts.Model;
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
            public ReassignItemsRequest ReassignItemsRequest { get; set; }

        }
        [HttpPostRoute(UriTemplate = "shipment/items/reassign")]
        public async Task<Response<ResourceOfShipment>> ReassignShipmentItems(ReassignShipmentItemArgs args)
        {
            var serviceResponse = (await _fulfillmentProxyClient.ReassignShipmentItems(args.ShipmentNumber, args.ReassignItemsRequest)).ReadAsSync();
            return Single2(serviceResponse);
        }


        public class CancelShipmentItemArgs
        {
            public int ShipmentNumber { get; set; }
            public CancelItemsRequest CancelItemsRequest { get; set; }

        }
        [HttpPostRoute(UriTemplate = "shipment/items/cancel")]
        public async Task<Response<ResourceOfShipment>> CancelShipmentItems(CancelShipmentItemArgs args)
        {
            var serviceResponse = (await _fulfillmentProxyClient.CancelItems(args.ShipmentNumber, args.CancelItemsRequest)).ReadAsSync();
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
            public BackorderItemsUpdateRequest BackorderItemsRequest { get; set; }
        }
        [HttpPostRoute(UriTemplate = "shipment/backorderItemsUpdate")]
        public async Task<Response<ResourceOfShipment>> BackorderItemsUpdate(BackorderItemsUpdateArgs args)
        {
            var serviceResponse = (await _fulfillmentProxyClient.BackorderItemsUpdate(args.ShipmentNumber, args.BackorderItemsRequest)).ReadAsSync();
            return Single2(serviceResponse);
        }

        public class PickupItemsRequestArgs
        {
            public int? ShipmentNumber { get; set; }
            public PickupItemsRequest PickupItemsRequest { get; set; }
        }
        [HttpPostRoute(UriTemplate = "shipment/pickupItems")]
        public async Task<Response<ResourceOfShipment>> PickupItems(PickupItemsRequestArgs args)
        {
            var serviceResponse = (await _fulfillmentProxyClient.PickupItems(args.PickupItemsRequest,args.ShipmentNumber)).ReadAsSync();
            return Single2(serviceResponse);
        }

        public class TransferShipmentItemsArgs
        {
            public int? ShipmentNumber { get; set; }
            public TransferItemsRequest TransferItemsRequest { get; set; }
        }
        [HttpPutRoute(UriTemplate = "shipment/transferredItems")]
        public async Task<Response<ResourceOfShipment>> TransferShipmentItems(TransferShipmentItemsArgs args)
        {
            var serviceResponse = (await _fulfillmentProxyClient.TransferShipmentItems(args.ShipmentNumber, args.TransferItemsRequest)).ReadAsSync();
            return Single2(serviceResponse);
        }
    }
}
