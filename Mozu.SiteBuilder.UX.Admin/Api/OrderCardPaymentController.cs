using System;
using System.Collections.Generic;
using System.ServiceModel.Web;
using System.Linq;
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
        public class CapturePaymentArgs
        {
            public string OrderId { get; set; }
            public string PaymentId { get; set; }
            public decimal Amount { get; set; }
        }
        /// <summary>
        /// Performs the "CapturePayment" action on an authorized payment.
        /// </summary>
        [HttpPostRoute(UriTemplate = "payment/capture")]
        public async Task<Response<Order>> CapturePayment(CapturePaymentArgs args)
        {
            // Possible actions can be "AuthAndCapture", "AuthorizePayment", "CapturePayment", "VoidPayment", "CreditPayment", "RequestCheck", "ApplyCheck", "DeclineCheck"
            var action = new DCp.PaymentAction
            {
                ActionName = "CapturePayment",
//              if not provided, commerceruntime defers to what's provisioned for the tenant
                CurrencyCode = SbApiContext.CurrencyCode,
                Amount = args.Amount,
                ReferenceSourcePaymentId = null
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(args.OrderId, args.PaymentId, action)).ReadAsSync();

            //_orderWebApiClient.GetPackageLabel
            return Single2( order.Map<Order>() );
        }


        /// <summary>
        /// Performs the "CapturePayment" action on an authorized payment.
        /// </summary>
        [HttpPostRoute(UriTemplate = "payment/authandcapture")]
        public async Task<Response<Order>> AuthAndCapture(CapturePaymentArgs args)
        {
            // Possible actions can be "AuthAndCapture", "AuthorizePayment", "CapturePayment", "VoidPayment", "CreditPayment", "RequestCheck", "ApplyCheck", "DeclineCheck"
            var action = new DCp.PaymentAction
            {
                ActionName = "AuthAndCapture",
                CurrencyCode = SbApiContext.CurrencyCode,
                Amount = args.Amount,
                ReferenceSourcePaymentId = null
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(args.OrderId, args.PaymentId, action)).ReadAsSync();

            //_orderWebApiClient.GetPackageLabel
            return Single2(order.Map<Order>());
        }


        /// <summary>
        /// Performs the "CapturePayment" action on an authorized payment.
        /// </summary>
        [HttpPostRoute(UriTemplate = "payment/authorize")]
        public async Task<Response<Order>> AuthorizePayment(CapturePaymentArgs args)
        {
            // Possible actions can be "AuthAndCapture", "AuthorizePayment", "CapturePayment", "VoidPayment", "CreditPayment", "RequestCheck", "ApplyCheck", "DeclineCheck"
            var action = new DCp.PaymentAction
            {
                ActionName = "AuthorizePayment",
                CurrencyCode = SbApiContext.CurrencyCode,
                Amount = args.Amount,
                ReferenceSourcePaymentId = null
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(args.OrderId, args.PaymentId, action)).ReadAsSync();

            //_orderWebApiClient.GetPackageLabel
            return Single2(order.Map<Order>());
        }

        public class CreditPaymentArgs
        {
            public string OrderId { get; set; }
            public string PaymentId { get; set; }
            public decimal Amount { get; set; }
            public string Reason { get; set; }
        }
        /// <summary>
        /// Performs the "CreditPayment" action on a payment where money has been captured.
        /// </summary>
        [HttpPostRoute(UriTemplate = "payment/credit")]
        public async Task<Response<Order>> CreditPayment(CreditPaymentArgs args)
        {
            // Possible actions can be "AuthAndCapture", "AuthorizePayment", "CapturePayment", "VoidPayment", "CreditPayment", "RequestCheck", "ApplyCheck", "DeclineCheck"
            var action = new DCp.PaymentAction
            {
                ActionName = "CreditPayment",
                CurrencyCode = SbApiContext.CurrencyCode,
                Amount = args.Amount
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(args.OrderId, args.PaymentId, action)).ReadAsSync();

            // TODO: we don't currently do anything with the "reason"

            return Single2( order.Map<Order>() );
        }

        public class VoidPaymentArgs
        {
            public string OrderId { get; set; }
            public string PaymentId { get; set; }
        }
        /// <summary>
        /// Voids an authorized payment.
        /// </summary>
        [HttpPostRoute(UriTemplate = "payment/void")]
        public async Task<Response<Order>> VoidPayment(VoidPaymentArgs args)
        {
            // Possible actions can be "AuthAndCapture", "AuthorizePayment", "CapturePayment", "VoidPayment", "CreditPayment", "RequestCheck", "ApplyCheck", "DeclineCheck"
            var action = new DCp.PaymentAction
            {
                ActionName = "VoidPayment",
                CurrencyCode = SbApiContext.CurrencyCode,
                Amount = null,
                ReferenceSourcePaymentId = null
            };

            var order = (await _orderWebApiClient.PerformPaymentAction(args.OrderId, args.PaymentId, action)).ReadAsSync();

            return Single2( order.Map<Order>() );
        }

        public class CreatePaymentArgs
        {
            public string OrderId { get; set; }
            public decimal Amount { get; set; }
            public CardPaymentInformation BillingInfo { get; set; }
            public Contact BillingContact { get; set; }
        }
        /// <summary>
        /// Creates a new payment and performs the "AuthAndCapture" action.
        /// </summary>
        [HttpPostRoute(UriTemplate = "payment/create")]
        public async Task<Response<Order>> CreatePayment(CreatePaymentArgs args)
        {
            var action = new DCp.PaymentAction
            {
                // TODO: should determine ActionName from store preferences
                ActionName = /*"AuthAndCapture"*/ "AuthorizePayment",
                CurrencyCode = SbApiContext.CurrencyCode,
                NewBillingInfo = new DCp.BillingInfo
                {
                    Card = new DCp.PaymentCard
                    {
                        PaymentServiceCardId = args.BillingInfo.PaymentServiceCardId,
                        NameOnCard = args.BillingInfo.NameOnCard,
                        PaymentOrCardType = args.BillingInfo.CardType,
                        CardNumberPartOrMask = args.BillingInfo.CardNumber,
                        ExpireMonth = args.BillingInfo.ExpireMonth,
                        ExpireYear = args.BillingInfo.ExpireYear,
                        IsCardInfoSaved = false,
                        IsUsedRecurring = false
                    },
                    IsSameBillingShippingAddress = args.BillingInfo.IsSameBillingShippingAddress,
                    BillingContact = args.BillingContact.Map<Core.Api.Contracts.Contact>(),
                    PaymentType = DCp.PaymentTypeConst.CREDIT_CARD
                },
                Amount = args.Amount
            };

            var order = (await _orderWebApiClient.CreatePaymentAction(args.OrderId, action)).ReadAsSync();

            return Single2( order.Map<Order>() );
        }
    }
}
