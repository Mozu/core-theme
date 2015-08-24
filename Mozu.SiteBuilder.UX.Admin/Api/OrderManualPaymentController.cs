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
            public int? GatewayInteractionId { get; set; }
            public string ActionName { get; set; }
            public decimal? Amount { get; set; }
            public CardPaymentInformation BillingInfo { get; set; }
            public DateTime? InteractionDate { get; set; }
        }
        /// <summary>
        /// Creates a new payment and performs the "AuthAndCapture" action.
        /// </summary>
        [HttpPostRoute(UriTemplate = "payment/manual/create")]
        public async Task<Response<Order>> CreatePaymentManual(CreatePaymentManualArgs args)
        {
            var action = new DCp.PaymentAction
            {
                ActionName = args.ActionName,
                CurrencyCode = "USD",
                Amount = args.Amount,
                InteractionDate = args.InteractionDate,
                NewBillingInfo = new DCp.BillingInfo
                {
                    PaymentType = DCp.PaymentTypeConst.CREDIT_CARD,
                    Card = new DCp.PaymentCard
                    {
                        NameOnCard = args.BillingInfo.NameOnCard,
                        PaymentOrCardType = args.BillingInfo.CardType,
                        CardNumberPartOrMask = args.BillingInfo.CardNumber,
                        ExpireMonth = args.BillingInfo.ExpireMonth,
                        ExpireYear = args.BillingInfo.ExpireYear
                    }
                },
                ManualGatewayInteraction = new DCp.PaymentGatewayInteraction { GatewayTransactionId = args.GatewayTransactionId, GatewayInteractionId = args.GatewayInteractionId }
            };

            var order = (await _orderWebApiClient.CreatePaymentAction(args.OrderId, action)).ReadAsSync();

            return Single2( order.Map<Order>() );
        }

        public class CapturePaymentManualArgs
        {
            public string OrderId { get; set; }
            public string PaymentId { get; set; }
            public int? GatewayInteractionId { get; set; }
            public decimal Amount { get; set; }
            public DateTime? InteractionDate { get; set; }
        }
        [HttpPostRoute(UriTemplate = "payment/manual/capture")]
        public async Task<Response<Order>> CapturePaymentManual(CapturePaymentManualArgs args)
        {
            var action = new DCp.PaymentAction
            {
                ActionName = "CapturePayment",
                CurrencyCode = "USD",
                Amount = args.Amount,
                InteractionDate = args.InteractionDate,
                // TODO: We should fill in GatewayInteractionId, but the contract does not support it.
                ManualGatewayInteraction = new DCp.PaymentGatewayInteraction { GatewayInteractionId = args.GatewayInteractionId }
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(args.OrderId, args.PaymentId, action)).ReadAsSync();

            return Single2( order.Map<Order>() );
        }

        public class CreditPaymentManualArgs
        {
            public string OrderId { get; set; }
            public string PaymentId { get; set; }
            public int? GatewayInteractionId { get; set; }
            public decimal Amount { get; set; }
            public DateTime? InteractionDate { get; set; }
        }
        [HttpPostRoute(UriTemplate = "payment/manual/credit")]
        public async Task<Response<Order>> CreditPaymentManual(CreditPaymentManualArgs args)
        {
            var action = new DCp.PaymentAction
            {
                ActionName = "CreditPayment",
                CurrencyCode = "USD",
                Amount = args.Amount,
                InteractionDate = args.InteractionDate,
                // TODO: We should fill in GatewayInteractionId, but the contract does not support it.
                ManualGatewayInteraction = new DCp.PaymentGatewayInteraction { GatewayInteractionId = args.GatewayInteractionId },
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(args.OrderId, args.PaymentId, action)).ReadAsSync();

            return Single2( order.Map<Order>() );
        }

        public class VoidPaymentManualArgs
        {
            public string OrderId { get; set; }
            public string PaymentId { get; set; }
            public int? GatewayInteractionId { get; set; }
            public DateTime? InteractionDate { get; set; }
        }
        [HttpPostRoute(UriTemplate = "payment/manual/void")]
        public async Task<Response<Order>> VoidPaymentManual(VoidPaymentManualArgs args)
        {
            var action = new DCp.PaymentAction
            {
                ActionName = "VoidPayment",
                CurrencyCode = "USD",
                InteractionDate = args.InteractionDate,
                // TODO: We should fill in GatewayInteractionId, but the contract does not support it.
                ManualGatewayInteraction = new DCp.PaymentGatewayInteraction { GatewayInteractionId = args.GatewayInteractionId },
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(args.OrderId, args.PaymentId, action)).ReadAsSync();

            return Single2( order.Map<Order>() );
        }

        

        public class DeclinePaymentArgs
        {
            public string OrderId { get; set; }
            public string PaymentId { get; set; }
            public string DeclineCode { get; set; }
            public string Comments { get; set; }
            public int? GatewayInteractionId { get; set; }
            public DateTime? InteractionDate { get; set; }

        }

        [HttpPostRoute(UriTemplate = "payment/manual/decline")]
        public async Task<Response<Order>> DeclinePaymentManual(DeclinePaymentArgs args)
        {

            // TODO: the contract doesn't support "decline code" or "comments" and it should soon!
            var action = new DCp.PaymentAction
            {
                ActionName = "DeclinePayment",
                CurrencyCode = "USD",
                InteractionDate = args.InteractionDate,
                ManualGatewayInteraction = new DCp.PaymentGatewayInteraction { GatewayInteractionId = args.GatewayInteractionId }
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(args.OrderId, args.PaymentId, action)).ReadAsSync();

            return Single2(order.Map<Order>());
        }


        public class RollbackTransactionArgs
        {
            public string OrderId { get; set; }
            public string PaymentId { get; set; }
            public string ActionName { get; set; }
        }
        [HttpPostRoute(UriTemplate = "payment/manual/rollback")]
        public async Task<Response<Order>> RollbackTransaction(RollbackTransactionArgs args)
        {
            var action = new DCp.PaymentAction
            {
                ActionName = args.ActionName
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(args.OrderId, args.PaymentId, action)).ReadAsSync();

            return Single2( order.Map<Order>() );
        }
    }
}
