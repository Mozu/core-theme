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
        [WebInvoke(Method = "POST", UriTemplate = "payment/capture")]
        public async Task<Response<List<Order>>> CapturePayment(OrderPayment payment, decimal amount)
        {
            // Possible actions can be "AuthAndCapture", "AuthorizePayment", "CapturePayment", "VoidPayment", "CreditPayment", "RequestCheck", "ApplyCheck", "DeclineCheck"
            var action = new DCp.PaymentAction
            {
                ActionName = "CapturePayment",
                ISOCurrencyCode = "USD",
                Amount = amount,
                ReferenceSourcePaymentId = null
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(payment.OrderId, payment.Id, action)).ReadAsSync();

            //_orderWebApiClient.GetPackageLabel
            return List2(order.Map<Order>());
        }

        [WebInvoke(Method = "POST", UriTemplate = "payment/credit")]
        public async Task<Response<List<Order>>> CreditPayment(OrderPayment payment, decimal amount)
        {
            // Possible actions can be "AuthAndCapture", "AuthorizePayment", "CapturePayment", "VoidPayment", "CreditPayment", "RequestCheck", "ApplyCheck", "DeclineCheck"
            var action = new DCp.PaymentAction
            {
                ActionName = "CreditPayment",
                ISOCurrencyCode = "USD",
                Amount = amount,
                ReferenceSourcePaymentId = null
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(payment.OrderId, payment.Id, action)).ReadAsSync();

            return List2(order.Map<Order>());
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
