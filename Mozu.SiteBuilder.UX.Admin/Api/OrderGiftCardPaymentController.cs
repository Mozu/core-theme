using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using ACTIONS = Mozu.CommerceRuntime.Contracts.Payments.PaymentAction.PaymentActionNameConst;
using CCR = Mozu.Customer.Contracts.Credit;
using CR = Mozu.CommerceRuntime.Contracts.Orders;
using DCcore = Mozu.Core.Api.Contracts;
using DCp = Mozu.CommerceRuntime.Contracts.Payments;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public partial class OrderController
    {

        public class GiftCardPayment
        {
            public string Code { get; set; }
            public decimal AmtToApply { get; set; }
            public decimal CurrentBalance { get; set; }
            public bool? RemainderToAccount { get; set; }
        }

        public class GiftCardPaymentCollection
        {
            public string OrderId { get; set; }
            public int? CustomerId { get; set; }
            public List<GiftCardPayment> Payments { get; set; }
        }

        [HttpPostRoute(UriTemplate = "payment/addgiftcards")]
        public async Task<Response<Order>> AddGiftCards(GiftCardPaymentCollection args)
        {
            // apply all of the gift cards to the order.
            // important: THESE MUST BE DONE SERIALLY
            // the service is not friendly to concurrent requests and the last one in will win, resulting in a single payment being added.
            foreach (var p in args.Payments)
            {
                (await AddGiftCard(args.OrderId, p.Code, p.AmtToApply)).ReadAsSync();
            }
            
            // for any cards where we had selected "remainder to account", tie the card to the customer account.
            if (args.CustomerId.HasValue)
            {
                foreach (var p in args.Payments.Where(pp => pp.RemainderToAccount.GetValueOrDefault(false) && pp.CurrentBalance > pp.AmtToApply))
                {
                    (await AssociateCardWithCustomer(args.CustomerId.Value, p.Code)).ReadAsSync();
                }
            }

            var order = (await _orderWebApiClient.GetOrder(args.OrderId)).ReadAsSync();

            return Single2(order.Map<Order>());

        }

        private Task<DCcore.Client.ServiceClientResponse<CR.Order>> AddGiftCard(string orderId, string code, decimal amountToApply)
        {
            var action = new DCp.PaymentAction
            {
                ActionName = ACTIONS.CREATE_PAYMENT,
                NewBillingInfo = new DCp.BillingInfo
                {
                    PaymentType = DCp.PaymentTypeConst.STORE_CREDIT,
                    //BillingContact = new DCcore.Contact
                    //{
                    //    FirstName = customer.FirstName,
                    //    LastNameOrSurname = customer.LastName,
                    //    Email = customer.EmailAddress
                    //},
                    StoreCreditCode = code
                },
                Amount = amountToApply
            };


            return _orderWebApiClient.CreatePaymentAction(orderId, action);

        }

        private Task<DCcore.Client.ServiceClientResponse<CCR.Credit>> AssociateCardWithCustomer(int customerId, string code)
        {
            // retrieve the credit
            return _creditWebApiClient.GetCredit(code)
            .ContinueWith<Task<DCcore.Client.ServiceClientResponse<CCR.Credit>>>(t => {
                var cred = t.Result.ReadAsSync();

                // guard against the badness
                if (cred.CustomerId != null) {
                    if (cred.CustomerId == customerId) {
                        return Task.FromResult(t.Result);
                    }
                    else {
                        throw new Exception("Attempt to attach an owned Gift Card to another customer.");
                    }
                }

                // update the credit
                cred.CustomerId = customerId;
                return _creditWebApiClient.UpdateCredit(cred, code);
            }).Unwrap();
        }
    }
}
