using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using DCs = Mozu.CommerceRuntime.Contracts.Fulfillment;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public partial class OrderController
    {
        public class RedeliverDigitalPackageArgs
        {
            public string OrderId { get; set; }
            public List<string> DigitalPackageIds { get; set; }
        }
        [HttpPostRoute(UriTemplate = "fulfillment/digitalpackage/resend")]
        public async Task<Response<Order>> RedeliverDigitalPackage(RedeliverDigitalPackageArgs args)
        {
            var dcOrder = (await _orderWebApiClient.PerformFulfillmentAction(args.OrderId, new DCs.FulfillmentAction() { ActionName = DCs.FulfillmentAction.FulfillmentActionNameConst.FULFILL, DigitalPackageIds = args.DigitalPackageIds })).ReadAsSync();

            return Single2(dcOrder.Map<Order>());
        }
    }
}
