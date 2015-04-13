using System.Threading.Tasks;
using System.Linq;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using DCo = Mozu.CommerceRuntime.Contracts.Orders;
using DCs = Mozu.CommerceRuntime.Contracts.Fulfillment;
using System;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public partial class OrderController
    {
        public class ResendConfirmationEmailArgs
        {
            public string OrderId { get; set; }
        }
        [HttpPostRoute(UriTemplate = "resendconfirmationemail")]
        public async Task<Response<Order>> ResendConfirmationEmail(ResendConfirmationEmailArgs args)
        {
            var action = new DCo.OrderAction()
            {
                ActionName = DCo.OrderAction.OrderActionNameConst.SUBMIT_ORDER
            };

            (await _orderWebApiClient.ResendOrderConfirmationEmail(args.OrderId, action)).ReadAsSync();

            return this.EmptySingle2<Order>();
        }

        public class ResendShipmentFulfillmentEmailArgs
        {
            public string OrderId { get; set; }
            public string PackageId { get; set; }
        }
        [HttpPostRoute(UriTemplate = "shipping/package/resendshipmentemail")]
        public async Task<Response<Order>> ResendShipmentFulfillmentEmail(ResendShipmentFulfillmentEmailArgs args)
        {
            var fullfilmentAciton = new DCs.FulfillmentAction
            {
                ActionName = DCs.FulfillmentAction.FulfillmentActionNameConst.SHIP,
                PackageIds = (new[] { args.PackageId }).ToList()
            };

            await (await _orderWebApiClient.ResendPackageFulfillmentEmail(args.OrderId, fullfilmentAciton)).ReadAsAsync();

            return this.EmptySingle2<Order>();
        }

        public class ResendRefundEmailArgs
        {
            public string OrderId { get; set; }
            public string RefundId { get; set; }
        }
        [HttpPostRoute(UriTemplate = "refunds/resendemail")]
        public async Task<Response<Order>> ResendRefundEmail(ResendRefundEmailArgs args)
        {
            var foo = (await _orderWebApiClient.ResendRefundEmail(args.OrderId, args.RefundId)).ReadAsSync();

            return this.EmptySingle2<Order>();
        }
    }
}