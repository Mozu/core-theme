using System.Threading.Tasks;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using DC = Mozu.CommerceRuntime.Contracts.Refunds;
using DCp = Mozu.CommerceRuntime.Contracts.Payments;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public partial class OrderController
    {
        public class CreateRefundArgs
        {
            public string OrderId { get; set; }
            public decimal Amount { get; set; }
            public string Reason { get; set; }
            public string PaymentId { get; set; }
        }

        /// <summary>
        /// Create a refund on this order.
        /// Optionally attach it to an existing payment, otherwise a new store credit will be created.
        /// </summary>
        [HttpPostRoute(UriTemplate = "refunds")]
        //public Response<Order> CreateRefund360NoContract(CreateRefundArgs args) { return EmptySingle2<Order>(); }
        public async Task<Response<DC.Refund>> CreateRefund(CreateRefundArgs args)
        {
            var dcRefund = new DC.Refund {
                OrderId = args.OrderId,
                Amount = args.Amount,
                Reason = args.Reason
            };
            if (args.PaymentId != null)
            {
                dcRefund.Payment = new DCp.Payment { Id = args.PaymentId };
            }
            var retRefund = (await _orderWebApiClient.CreateRefund(args.OrderId, dcRefund)).ReadAsSync();
        
            return Single2(retRefund);
        }
    }
}