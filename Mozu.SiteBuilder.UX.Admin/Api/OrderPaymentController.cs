using System;
using System.Collections.Generic;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using DCp = Mozu.CommerceRuntime.Contracts.Payments;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public partial class OrderController
    {
        public class CapturePaymentArg
        {
            public OrderPayment Payment { get; set; }
            public decimal Amount { get; set; }
        }
        [WebInvoke(Method = "POST", UriTemplate = "payment/capture")]
        public async Task<Response<List<Order>>> CapturePayment(CapturePaymentArg arg)
        {
            // Possible actions can be "AuthAndCapture", "AuthorizePayment", "CapturePayment", "VoidPayment", "CreditPayment", "RequestCheck", "ApplyCheck", "DeclineCheck"
            var action = new DCp.PaymentAction
            {
                ActionName = "CapturePayment",
                ISOCurrencyCode = "USD",
                Amount = arg.Amount,
                ReferenceSourcePaymentId = null
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(arg.Payment.OrderId, arg.Payment.Id, action)).ReadAsSync();

            //_orderWebApiClient.GetPackageLabel
            return List2(order.Map<Order>());
        }

        public class CreditPaymentArg
        {
            public OrderPayment Payment { get; set; }
            public decimal Amount { get; set; }
            public string Reason { get; set; }
        }
        [WebInvoke(UriTemplate = "payment/credit")]
        public async Task<Response<List<Order>>> CreditPayment(CreditPaymentArg args)
        {
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

            return List2(order.Map<Order>());
        }

        public class VoidPaymentArg
        {
            public string OrderId { get; set; }
            public string PaymentId { get; set; }
        }
        [WebInvoke(Method = "POST", UriTemplate = "payment/void")]
        public async Task<Response<List<Order>>> VoidPayment(string orderId, string paymentId)
        {
            // Possible actions can be "AuthAndCapture", "AuthorizePayment", "CapturePayment", "VoidPayment", "CreditPayment", "RequestCheck", "ApplyCheck", "DeclineCheck"
            var action = new DCp.PaymentAction
            {
                ActionName = "VoidPayment",
                ISOCurrencyCode = "USD",
                Amount = null,
                ReferenceSourcePaymentId = null
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(orderId, paymentId, action)).ReadAsSync();

            return List2(order.Map<Order>());
        }
    }
}
