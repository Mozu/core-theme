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
            return List2( order.Map<Order>() );
        }



        [WebInvoke(Method = "POST", UriTemplate = "payment/create")]
        public async Task<Response<List<Order>>> CreatePayment(CapturePaymentArg arg)
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
        public async Task<Response<List<Order>>> CreditPayment(CreditPaymentArg arg)
        {
            // TODO: is referenceInteraction necessary?
            var referenceInteraction = arg.Payment.Interactions != null ? arg.Payment.Interactions.FirstOrDefault(i => i.InteractionType == "Capture" || i.InteractionType == "AuthorizeAndCapture") : null;

            // Possible actions can be "AuthAndCapture", "AuthorizePayment", "CapturePayment", "VoidPayment", "CreditPayment", "RequestCheck", "ApplyCheck", "DeclineCheck"
            var action = new DCp.PaymentAction
            {
                ActionName = "CreditPayment",
                ISOCurrencyCode = "USD",
                Amount = arg.Amount,
                ReferenceSourcePaymentId = null
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(arg.Payment.OrderId, arg.Payment.Id, action)).ReadAsSync();

            // TODO: we don't currently do anything with the "reason"

            return List2( order.Map<Order>() );
        }

        public class VoidPaymentArg
        {
            public string OrderId { get; set; }
            public string PaymentId { get; set; }
        }
        [WebInvoke(Method = "POST", UriTemplate = "payment/void")]
        public async Task<Response<List<Order>>> VoidPayment(VoidPaymentArg arg)
        {
            // Possible actions can be "AuthAndCapture", "AuthorizePayment", "CapturePayment", "VoidPayment", "CreditPayment", "RequestCheck", "ApplyCheck", "DeclineCheck"
            var action = new DCp.PaymentAction
            {
                ActionName = "VoidPayment",
                ISOCurrencyCode = "USD",
                Amount = null,
                ReferenceSourcePaymentId = null
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(arg.OrderId, arg.PaymentId, action)).ReadAsSync();

            return List2( order.Map<Order>() );
        }

        public class RequestCheckArgs
        {
            public string OrderId { get; set; }
        }
        [WebInvoke(Method = "POST", UriTemplate = "payment/requestcheck")]
        public async Task<Response<List<Order>>> RequestCheck(RequestCheckArgs arg)
        {
            var order = (await _orderWebApiClient.CreatePaymentAction(arg.OrderId, new DCp.PaymentAction { ActionName = "RequestCheck" })).ReadAsSync();

            return List2( order.Map<Order>() );
        }

        public class ApplyCheckArgs
        {
            public string OrderId { get; set; }
            public OrderPayment Payment { get; set; }
            public string CheckNumber { get; set; }
            public decimal Amount { get; set; }
        }
        [WebInvoke(Method = "POST", UriTemplate = "payment/applycheck")]
        public async Task<Response<List<Order>>> ApplyCheck(ApplyCheckArgs arg)
        {
            var action = new DCp.PaymentAction
            {
                ActionName = "ApplyCheck",
                ISOCurrencyCode = "USD",
                CheckNumber = arg.CheckNumber,
                Amount = arg.Amount,
                ReferenceSourcePaymentId = null
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(arg.OrderId, arg.Payment.Id, action)).ReadAsSync();
            
            return List2( order.Map<Order>() );
        }

        public class DeclineCheckArgs
        {
            public string OrderId { get; set; }
            public OrderPayment Payment { get; set; }
            public string CheckNumber { get; set; }
        }
        [WebInvoke(Method = "POST", UriTemplate = "payment/declinecheck")]
        public async Task<Response<List<Order>>> DeclineCheck(ApplyCheckArgs arg)
        {
            var action = new DCp.PaymentAction
            {
                ActionName = "ApplyCheck",
                ISOCurrencyCode = "USD",
                CheckNumber = arg.CheckNumber,
                Amount = arg.Amount,
                ReferenceSourcePaymentId = null
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(arg.OrderId, arg.Payment.Id, action)).ReadAsSync();

            return List2( order.Map<Order>() );
        }
    }
}
