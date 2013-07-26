using System;
using System.Collections.Generic;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using DCp = Mozu.CommerceRuntime.Contracts.Payments;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public partial class OrderController
    {
        public class CreateManualPaymentArgs
        {
            public string OrderId { get; set; }
            public string GatewayTransactionId { get; set; }
            public string GatewayInteractionId { get; set; }
            public string ActionName { get; set; }
            public decimal? Amount { get; set; }
            public CardPaymentInformation BillingInfo { get; set; }
            
        }
        /// <summary>
        /// Creates a new payment and performs the "AuthAndCapture" action.
        /// </summary>
		[HttpGetRoute(UriTemplate = "payment/createmanual")]
        public async Task<Response<List<Order>>> CreateManualPayment(CreateManualPaymentArgs args)
        {
            var action = new DCp.PaymentAction
            {
                ActionName = args.ActionName,
                Amount = args.Amount,
                NewBillingInfo = new DCp.BillingInfo
                {
                    Card = new DCp.PaymentCard
                    {
                        NameOnCard = args.BillingInfo.NameOnCard,
                        PaymentOrCardType = args.BillingInfo.CardType,
                        CardNumberPartOrMask = args.BillingInfo.CardNumber,
                        ExpireMonth = args.BillingInfo.ExpireMonth,
                        ExpireYear = args.BillingInfo.ExpireYear
                    }
                },
                ManualGatewayInteraction = new DCp.PaymentGatewayInteraction { GatewayTransactionId = args.GatewayTransactionId }
            };

            var order = (await _orderWebApiClient.CreatePaymentAction(args.OrderId, action)).ReadAsSync();

            return List2(order.Map<Order>());
        }
    }
}
