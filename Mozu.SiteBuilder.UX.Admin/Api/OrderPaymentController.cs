using System;
using System.Collections.Generic;
using System.ServiceModel;
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
        [WebInvoke(Method = "POST", UriTemplate = "payment/capturepayment")]
        public async Task<Response<List<Order>>> CapturePayment(string orderId, decimal amount)
        {
            return null;
            // Possible actions can be "Create," "Capture," "Void," "AuthCapture," or "ReceiveCheck."
            var action = new DCp.PaymentAction
            {
                ActionName = "Capture",
                ISOCurrencyCode = "USD",
                Amount = amount
                // ReferenceSourcePaymentId = ???
            };

            // _orderWebApiClient.payment
            var order = (await _orderWebApiClient.CreatePaymentAction(orderId, action)).ReadAsSync();


            //_orderWebApiClient.GetPackageLabel
            return List2(order.Map<Order>());
        }

        [WebInvoke(Method = "POST", UriTemplate = "payment/voidtransaction")]
        public async Task<Response<List<Order>>> IssueCredit(string orderId, decimal amount)
        {
            throw new NotImplementedException();
        }


        [WebInvoke(Method = "POST", UriTemplate = "payment/voidtransaction")]
        public async Task<Response<List<Order>>> VoidTransaction(int paymentId)
        {
            throw new NotImplementedException();
        }
    }
}
