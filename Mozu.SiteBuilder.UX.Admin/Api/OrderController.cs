using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core.Api.Routing;
using Mozu.Core.Settings;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using Mozu.SiteBuilder.UX.Admin.Helpers.OrderHelpers;
using DCcore = Mozu.Core.Api.Contracts;
using DCo = Mozu.CommerceRuntime.Contracts.Orders;
using DCp = Mozu.CommerceRuntime.Contracts.Payments;
using DCs = Mozu.CommerceRuntime.Contracts.Shipping;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/order", SuppressDescriptorGeneration = true)]
    public partial class OrderController : BaseController
    {
        private readonly ISettings _settings;
        private IOrderWebApiClient _orderWebApiClient;
        private ICustomerAccountWebApiClient _customerAccountWebApiClient;
        private ISiteBuilderApiContext _ctx;

        /*
         * All order item operations have an updateMode attribute.
         * Valid options are: ApplyToOriginal, ApplyToDraft, and ApplyAndCommit
         */
        private const string APPLY_TO_ORIGINAL = "ApplyToOriginal";
        private const string APPLY_TO_DRAFT = "ApplyToDraft";
        private const string APPLY_AND_COMMIT = "ApplyAndCommit";

        /// <summary>
        /// Public constructor.
        /// </summary>
        public OrderController(IOrderWebApiClient orderWebApiClient, ICustomerAccountWebApiClient customerAccountWebApiClient, ISettings settings, ISiteBuilderApiContext ctx)
        {
            _settings = settings;
            _orderWebApiClient = orderWebApiClient;
            _customerAccountWebApiClient = customerAccountWebApiClient;
            _ctx = ctx;
        }

		[HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<Order>>> List([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter, [FromUri]bool draft=false)
        {
            int? startIndex = pagingParams.startIndex;
            int? pageSize = pagingParams.pageSize ?? 20;
            string sort = (pagingParams != null && pagingParams.sort != null) ? pagingParams.sort.ToSortString() : null;

            DCo.OrderCollection dcOrders = null;
            
            // get single order
            if (!string.IsNullOrEmpty(pagingParams.id))
            {
                dcOrders = new DCo.OrderCollection() { Items = new List<DCo.Order>() };
                var order = (await _orderWebApiClient.GetOrder(pagingParams.id, draft)).ReadAsSync();
                if (order != null)
                {
                    dcOrders.Items.Add(order);
                }
            }
            // get list of orders
            else
            {
                var filter = extFilter.ToFilterString();
                try
                {
                    dcOrders = (await _orderWebApiClient.GetOrders(startIndex, pageSize, pagingParams.sort.ToSortString(), filter)).ReadAsSync();
                }
                catch (Exception ex)
                {
                    dcOrders = new DCo.OrderCollection { Items = new List<DCo.Order>() };
                }
            }

            var orders = dcOrders != null ? Mapper.Map<List<Order>>(dcOrders.Items) : new List<Order>();

            return List2(orders,(int) dcOrders.TotalCount );
        }

        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<Order>> CreateOrder()
        {
            var emptyOrder = new DCo.Order();
            
            var order = (await _orderWebApiClient.CreateOrder(emptyOrder)).ReadAsSync();

            order.TenantId = _ctx.TenantId;
            order.SiteId = _ctx.SiteId;

            return Single2( order.Map<Order>() );
        }

        public class OrderIdArgs
        {
            public string OrderId { get; set; }
        }

		[HttpPostRoute(UriTemplate = "cancel")]
        public async Task<Response<Order>> CancelOrder(OrderIdArgs args)
        {
            var dc = (await _orderWebApiClient.PerformOrderAction(args.OrderId, new DCo.OrderAction { ActionName = "CancelOrder" })).ReadAsSync();

            return Single2( dc.Map<Order>() );
        }

        [HttpPostRoute(UriTemplate = "submit")]
        public async Task<Response<Order>> SubmitOrder(OrderIdArgs args)
        {
            var dc = (await _orderWebApiClient.PerformOrderAction(args.OrderId, new DCo.OrderAction { ActionName = "SubmitOrder" })).ReadAsSync();

            return Single2( dc.Map<Order>() );
        }


        [HttpPostRoute(UriTemplate = "commitdraft")]
        public async Task<Response<Order>> CommitDraft(OrderIdArgs args)
        {
            var dcOrder = (await _orderWebApiClient.GetOrder(args.OrderId, true)).ReadAsSync();
            dcOrder = (await _orderWebApiClient.UpdateOrder(args.OrderId, dcOrder, APPLY_AND_COMMIT)).ReadAsSync();

            return Single2( dcOrder.Map<Order>() );
        }

        [HttpPostRoute(UriTemplate = "deletedraft")]
        public async Task<Response<Order>> DeleteDraft(OrderIdArgs args)
        {
            await _orderWebApiClient.DeleteOrderDraft(args.OrderId);

            return SuccessWithTotal2<Order>(1);
        }

        public class SetBillingInfoArgs
        {
            public string OrderId { get; set; }
            public CardPaymentInformation BillingInfo { get; set; }
            public Contact BillingContact { get; set; }
        }
        [HttpPostRoute(UriTemplate = "setbillinginfo")]
        public async Task<Response<Order>> SetBillingInfo(SetBillingInfoArgs args)
        {
            DCp.BillingInfo billingInfo;

            var billingInfoResult = await _orderWebApiClient.GetBillingInfo(args.OrderId);
            if (billingInfoResult.HasException && billingInfoResult.ResponseMessage.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                billingInfo = new DCp.BillingInfo();
            }
            else
            {
                billingInfo = billingInfoResult.ReadAsSync();
            }

            billingInfo.BillingContact = args.BillingContact.Map<DCcore.Contact>();
            billingInfo.Card = new DCp.PaymentCard
            {
                CardNumberPartOrMask = args.BillingInfo.CardNumber,
                ExpireMonth = args.BillingInfo.ExpireMonth,
                ExpireYear = args.BillingInfo.ExpireYear,
                NameOnCard = args.BillingInfo.NameOnCard,
                PaymentOrCardType = args.BillingInfo.CardType,
                PaymentServiceCardId = args.BillingInfo.PaymentServiceCardId
            };
            billingInfo.IsSameBillingShippingAddress = args.BillingInfo.IsSameBillingShippingAddress;

            await _orderWebApiClient.SetBillingInfo(args.OrderId, billingInfo);
            DCo.Order dcOrder = (await _orderWebApiClient.GetOrder(args.OrderId)).ReadAsSync();

            return Single2( dcOrder.Map<Order>() );
        }

        public class SetShippingContactArgs
        {
            public string OrderId { get; set; }
            public Contact Contact { get; set; }
        }
        [HttpPostRoute(UriTemplate = "setshippingcontact")]
        public async Task<Response<Order>> SetShippingContact(SetShippingContactArgs args)
        {
            DCs.ShippingInfo shippingInfo;
            
            var shippingInfoResult = await _orderWebApiClient.GetShippingInfo(args.OrderId);
            if (shippingInfoResult.HasException && shippingInfoResult.ResponseMessage.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                shippingInfo = new DCs.ShippingInfo();
            }
            else
            {
                shippingInfo = shippingInfoResult.ReadAsSync();
            }

            shippingInfo.ShippingContact = args.Contact.Map<DCcore.Contact>();

            await _orderWebApiClient.SetShippingInfo(args.OrderId, shippingInfo);

            DCo.Order dcOrder = (await _orderWebApiClient.GetOrder(args.OrderId)).ReadAsSync();

            return Single2(dcOrder.Map<Order>());
        }

        public class SetCustomerAccountIdArgs
        {
            public string OrderId { get; set; }
            public int CustomerAccountId { get; set; }
        }
        [HttpPostRoute(UriTemplate = "setcustomer")]
        public async Task<Response<Customer.Contracts.CustomerAccount>> SetCustomerAccountId(SetCustomerAccountIdArgs args)
        {
            DCo.Order dcOrder = (await _orderWebApiClient.GetOrder(args.OrderId)).ReadAsSync();
            Customer.Contracts.CustomerAccount dcCustomer;

            dcOrder.CustomerAccountId = args.CustomerAccountId;
            dcOrder = (await _orderWebApiClient.UpdateOrder(args.OrderId, dcOrder, APPLY_TO_ORIGINAL)).ReadAsSync();
            dcCustomer = (await _customerAccountWebApiClient.GetAccount(args.CustomerAccountId)).ReadAsSync();

            return Single2( dcCustomer );
        }
    }
}
