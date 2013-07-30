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
        public class CreatePaymentManualArgs
        {
            public string OrderId { get; set; }
            public string GatewayTransactionId { get; set; }
            public string GatewayInteractionId { get; set; }
            public string ActionName { get; set; }
            public decimal? Amount { get; set; }
            public CardPaymentInformation BillingInfo { get; set; }
            public DateTime? InteractionDate { get; set; }
        }
        /// <summary>
        /// Creates a new payment and performs the "AuthAndCapture" action.
        /// </summary>
		[HttpPostRoute(UriTemplate = "payment/manual/create")]
        public async Task<Response<List<Order>>> CreatePaymentManual(CreatePaymentManualArgs args)
        {
            var action = new DCp.PaymentAction
            {
                ActionName = args.ActionName,
                ISOCurrencyCode = "USD",
                Amount = args.Amount,
                InteractionDate = args.InteractionDate,
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
                // TODO: We should fill in GatewayTransactionId AND GatewayInteractionId, but the contract does not support it.
                ManualGatewayInteraction = new DCp.PaymentGatewayInteraction { GatewayTransactionId = args.GatewayTransactionId }
            };

            var order = (await _orderWebApiClient.CreatePaymentAction(args.OrderId, action)).ReadAsSync();

            return List2(order.Map<Order>());
        }

        public class CapturePaymentManualArgs
        {
            public string OrderId { get; set; }
            public string PaymentId { get; set; }
            public string GatewayInteractionId { get; set; }
            public decimal Amount { get; set; }
            public DateTime? InteractionDate { get; set; }
        }
        [HttpPostRoute(UriTemplate = "payment/manual/capture")]
        public async Task<Response<List<Order>>> CapturePaymentManual(CapturePaymentManualArgs args)
        {
            var action = new DCp.PaymentAction
            {
                ActionName = "CapturePayment",
                ISOCurrencyCode = "USD",
                Amount = args.Amount,
                InteractionDate = args.InteractionDate,
                // TODO: We should fill in GatewayInteractionId, but the contract does not support it.
                ManualGatewayInteraction = new DCp.PaymentGatewayInteraction { GatewayTransactionId = args.GatewayInteractionId }
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(args.OrderId, args.PaymentId, action)).ReadAsSync();

            return List2(order.Map<Order>());
        }

        public class CreditPaymentManualArgs
        {
            public string OrderId { get; set; }
            public string PaymentId { get; set; }
            public string GatewayInteractionId { get; set; }
            public decimal Amount { get; set; }
            public DateTime? InteractionDate { get; set; }
        }
        [HttpPostRoute(UriTemplate = "payment/manual/credit")]
        public async Task<Response<List<Order>>> CreditPaymentManual(CreditPaymentManualArgs args)
        {
            var action = new DCp.PaymentAction
            {
                ActionName = "CreditPayment",
                ISOCurrencyCode = "USD",
                Amount = args.Amount,
                InteractionDate = args.InteractionDate,
                // TODO: We should fill in GatewayInteractionId, but the contract does not support it.
                ManualGatewayInteraction = new DCp.PaymentGatewayInteraction { GatewayTransactionId = args.GatewayInteractionId },
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(args.OrderId, args.PaymentId, action)).ReadAsSync();

            return List2(order.Map<Order>());
        }

        public class VoidPaymentManualArgs
        {
            public string OrderId { get; set; }
            public string PaymentId { get; set; }
            public string GatewayInteractionId { get; set; }
            public DateTime? InteractionDate { get; set; }
        }
        [HttpPostRoute(UriTemplate = "payment/manual/void")]
        public async Task<Response<List<Order>>> VoidPaymentManual(CapturePaymentManualArgs args)
        {
            var action = new DCp.PaymentAction
            {
                ActionName = "VoidPayment",
                ISOCurrencyCode = "USD",
                Amount = args.Amount,
                InteractionDate = args.InteractionDate,
                // TODO: We should fill in GatewayInteractionId, but the contract does not support it.
                ManualGatewayInteraction = new DCp.PaymentGatewayInteraction { GatewayTransactionId = args.GatewayInteractionId },
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(args.OrderId, args.PaymentId, action)).ReadAsSync();

            return List2(order.Map<Order>());
        }

        public class EditTransactionManualArgs
        {
            public string OrderId { get; set; }
            public string PaymentId { get; set; }
            public string TransactionId { get; set; }
            public string GatewayInteractionId { get; set; }
            public CardPaymentInformation BillingInfo { get; set; }
            public decimal Amount { get; set; }
        }
        [HttpPostRoute(UriTemplate = "payment/manual/edittransaction")]
        public async Task<Response<List<Order>>> EditTransactionManual(EditTransactionManualArgs args)
        {
            // TODO: mozu service does not currently support edit transaction.
            throw new NotImplementedException();
        }
    }
}
