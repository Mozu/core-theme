using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Sockets;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Routing;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using Mozu.SiteBuilder.UX.Admin.Helpers.OrderHelpers;
using DCcore = Mozu.Core.Api.Contracts;
using DCo = Mozu.CommerceRuntime.Contracts.Orders;
using DCp = Mozu.CommerceRuntime.Contracts.Payments;
using DCs = Mozu.CommerceRuntime.Contracts.Fulfillment;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/order", SuppressDescriptorGeneration = true)]
    public partial class OrderController : BaseController
    {
        private IOrderWebApiClient _orderWebApiClient;
        private ICustomerAccountWebApiClient _customerAccountWebApiClient;
        private ICreditWebApiClient _creditWebApiClient;
        private readonly CustomerController _customerController;

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
        public OrderController(IOrderWebApiClient orderWebApiClient, ICustomerAccountWebApiClient customerAccountWebApiClient, ICreditWebApiClient creditWebApiClient, CustomerController customerController)
        {
            _orderWebApiClient = orderWebApiClient;
            _customerAccountWebApiClient = customerAccountWebApiClient;
            _creditWebApiClient = creditWebApiClient;
            _customerController = customerController;
        }

		[HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<Order>>> List([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter, [FromUri]bool draft=false)
        {
            var orderWebApiClient = _orderWebApiClient.CloneWithApiContext(ctx => ctx.SiteId = null);
            int? startIndex = pagingParams.startIndex;
            int? pageSize = pagingParams.pageSize ?? 20;
            string sort = (pagingParams != null && pagingParams.sort != null) ? pagingParams.sort.ToSortString() : null;

            // get single order
            if (!string.IsNullOrEmpty(pagingParams.id))
            {
                var order = (await orderWebApiClient.GetOrder(pagingParams.id, draft)).ReadAsSync();

                if (order != null)
                {
                    var single = order.Map<Order>();
                    if (single.CustomerId.HasValue)
                    {
                        try
                        {
                            var custTask = await _customerController.List(new PagingParamaters() {id = single.CustomerId.Value.ToString()}, new FilterCollection());
                            if (custTask.Success)
                            {
                                single.Customer = custTask.Items.FirstOrDefault();
                            }
                            
                        }
                        catch
                        {
                        }
                        
                    }
                    return List2<Order>(single);
                }
                else
                    throw new HttpResponseException(System.Net.HttpStatusCode.NotFound);
            }
            // get list of orders
            else
            {
                var filter = extFilter.ToFilterString();
                var q = extFilter.ToQString();
                int? qLimit = q == null ?(int?) null : 26;
                var responseGroups = "header,payment,packageheaders,availableactions";
                var dcOrders = (await orderWebApiClient.CloneWithApiContext(x=> x.SiteId = null).GetOrders(startIndex: startIndex, pageSize: pageSize, sortBy: pagingParams.sort.ToSortString(), filter: filter, q: q, qLimit: qLimit, responseGroups: responseGroups)).ReadAsSync();
                
                //trim out items for speedyness...
                dcOrders.Items.ForEach(x=> { x.Items = new List<DCo.OrderItem>();
                                               x.Packages = null;
                                               x.ShopperNotes = null;
                                               x.Pickups = null;
                                               x.Shipments = null;
                                               //x.ValidationResults = null;
                   
                });
                return List2(Mapper.Map<List<Order>>(dcOrders.Items), (int)dcOrders.TotalCount);
            }
        }

        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<Order>> CreateOrder()
        {
            var emptyOrder = new DCo.Order();

            // specify that order is an offline order.
            emptyOrder.Type = DCo.Order.OrderTypeConst.OFFLINE;

            // fill in order ip address
            if (Request.Properties.ContainsKey("MS_HttpContext"))
            {
                var ctx = Request.Properties["MS_HttpContext"] as HttpContextWrapper;
                if (ctx != null)
                {
                    var ipStr = ctx.Request.Headers["X-Forwarded-For"] ?? ctx.Request.UserHostAddress;
                    IPAddress ipaddress;
                    if (IPAddress.TryParse(ipStr, out ipaddress) && ipaddress.AddressFamily != AddressFamily.InterNetworkV6)
                    {
                        emptyOrder.IPAddress = ipStr;
                    }
                    
                }
              
            }

            var order = (await _orderWebApiClient.CreateOrder(emptyOrder)).ReadAsSync();

            return Single2( order.Map<Order>() );
        }

        public class OrderIdArgs
        {
            public string OrderId { get; set; }
        }

        [HttpPostRoute(UriTemplate = "accept")]
        public async Task<Response<Order>> AcceptOrder(OrderIdArgs args)
        {
            var dc = (await _orderWebApiClient.PerformOrderAction(args.OrderId, new DCo.OrderAction { ActionName = "AcceptOrder" })).ReadAsSync();

            return Single2( dc.Map<Order>() );
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

        public class UpdateAttributeArgs
        {
            public string OrderId { get; set; }
            public List<DCo.OrderAttribute> Attributes { get; set; }
        }

        [HttpPostRoute(UriTemplate = "attributes/update")]
        public async Task<Response<List<DCo.OrderAttribute>>> UpdateAttributes(UpdateAttributeArgs args)
        {
            List<DCo.OrderAttribute> returnList = null;
            var existingAttrs = (await _orderWebApiClient.GetOrderAttributes(args.OrderId)).ReadAsSync();
            List<Task> attributeTasks = new List<Task>();

            var orderAttrIds = args.Attributes.Select(attr => attr.FullyQualifiedName);
            var existingAttrIds = (existingAttrs ?? new List<DCo.OrderAttribute>()).Select(attr => attr.FullyQualifiedName);

            var createdAttributeIds = orderAttrIds.Except(existingAttrIds).ToList();
            var updatedAttributeIds = orderAttrIds.Intersect(existingAttrIds).ToList();

            // because we tell the update to remove missing attributes, create and update cannot run simultaneously.
            if (createdAttributeIds.Count > 0)
            {
                returnList = (await _orderWebApiClient.CreateOrderAttributes(args.OrderId, args.Attributes.Where(a => createdAttributeIds.Contains(a.FullyQualifiedName)).ToList())).ReadAsSync();
            }
            if (updatedAttributeIds.Count > 0)
            {
                returnList = (await _orderWebApiClient.UpdateOrderAttributes(args.OrderId, args.Attributes, removeMissing: true)).ReadAsSync();
            }

            return List2(returnList);
        }

        public class SetCustomerNoteArgs
        {
            public string OrderId { get; set; }
            public string Note { get; set; }
        }
        [HttpPostRoute(UriTemplate = "setcustomernote")]
        public async Task<Response<Order>> SetCustomerNote(SetCustomerNoteArgs args)
        {
            DCo.Order order = (await _orderWebApiClient.GetOrder(args.OrderId)).ReadAsSync();
            order.ShopperNotes = new DCo.ShopperNotes {
                Comments = args.Note
            };

            order = (await _orderWebApiClient.UpdateOrder(args.OrderId, order)).ReadAsSync();

            return Single2(order.Map<Order>());
        }

        [HttpPostRoute(UriTemplate = "updatecontactinfo")]
        public async Task<Response<Order>> UpdateContactInfo(Order order)
        {
            var dcOrder = (await _orderWebApiClient.GetOrder(order.Id)).ReadAsSync();

            var billingContact = Mapper.Map<Mozu.Core.Api.Contracts.Contact>(order.BillingContact);
            var fulfillmentContact = Mapper.Map<Mozu.Core.Api.Contracts.Contact>(order.FulfillmentContact);

            // IMPORTANT! these two service calls must run SERIALLY.
            // We do not want to fire them at the same time because it is a race condition 
            // and the last request will win.
            if (fulfillmentContact != null)
            {
                if (dcOrder.FulfillmentInfo == null)
                {
                    dcOrder.FulfillmentInfo = new DCs.FulfillmentInfo();
                }
                dcOrder.FulfillmentInfo.FulfillmentContact = fulfillmentContact;
                (await _orderWebApiClient.SetFulFillmentInfo(dcOrder.Id, dcOrder.FulfillmentInfo)).ReadAsSync();

            }
          
            if (billingContact != null)
            {
                if (dcOrder.BillingInfo == null)
                {
                    dcOrder.BillingInfo = new DCp.BillingInfo();
                }
                dcOrder.BillingInfo.BillingContact = billingContact;

                (await _orderWebApiClient.SetBillingInfo(dcOrder.Id, dcOrder.BillingInfo)).ReadAsSync();
            }

            dcOrder = (await _orderWebApiClient.GetOrder(order.Id)).ReadAsSync();
            return Single2(dcOrder.Map<Order>());
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
            //billingInfo.Card = new DCp.PaymentCard
            //{
            //    CardNumberPartOrMask = args.BillingInfo.CardNumber,
            //    ExpireMonth = args.BillingInfo.ExpireMonth,
            //    ExpireYear = args.BillingInfo.ExpireYear,
            //    NameOnCard = args.BillingInfo.NameOnCard,
            //    PaymentOrCardType = args.BillingInfo.CardType,
            //    PaymentServiceCardId = args.BillingInfo.PaymentServiceCardId
            //};
            billingInfo.IsSameBillingShippingAddress = args.BillingInfo.IsSameBillingShippingAddress;

            await _orderWebApiClient.SetBillingInfo(args.OrderId, billingInfo);
            DCo.Order dcOrder = (await _orderWebApiClient.GetOrder(args.OrderId)).ReadAsSync();

            return Single2( dcOrder.Map<Order>() );
        }

        public class SetShippingInfoArgs
        {
            public string OrderId { get; set; }
            public Contact Contact { get; set; }
            public string ShippingMethodName { get; set; }
            public string ShippingMethodCode { get; set; }
        }
        [HttpPostRoute(UriTemplate = "setshippinginfo")]
        public async Task<Response<Order>> SetShippingInfo(SetShippingInfoArgs args, [FromUri]bool draft = false)
        {
            DCs.FulfillmentInfo  shippingInfo;

            var shippingInfoResult = await _orderWebApiClient.GetFulfillmentInfo(args.OrderId, draft);
            if (shippingInfoResult.HasException && shippingInfoResult.ResponseMessage.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                shippingInfo = new DCs.FulfillmentInfo();
            }
            else
            {
                shippingInfo = shippingInfoResult.ReadAsSync();
            }

            shippingInfo.FulfillmentContact = args.Contact.Map<DCcore.Contact>();
            shippingInfo.ShippingMethodName = !String.IsNullOrWhiteSpace(args.ShippingMethodName) ? args.ShippingMethodName : null;
            shippingInfo.ShippingMethodCode = !String.IsNullOrWhiteSpace(args.ShippingMethodCode) ? args.ShippingMethodCode : null;

            await _orderWebApiClient.SetFulFillmentInfo( args.OrderId, shippingInfo, (draft ? APPLY_TO_DRAFT : APPLY_TO_ORIGINAL));

            DCo.Order dcOrder = (await _orderWebApiClient.GetOrder(args.OrderId, draft)).ReadAsSync();
            if (dcOrder.BillingInfo == null || dcOrder.BillingInfo.IsSameBillingShippingAddress)
            {
                dcOrder.BillingInfo = new DCp.BillingInfo { BillingContact = null, IsSameBillingShippingAddress = true };
                await _orderWebApiClient.SetBillingInfo(args.OrderId, dcOrder.BillingInfo, (draft ? APPLY_TO_DRAFT : APPLY_TO_ORIGINAL));
            }

            return Single2(dcOrder.Map<Order>());
        }

        public class SetCustomerAccountIdArgs
        {
            public string OrderId { get; set; }
            public int CustomerAccountId { get; set; }
        }
        [HttpPostRoute(UriTemplate = "setcustomer")]
        public async Task<Response<Order>> SetCustomerAccountId(SetCustomerAccountIdArgs args)
        {
            DCo.Order dcOrder = (await _orderWebApiClient.GetOrder(args.OrderId)).ReadAsSync();

            Customer.Contracts.CustomerAccount dcCustomer;

            dcCustomer = (await _customerAccountWebApiClient.GetAccount(args.CustomerAccountId)).ReadAsSync();

            dcOrder.CustomerAccountId = args.CustomerAccountId;

            // set BillingInfo and FulfillmentInfo to customer's default.
            if (dcOrder.BillingInfo == null || dcOrder.BillingInfo.BillingContact == null)
            {
                var defaultCustomerBillingContact = dcCustomer.GetDefaultBillingContact();
                if (defaultCustomerBillingContact != null) {
                    if (dcOrder.BillingInfo == null) {
                        dcOrder.BillingInfo = new DCp.BillingInfo();
                    }
                    dcOrder.BillingInfo.BillingContact = defaultCustomerBillingContact;
                }
            }
            if (dcOrder.FulfillmentInfo == null || dcOrder.FulfillmentInfo.FulfillmentContact == null)
            {
                // if (dcCustomer.Contacts.Any(c => c.Types.First().Name == Mozu.Customer.Contracts.ContactTypeConst.SHIPPING
                var defaultCustomerShippingContact = dcCustomer.GetDefaultShippingContact();
                if (defaultCustomerShippingContact != null)
                {
                    if (dcOrder.FulfillmentInfo == null)
                    {
                        dcOrder.FulfillmentInfo = new DCs.FulfillmentInfo();
                    }
                    dcOrder.FulfillmentInfo.FulfillmentContact = defaultCustomerShippingContact;
                }
            }

            dcOrder = (await _orderWebApiClient.UpdateOrder(args.OrderId, dcOrder, APPLY_TO_ORIGINAL)).ReadAsSync();

            return Single2( Mapper.Map<Order>(dcOrder) );
        }

        public class ResendConfirmationEmailArgs
        {
            public string OrderId { get; set; }
        }
        [HttpPostRoute(UriTemplate = "resendconfirmationemail")]
        public async Task<HttpResponseMessage> ResendConfirmationEmail(ResendConfirmationEmailArgs args)
        {
            var action = new DCo.OrderAction()
            {
                ActionName = DCo.OrderAction.OrderActionNameConst.SUBMIT_ORDER
            };

            (await _orderWebApiClient.ResendOrderConfirmationEmail(args.OrderId, action)).ReadAsSync();

            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
