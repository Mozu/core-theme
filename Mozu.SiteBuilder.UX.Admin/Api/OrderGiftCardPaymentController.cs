using System;
using System.Linq;
using System.Collections.Generic;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using CCR = Mozu.Customer.Contracts.Credit;
using DCcore = Mozu.Core.Api.Contracts;
using DCp = Mozu.CommerceRuntime.Contracts.Payments;
using CR = Mozu.CommerceRuntime.Contracts.Orders;
using ACTIONS = Mozu.CommerceRuntime.Contracts.Payments.PaymentAction.PaymentActionNameConst;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public partial class OrderController
    {

        public class GiftCardPayment
        {
            public string Code { get; set; }
            public decimal AmtToApply { get; set; }
            public decimal CurrentBalance { get; set; }
            public bool RemainderToAccount { get; set; }
        }

        public class GiftCardPaymentCollection
        {
            public int CustomerId { get; set; }
            public string OrderId { get; set; }
            public List<GiftCardPayment> Payments { get; set; }
        }

        public async Task<DCcore.Client.ServiceClientResponse<CR.Order>> AddGiftCard(string orderId, Customer.Contracts.CustomerAccount customer, GiftCardPayment payment)
        {
            var action = new DCp.PaymentAction
            {
                ActionName = ACTIONS.CREATE_PAYMENT,
                NewBillingInfo = new DCp.BillingInfo
                {
                    PaymentType = DCp.PaymentTypeConst.STORE_CREDIT,
                    BillingContact = new DCcore.Contact
                    {
                        FirstName = customer.FirstName,
                        LastNameOrSurname = customer.LastName,
                        Email = customer.EmailAddress
                    },
                    StoreCreditCode = payment.Code
                },
                Amount = payment.AmtToApply
            };


            return (await _orderWebApiClient.CreatePaymentAction(orderId, action));

        }

        public async Task<DCcore.Client.ServiceClientResponse<CCR.Credit>> AssociateCardWithCustomer(Customer.Contracts.CustomerAccount customer, string code)
        {
            var credit = new CCR.Credit
            {
                Code = code,
                CustomerId = customer.Id
            };
            return (await _creditWebApiClient.UpdateCredit(credit, code));
        }

        [HttpPostRoute(UriTemplate = "payment/addgiftcards")]
        public async Task<Response<Order>> AddGiftCards(GiftCardPaymentCollection cardPayments)
        {
            var customer = (await _customerAccountWebApiClient.GetAccount(cardPayments.CustomerId) ).ReadAsSync();

            var tasks = cardPayments.Payments.Select(payment => AddGiftCard(cardPayments.OrderId, customer, payment)).ToList();

            var customerTasks = cardPayments.Payments.Where(payment => payment.RemainderToAccount && payment.CurrentBalance - payment.AmtToApply > 0).Select(payment => AssociateCardWithCustomer(customer, payment.Code)).ToList();

            //await Task.WhenAll(tasks);

            //await Task.WhenAll(customerTasks);

            await Task.WhenAll(tasks.Cast<Task>().Concat(customerTasks.Cast<Task>()));

            tasks.Where(x => x.Result.HasException).ToList().ForEach(x => { throw x.Result.ReadException(); });

            customerTasks.Where(x => x.Result.HasException).ToList().ForEach(x => { throw x.Result.ReadException(); });

            var order = (await _orderWebApiClient.GetOrder(cardPayments.OrderId)).ReadAsSync();

            return Single2(order.Map<Order>());

        }

    }
}
