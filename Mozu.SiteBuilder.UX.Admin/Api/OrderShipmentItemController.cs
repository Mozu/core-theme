using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using Newtonsoft.Json;
using Swagger.Fulfiller.Model;
using DC = Mozu.CommerceRuntime.Contracts.Orders;
using DCp = Mozu.CommerceRuntime.Contracts.Products;

namespace Mozu.SiteBuilder.UX.Admin.Api
{

    public partial class OrderController
    {
        public class ReassignShipmentItemArgs
        {
            public int ShipmentNumber { get; set; }
            public List<ReassignItem> ShipmentItems { get; set; }

        }
        [HttpPutRoute(UriTemplate = "shipment/items/reassign")]
        public Response<ResourceShipment> ReassignShipmentItems(ReassignShipmentItemArgs args)
        {
            var serviceResponse = _fulfillerApiWrapper.ReassignShipmentItems(args.ShipmentNumber, args.ShipmentItems);
            return Single2(serviceResponse);
        }
    }
}
