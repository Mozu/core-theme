using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.Core.Api.Authorization;
using Mozu.Core.Api.Routing;
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
using Order = Mozu.SiteBuilder.UX.Admin.Api.Models.Order.Order;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public partial class OrderController
    {
        [HttpGetRoute(UriTemplate = "cancel/reasons")]
        public async Task<Response<List<CancelReasonItem>>> GetReasons([FromUri]string Category, [FromUri]bool draft = false)
        {
            var reasons = (await _orderWebApiClient.GetReasons(Category)).ReadAsSync();

            return List2(Mapper.Map<List<CancelReasonItem>>(reasons.Items.OrderBy(x=>x.ReasonCode)), reasons.TotalCount);
        }
        public class CancelOrderArgs
        {
            public string OrderId { get; set; }
            public CanceledReason Reason { get; set; }
        }
        [HttpPutRoute(UriTemplate = "cancel")]
        public async Task<Response<Order>> CancelOrder(CancelOrderArgs args)
        {
            if (args.Reason == null)
            {
                args.Reason = new CanceledReason
                {
                    ReasonCode = "Other",
                    MoreInfo = "CSR cancelling PendingReview order"
                };
            }

            var dcOrder = (await _orderWebApiClient.CancelOrder(args.OrderId, args.Reason)).ReadAsSync();
            return Single2(Mapper.Map<Order>(dcOrder));
        }
    }
}
