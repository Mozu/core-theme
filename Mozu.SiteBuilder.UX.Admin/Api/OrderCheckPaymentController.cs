using System;
using System.Collections.Generic;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using DCcore = Mozu.Core.Api.Contracts;
using DCp = Mozu.CommerceRuntime.Contracts.Payments;
using ACTIONS = Mozu.CommerceRuntime.Contracts.Payments.PaymentAction.PaymentActionNameConst;

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
        [HttpPostRoute(UriTemplate = "payment/requestcheck")]
        public async Task<Response<Order>> RequestCheck(RequestCheckArgs args)
        {
            var action = new DCp.PaymentAction
            {
                ActionName = ACTIONS.REQUEST_CHECK,
                NewBillingInfo = new DCp.BillingInfo
                {
                    PaymentType = DCp.PaymentTypeConst.CHECK,
                    BillingContact = new DCcore.Contact
                    {
                        FirstName = args.FirstName,
                        LastNameOrSurname = args.LastName
                    }
                },
                Amount = args.Amount
            };
            var order = (await _orderWebApiClient.CreatePaymentAction(args.OrderId, action)).ReadAsSync();

            return Single2(order.Map<Order>());
        }

        public class ApplyCheckArgs
        {
            public string OrderId { get; set; }
            public string PaymentId { get; set; }
            public string CheckNumber { get; set; }
            public decimal Amount { get; set; }
        }
        [HttpPostRoute(UriTemplate = "payment/applycheck")]
        public async Task<Response<Order>> ApplyCheck(ApplyCheckArgs args)
        {
            var action = new DCp.PaymentAction
            {
                ActionName = ACTIONS.CAPTURE_PAYMENT,

                CurrencyCode = "USD",
                CheckNumber = args.CheckNumber,
                Amount = args.Amount
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(args.OrderId, args.PaymentId, action)).ReadAsSync();

            return Single2(order.Map<Order>());
        }

        public class DeclineCheckArgs
        {
            public string OrderId { get; set; }
            public string PaymentId { get; set; }
            public string CheckNumber { get; set; }
        }
        [HttpPostRoute(UriTemplate = "payment/declinecheck")]
        public async Task<Response<Order>> DeclineCheck(DeclineCheckArgs args)
        {
            var action = new DCp.PaymentAction
            {
                ActionName = ACTIONS.DECLINE_PAYMENT,
                CurrencyCode = "USD",
                CheckNumber = args.CheckNumber
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(args.OrderId, args.PaymentId, action)).ReadAsSync();

            return Single2(order.Map<Order>());
        }
    }
}
