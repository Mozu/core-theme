using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Routing;
using Mozu.Core.Exceptions;
using Mozu.Core.Extensions;
using Mozu.Core.Settings;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Account;
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
        private readonly ISettings _settings;
        private IOrderWebApiClient _orderWebApiClient;
        private ICustomerAccountWebApiClient _customerAccountWebApiClient;
        private ICreditWebApiClient _creditWebApiClient;
        private ISiteBuilderApiContext _ctx;
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
        public OrderController(IOrderWebApiClient orderWebApiClient, ICustomerAccountWebApiClient customerAccountWebApiClient, ICreditWebApiClient creditWebApiClient, ISettings settings, ISiteBuilderApiContext ctx, CustomerController customerController)
        {
            _settings = settings;
            _orderWebApiClient = orderWebApiClient;
            _customerAccountWebApiClient = customerAccountWebApiClient;
            _creditWebApiClient = creditWebApiClient;
            _ctx = ctx;
            _customerController = customerController;
        }

		[HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<Order>>> List([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter, [FromUri]bool draft=false)
        {
            int? startIndex = pagingParams.startIndex;
            int? pageSize = pagingParams.pageSize ?? 20;
            string sort = (pagingParams != null && pagingParams.sort != null) ? pagingParams.sort.ToSortString() : null;

            // get single order
            if (!string.IsNullOrEmpty(pagingParams.id))
            {
                var order = (await _orderWebApiClient.GetOrder(pagingParams.id, draft)).ReadAsSync();

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
                var responseGroups = "header,payment";
                var dcOrders = (await _orderWebApiClient.CloneWithApiContext(x=> x.SiteId = null).GetOrders(startIndex: startIndex, pageSize: pageSize, sortBy: pagingParams.sort.ToSortString(), filter: filter, q: q, qLimit: qLimit, responseGroups: responseGroups)).ReadAsSync();
                
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

        [HttpPostRoute(UriTemplate = "action")]
        public async Task<Response<List<OrderActionResult>>> PerformOrdersAction(BulkOrderAction action)
        {
            if (!IsValidBulkAction(action.ActionName))
            {
                throw new VaeMissingOrInvalidParameterException("ActionName",
                    string.Format("Valid bulk order actions are '{0}'",
                        string.Join("' , '", _validBulkOrderActions)));
            }
            var orderIdToActionTaskTuples = action.OrderIds.Select(
                id => PerformOrderAction(action.ActionName, id))
                        .ToList();

            var result = new Response<List<OrderActionResult>>{Success = true, Items = new List<OrderActionResult>(), Total = action.OrderIds.Count};
            await Task.WhenAll(orderIdToActionTaskTuples);
            foreach (var orderIdToActionTask in orderIdToActionTaskTuples)
            {
                var actionResult = orderIdToActionTask.Result;
                var orderActionResult = new OrderActionResult{OrderId = actionResult.OrderId, Successful = true};
                result.Items.Add(orderActionResult);
                orderActionResult.StatusCode = actionResult.StatusCode;
                if (orderActionResult.StatusCode != HttpStatusCode.OK)
                {
                    result.Success = false;
                    orderActionResult.Successful = false;
                    orderActionResult.ErrorMessage = actionResult.Message;
                }
            }
            return result;
        }

        private async Task<InternalBulkActionResult> PerformOrderAction(string actionName, string orderId)
        {
            if (actionName.EqualsIgnoreCase(CommerceRuntime.Contracts.Orders.OrderAction.OrderActionNameConst.ACCEPT_ORDER)
                || actionName.EqualsIgnoreCase(CommerceRuntime.Contracts.Orders.OrderAction.OrderActionNameConst.CANCEL_ORDER))
            {
                return await PerformRootAction(actionName, orderId);
            }
            if (actionName.EqualsIgnoreCase(CommerceRuntime.Contracts.Fulfillment.FulfillmentAction.FulfillmentActionNameConst.SHIP))
            {
                return await PerformFulfillmentShipAction(actionName, orderId);
            }
            if(actionName.EqualsIgnoreCase(CommerceRuntime.Contracts.Payments.PaymentAction.PaymentActionNameConst.CAPTURE_PAYMENT)){
                return await PerformPaymentCaptureAction(actionName, orderId);
            }
            throw new VaeMissingOrInvalidParameterException("actionName");
        }

        private static bool IsValidBulkAction(string actionName)
        {
            if (string.IsNullOrEmpty(actionName))
                return false;
            return _validBulkOrderActions.Any(s => s.EqualsIgnoreCase(actionName));
        }

        private static readonly List<string> _validBulkOrderActions = new List<string>
        {
            CommerceRuntime.Contracts.Orders.OrderAction.OrderActionNameConst.ACCEPT_ORDER,
            CommerceRuntime.Contracts.Orders.OrderAction.OrderActionNameConst.CANCEL_ORDER,
            CommerceRuntime.Contracts.Fulfillment.FulfillmentAction.FulfillmentActionNameConst.SHIP,
            CommerceRuntime.Contracts.Payments.PaymentAction.PaymentActionNameConst.CAPTURE_PAYMENT
        };

        internal class InternalBulkActionResult
        {
            public string OrderId { get; set; }
            public string ActionName { get; set; }
            public HttpStatusCode StatusCode { get; set; }
            public string Message { get; set; }
        }

        private async Task<InternalBulkActionResult> PerformRootAction(string actionName, string orderId)
        {
            var orderResponse = await _orderWebApiClient.PerformOrderAction(orderId, new DCo.OrderAction { ActionName = actionName });
            var result = new InternalBulkActionResult
            {
                ActionName = actionName,
                OrderId = orderId,
                StatusCode = orderResponse.ResponseMessage.StatusCode
            };
            if (result.StatusCode != HttpStatusCode.OK)
            {
                result.Message = orderResponse.HasException
                    ? orderResponse.ReadException().Message
                    : string.Format("Unknown Error performing the root action '{0}'", actionName);
            }
            return result;
        }

        // Retrieves the order and performs the action on the underlying packages
        private async Task<InternalBulkActionResult> PerformFulfillmentShipAction(string actionName, string orderId)
        {
            var orderResponse = await _orderWebApiClient.GetOrder(orderId);
            var result = new InternalBulkActionResult
            {
                ActionName = actionName,
                OrderId = orderId,
                StatusCode = orderResponse.ResponseMessage.StatusCode
            };
            if (result.StatusCode == HttpStatusCode.OK)
            {
                var packages = orderResponse.ReadAsSync().Packages;
                //todo: Stewart Noll on 2014-10-06 perform validation on the packages
                var digitalPackages = packages.Where(
                    p => p.PackagingType != CommerceRuntime.Contracts.Fulfillment.FulfillmentItemTypeConst.PHYSICAL).ToList();
                var physicalPackages = packages.Where(
                    p => p.PackagingType == CommerceRuntime.Contracts.Fulfillment.FulfillmentItemTypeConst.PHYSICAL).ToList();

                if (digitalPackages.Any() && !physicalPackages.Any())
                {
                    // only digital packages in this order
                    result.StatusCode = HttpStatusCode.BadRequest;
                    result.Message = string.Format("No physical packages on the order to mark as shipped");
                    return result;
                }

                // happy path, go forth a perform action on orders physical packages
                var fulfillmentResponse = await _orderWebApiClient.PerformFulfillmentAction(orderId,
                    new DCs.FulfillmentAction()
                    {
                        ActionName = actionName,
                        PackageIds = physicalPackages.Select(p => p.Id).ToList()
                    });
                // overwrite the status code of the order result with that of the fulfillment result
                result.StatusCode = fulfillmentResponse.ResponseMessage.StatusCode;
                if (result.StatusCode != HttpStatusCode.OK)
                {
                    result.Message = fulfillmentResponse.HasException
                        ? fulfillmentResponse.ReadException().Message
                        : string.Format("Unknown Error performing fulfillment action '{0}'", actionName);
                }
                else
                {
                    if (digitalPackages.Any())
                    {
                        // successfully marked physical packages as shipped but need to inform the user that there were digital packages
                        result.Message = string.Format("Order contains {0} digital packages which were not altered", digitalPackages.Count);
                    }
                }
            }
            else
            {
                result.Message = orderResponse.HasException
                        ? orderResponse.ReadException().Message
                        : string.Format("Unknown Error performing fulfillment action '{0}'", actionName);
            }
            return result;
        }

        // Retrieves the order and performs the action on the underlying packages
        private async Task<InternalBulkActionResult> PerformPaymentCaptureAction(string actionName, string orderId)
        {
            var result = new InternalBulkActionResult
            {
                ActionName = actionName,
                StatusCode = HttpStatusCode.BadRequest, // overwrite in the positive case
                OrderId = orderId
            };
            var orderResponse = await _orderWebApiClient.GetPayments(orderId);

            var payments = orderResponse.ReadAsSync().Items;

            // perform validation on the payments
            if (payments.IsNullOrEmpty())
            {
                result.Message = "No payments on the order";
                return result;
            }
            if (payments.Count > 1)
            {
                result.Message = "There may only be one payment on the order to perform capture as a bulk action";
                return result;
            }
            var payment = payments.First();
            if (payment.PaymentType == Mozu.CommerceRuntime.Contracts.Payments.PaymentTypeConst.CHECK)
            {
                result.Message = string.Format("'{0}' is not a valid paymenttype for a bulk capture action",
                    CommerceRuntime.Contracts.Payments.PaymentTypeConst.CHECK);
                return result;
            }
            var action = new DCp.PaymentAction
            {
                ActionName = actionName,
                Amount = payment.AmountRequested - payment.AmountCollected
            };

            var paymentResponse = await _orderWebApiClient.PerformPaymentAction(orderId, payment.Id, action);
            if (paymentResponse.ResponseMessage.StatusCode != HttpStatusCode.OK)
            {
                result.Message = orderResponse.HasException
                    ? orderResponse.ReadException().Message
                    : string.Format("Unknown Error performing the root action '{0}'", actionName);
            }
            return result;
        }
    }
}
