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
            throw new NotImplementedException();


            // Possible actions can be "Create," "Capture," "Void," "AuthCapture," or "ReceiveCheck."
            var action = new DCp.PaymentAction
            {
                ActionName = "Capture",
                ISOCurrencyCode = "USD",
                Amount = amount
                // ReferenceSourcePaymentId = ???
            };

            // _orderWebApiClient.payment
            var order = (await _orderWebApiClient.CreatePaymentAction(payment.OrderId, action)).ReadAsSync();


            //_orderWebApiClient.GetPackageLabel
            return List2(order.Map<Order>());
        }

        [WebInvoke(Method = "POST", UriTemplate = "payment/credit")]
        public async Task<Response<List<Order>>> CreditPayment(OrderPayment payment, decimal amount)
        {
            throw new NotImplementedException();
        }


        [WebInvoke(Method = "POST", UriTemplate = "payment/void")]
        public async Task<Response<List<Order>>> VoidPayment(string paymentId)
        {
            throw new NotImplementedException();
        }
    }
}
