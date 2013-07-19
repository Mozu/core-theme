using System;
using System.Collections.Generic;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using DCcore = Mozu.Core.Api.Contracts;
using DCp = Mozu.CommerceRuntime.Contracts.Payments;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public partial class OrderController
    {
        public class RequestCheckArgs
        {
            public string OrderId { get; set; }
            public decimal Amount { get; set; }
            public string FirstName { get; set; }
            public string LastName { get; set; }
        }
        [WebInvoke(Method = "POST", UriTemplate = "payment/requestcheck")]
        public async Task<Response<List<Order>>> RequestCheck(RequestCheckArgs args)
        {
            var action = new DCp.PaymentAction { 
                ActionName = "RequestCheck",
                NewBillingInfo = new DCp.BillingInfo {
                    PaymentType = DCp.PaymentType.Check,
                    BillingContact = new DCcore.Contact {
                        FirstName = args.FirstName,
                        LastNameOrSurname = args.LastName
                    }
                },
                Amount = args.Amount
            };
            var order = (await _orderWebApiClient.CreatePaymentAction(args.OrderId, action)).ReadAsSync();

            return List2(order.Map<Order>());
        }

        public class ApplyCheckArgs
        {
            public string OrderId { get; set; }
            public OrderPayment Payment { get; set; }
            public string CheckNumber { get; set; }
            public decimal Amount { get; set; }
        }
        [WebInvoke(Method = "POST", UriTemplate = "payment/applycheck")]
        public async Task<Response<List<Order>>> ApplyCheck(ApplyCheckArgs args)
        {
            var action = new DCp.PaymentAction
            {
                ActionName = "ApplyCheck",
                
                ISOCurrencyCode = "USD",
                CheckNumber = args.CheckNumber,
                Amount = args.Amount,
                ReferenceSourcePaymentId = null
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(args.OrderId, args.Payment.Id, action)).ReadAsSync();

            return List2(order.Map<Order>());
        }

        public class DeclineCheckArgs
        {
            public string OrderId { get; set; }
            public OrderPayment Payment { get; set; }
            public string CheckNumber { get; set; }
        }
        [WebInvoke(Method = "POST", UriTemplate = "payment/declinecheck")]
        public async Task<Response<List<Order>>> DeclineCheck(ApplyCheckArgs args)
        {
            var action = new DCp.PaymentAction
            {
                ActionName = "ApplyCheck",
                ISOCurrencyCode = "USD",
                CheckNumber = args.CheckNumber,
                Amount = args.Amount,
                ReferenceSourcePaymentId = null
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(args.OrderId, args.Payment.Id, action)).ReadAsSync();

            return List2(order.Map<Order>());
        }
    }
}
