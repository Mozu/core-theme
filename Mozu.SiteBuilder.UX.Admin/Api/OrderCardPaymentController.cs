using System;
using System.Collections.Generic;
using System.ServiceModel.Web;
using System.Linq;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using DCp = Mozu.CommerceRuntime.Contracts.Payments;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public partial class OrderController
    {
        public class CapturePaymentArgs
        {
            public OrderPayment Payment { get; set; }
            public decimal Amount { get; set; }
        }
        /// <summary>
        /// Performs the "CapturePayment" action on an authorized payment.
        /// </summary>
        [WebInvoke(Method = "POST", UriTemplate = "payment/capture")]
        public async Task<Response<List<Order>>> CapturePayment(CapturePaymentArgs args)
        {
            // Possible actions can be "AuthAndCapture", "AuthorizePayment", "CapturePayment", "VoidPayment", "CreditPayment", "RequestCheck", "ApplyCheck", "DeclineCheck"
            var action = new DCp.PaymentAction
            {
                ActionName = "CapturePayment",
                ISOCurrencyCode = "USD",
                Amount = args.Amount,
                ReferenceSourcePaymentId = null
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(args.Payment.OrderId, args.Payment.Id, action)).ReadAsSync();

            //_orderWebApiClient.GetPackageLabel
            return List2( order.Map<Order>() );
        }

        public class CreditPaymentArgs
        {
            public OrderPayment Payment { get; set; }
            public decimal Amount { get; set; }
            public string Reason { get; set; }
        }
        /// <summary>
        /// Performs the "CreditPayment" action on a payment where money has been captured.
        /// </summary>
        [WebInvoke(UriTemplate = "payment/credit")]
        public async Task<Response<List<Order>>> CreditPayment(CreditPaymentArgs args)
        {
            // TODO: is referenceInteraction necessary?
            var referenceInteraction = args.Payment.Interactions != null ? args.Payment.Interactions.FirstOrDefault(i => i.InteractionType == "Capture" || i.InteractionType == "AuthorizeAndCapture") : null;

            // Possible actions can be "AuthAndCapture", "AuthorizePayment", "CapturePayment", "VoidPayment", "CreditPayment", "RequestCheck", "ApplyCheck", "DeclineCheck"
            var action = new DCp.PaymentAction
            {
                ActionName = "CreditPayment",
                ISOCurrencyCode = "USD",
                Amount = args.Amount,
                ReferenceSourcePaymentId = null
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(args.Payment.OrderId, args.Payment.Id, action)).ReadAsSync();

            // TODO: we don't currently do anything with the "reason"

            return List2( order.Map<Order>() );
        }

        public class VoidPaymentArgs
        {
            public string OrderId { get; set; }
            public string PaymentId { get; set; }
        }
        /// <summary>
        /// Voids an authorized payment.
        /// </summary>
        [WebInvoke(Method = "POST", UriTemplate = "payment/void")]
        public async Task<Response<List<Order>>> VoidPayment(VoidPaymentArgs args)
        {
            // Possible actions can be "AuthAndCapture", "AuthorizePayment", "CapturePayment", "VoidPayment", "CreditPayment", "RequestCheck", "ApplyCheck", "DeclineCheck"
            var action = new DCp.PaymentAction
            {
                ActionName = "VoidPayment",
                ISOCurrencyCode = "USD",
                Amount = null,
                ReferenceSourcePaymentId = null
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(args.OrderId, args.PaymentId, action)).ReadAsSync();

            return List2( order.Map<Order>() );
        }

        public class CreatePaymentArgs
        {
            public string OrderId { get; set; }
            public decimal Amount { get; set; }
            public CardPaymentInformation BillingInfo { get; set; }
        }
        /// <summary>
        /// Creates a new payment and performs the "AuthAndCapture" action.
        /// </summary>
        [WebInvoke(Method = "POST", UriTemplate = "payment/create")]
        public async Task<Response<List<Order>>> CreatePayment(CreateManualPaymentArgs args)
        {
            var action = new DCp.PaymentAction
            {
                ActionName = "AuthAndCapture",
                ISOCurrencyCode = "USD",
                NewBillingInfo = new DCp.BillingInfo {
                    Card = new DCp.PaymentCard {
                        NameOnCard = args.BillingInfo.NameOnCard,
                        PaymentOrCardType = args.BillingInfo.CardType,
                        CardNumberPartOrMask = args.BillingInfo.CardNumber,
                        ExpireMonth = args.BillingInfo.ExpireMonth,
                        ExpireYear = args.BillingInfo.ExpireYear
                    }
                },
                Amount = args.Amount
            };

            var order = (await _orderWebApiClient.CreatePaymentAction(args.OrderId, action)).ReadAsSync();

            return List2( order.Map<Order>() );
        }

        public class CreateManualPaymentArgs
        {
            public string ActionName { get; set; }
            public string OrderId { get; set; }
            public decimal? Amount { get; set; }
            public CardPaymentInformation BillingInfo { get; set; }
            public string GatewayTransactionId { get; set; }
        }
        /// <summary>
        /// Creates a new payment and performs the "AuthAndCapture" action.
        /// </summary>
        [WebInvoke(Method = "POST", UriTemplate = "payment/createmanual")]
        public async Task<Response<List<Order>>> CreateManualPayment(CreateManualPaymentArgs args)
        {
            var action = new DCp.PaymentAction {
                ActionName = args.ActionName,
                Amount = args.Amount,
                NewBillingInfo = new DCp.BillingInfo {
                    Card = new DCp.PaymentCard {
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
