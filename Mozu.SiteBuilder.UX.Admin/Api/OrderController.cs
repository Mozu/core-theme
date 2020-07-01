using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Carts;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Routing;
using Mozu.Customer.Contracts;
using Mozu.Customer.Contracts.Clients;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using Mozu.SiteBuilder.UX.Admin.Helpers.OrderHelpers;
using DCcore = Mozu.Core.Api.Contracts;
using CR = Mozu.CommerceRuntime.Contracts;
using DCo = Mozu.CommerceRuntime.Contracts.Orders;
using DCp = Mozu.CommerceRuntime.Contracts.Payments;
using DCs = Mozu.CommerceRuntime.Contracts.Fulfillment;
using Mozu.Core.Api.Client.Exceptions;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.SEO;
using Newtonsoft.Json.Linq;
using Product = Mozu.CommerceRuntime.Contracts.Products.Product;
using Mozu.SiteSettings.Order.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Controllers;
using Kibo.Fulfillment.Contracts.Model;
using Contact = Mozu.SiteBuilder.UX.Admin.Api.Models.Contact;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/order", SuppressDescriptorGeneration = true)]
    public partial class OrderController : BaseController
    {
        private readonly IOrderWebApiClient _orderWebApiClient;
        private readonly ICustomerAccountWebApiClient _customerAccountWebApiClient;
        private readonly Lazy<IB2BAccountWebApiClient> _b2BAccountWebApiClient;
        private readonly ICreditWebApiClient _creditWebApiClient;
        private readonly CustomerController _customerController;
        private readonly IPriceListRuntimeWebApiClient _priceListRuntimeWebApiClient;
        private readonly IApiContext _apiContext;
        private readonly ICartWebApiClient _cartWebApiClient;
        private readonly ICustomerSetWebApiClient _customerSetWebApiClient;
        private readonly IReturnWebApiClient _returnWebApiClient;
        private readonly ICheckoutSettingsWebApiClient _checkoutSettingsWebApiClient;
        private readonly IOrderRoutingProxyWebApiClient _orderRoutingProxyClient;
        private readonly IInventoryProxyWebApiClient _inventoryProxyClient;
        private readonly IFulfillmentProxyWebApiClient _fulfillmentProxyClient;
        private readonly string _ipAddress;
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
        public OrderController(
            IOrderWebApiClient orderWebApiClient,
            ICustomerAccountWebApiClient customerAccountWebApiClient,
            Lazy<IB2BAccountWebApiClient> b2BAccountWebApiClient,
            ICreditWebApiClient creditWebApiClient,
            CustomerController customerController,
            IPriceListRuntimeWebApiClient priceListRuntimeWebApiClient,
            IApiContext apiContext,
            ICartWebApiClient cartWebApiClient,
            ICustomerSetWebApiClient customerSetWebApiClient,
            IReturnWebApiClient returnWebApiClient,
            IIpAddressFinderOuter ipAddressFinderOuter,
            IOrderRoutingProxyWebApiClient orderRoutingProxyClient,
            IInventoryProxyWebApiClient inventoryProxyClient,
            IFulfillmentProxyWebApiClient fulfillmentProxyClient,            
            ICheckoutSettingsWebApiClient checkoutSettingsWebApiClient
        )
        {
            _orderWebApiClient = orderWebApiClient;
            _customerAccountWebApiClient = customerAccountWebApiClient;
            _b2BAccountWebApiClient = b2BAccountWebApiClient;
            _creditWebApiClient = creditWebApiClient;
            _customerController = customerController;
            _priceListRuntimeWebApiClient = priceListRuntimeWebApiClient;
            _apiContext = apiContext;
            _cartWebApiClient = cartWebApiClient;
            _customerSetWebApiClient = customerSetWebApiClient;
            _returnWebApiClient = returnWebApiClient;
            _ipAddress = ipAddressFinderOuter.IpAddress;
            _checkoutSettingsWebApiClient = checkoutSettingsWebApiClient;
            _orderRoutingProxyClient = orderRoutingProxyClient;
            _inventoryProxyClient = inventoryProxyClient;
            _fulfillmentProxyClient = fulfillmentProxyClient;
        }

        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<Order>>> List([FromUri] PagingParamaters pagingParams,
            [FromUri] FilterCollection extFilter, [FromUri] bool draft = false)
        {
            SbApiContext.SetDataMode(DataViewModeType.Live);
            var orderWebApiClient = _orderWebApiClient.CloneWithApiContext(ctx => ctx.SiteId = null);

            // get single order
            if (!string.IsNullOrEmpty(pagingParams?.id))
            {
                return await GetSingleOrder(orderWebApiClient, pagingParams.id, draft, extFilter);
            }

            // get list of orders
            var startIndex = pagingParams?.startIndex;
            var pageSize = pagingParams?.pageSize ?? 20;
            var sort = pagingParams?.sort?.ToSortString();
            var filter = extFilter.ToFilterString();
            var q = extFilter.ToQString();
            var qLimit = q == null ? (int?)null : 26;
            var responseGroups = "header,payment,packageheaders,availableactions";

            var dcOrders = (await orderWebApiClient.GetOrders(
                startIndex: startIndex,
                pageSize: pageSize,
                sortBy: sort,
                filter: filter,
                q: q,
                qLimit: qLimit,
                responseGroups: responseGroups)).ReadAsSync();

            var mappedOrders = Mapper.Map<List<Order>>(dcOrders.Items);

            
            if (extFilter.OrderPaymentsByCapture)
            {
                var orderHelper = new OrderHelper(_checkoutSettingsWebApiClient);
                var orders = (await orderHelper.OrderPaymentsByCapture(mappedOrders));
                return List2<Order>(orders);
            }

            
            return List2(mappedOrders, dcOrders.TotalCount);
        }

        [HttpPostRoute(UriTemplate = "addShoppersCartItems")]
        public async Task<bool> AddShoppersCartItems(string userId, string orderId)
        {
            var cart = (await _cartWebApiClient.GetUserCart(userId).ConfigureAwait(false)).ReadAsSync();

            foreach (var cartItem in cart?.Items ?? new List<CartItem>())
            {
                var product = JObject.FromObject(cartItem.Product).ToObject<CR.Products.Product>();
                var orderItem = new CR.Orders.OrderItem
                {
                    Data = cartItem.Data,
                    FulfillmentLocationCode = cartItem.FulfillmentLocationCode,
                    FulfillmentMethod = cartItem.FulfillmentMethod,
                    Product = product,
                    Quantity = cartItem.Quantity,
                    IsRecurring = cartItem.IsRecurring,
                };

                var res = await _orderWebApiClient.CreateOrderItem(orderId, orderItem).ConfigureAwait(false);
                if (res.HasException)
                {
                    throw res.ReadException();
                }
            }

            foreach (var coup in cart?.CouponCodes ?? new List<string>())
            {
                var res = await _orderWebApiClient.ApplyCoupon(orderId, coup).ConfigureAwait(false);
            }
            return true;
        }

        [HttpPostRoute(UriTemplate = "copy")]
        public async Task<Response<List<Order>>> CopyOrder(OrderIdArgs args)
        {
            var orderWebApiClient = _orderWebApiClient.CloneWithApiContext(ctx => ctx.SiteId = null);

            var order = (await orderWebApiClient.GetOrder(args.OrderId)).ReadAsSync();

            var newOrder = new CommerceRuntime.Contracts.Orders.Order
            {
                Items = order.Items.Select(x => new CommerceRuntime.Contracts.Orders.OrderItem
                {
                    Product = new Product { ProductCode = x.Product.ProductCode, VariationProductCode = x.Product.VariationProductCode, BundledProducts = x.Product.BundledProducts, Options = x.Product.Options },
                    Quantity = x.Quantity,
                    Data = x.Data,
                    FulfillmentLocationCode = x.FulfillmentLocationCode,
                    FulfillmentMethod = x.FulfillmentMethod
                }).ToList(),
                FulfillmentInfo = order.FulfillmentInfo,
                BillingInfo = order.BillingInfo,
                OriginalCartId = order.OriginalCartId,
                //PriceListCode = order.PriceListCode,
                CustomerAccountId = order.CustomerAccountId,
                IsTaxExempt = order.IsTaxExempt,
                Email = order.Email,
                CustomerTaxId = order.CustomerTaxId,
                UserId = order.UserId,
                ChannelCode = order.ChannelCode,
                CurrencyCode = order.CurrencyCode
            };



            orderWebApiClient = _orderWebApiClient.CloneWithApiContext(ctx => ctx.SiteId = order.SiteId);


            var createdOrder = (await orderWebApiClient.CreateOrder(newOrder)).ReadAsAsync().Result;
            (_apiContext as ApiContext).SiteId = order.SiteId;
            var returnOrder = (await SetCustomer(createdOrder, new SetCustomerAccountIdArgs { CustomerAccountId = createdOrder.CustomerAccountId.Value, OrderId = createdOrder.Id, UserId = createdOrder.UserId }));
            return List2<Order>(returnOrder);
        }

        [HttpPostRoute(UriTemplate = "linkOrderToCart")]
        public async Task<bool> LinkOfflineOrderToCart(string cartId, string orderId)
        {
            try
            {
                var order = (await _orderWebApiClient.GetOrder(orderId).ConfigureAwait(false)).ReadAsSync();
                if (order.OriginalCartId.EqualsIgnoreCase(cartId)) return true;

                order.OriginalCartId = cartId;
                var updatedOrder = (await _orderWebApiClient.UpdateOrder(orderId, order).ConfigureAwait(false)).ReadAsSync();
                return updatedOrder.OriginalCartId.EqualsIgnoreCase(cartId);
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        private async Task<Response<List<Order>>> GetSingleOrder(IOrderWebApiClient orderWebApiClient, string orderId, bool draft, FilterCollection callExtFilter)
        {
            var order = (await orderWebApiClient.GetOrder(orderId, draft)).ReadAsSync();

            if (order == null) throw new HttpResponseException(HttpStatusCode.NotFound);

            var pagedShipments = (await _fulfillmentProxyClient.GetShipments("orderId==" + order.Id + ";shipmentStatus!=REASSIGNED")).ReadAsSync();
            if (pagedShipments != null)
            {
                var shipments = pagedShipments.Embedded != null ? pagedShipments.Embedded["shipments"] : new List<EntityModelOfShipment>();
                order.Shipments = Mapper.Map<List<DCs.Shipment>>(shipments).OrderByDescending(x => x.Number).ToList();
            }

            var single = order.Map<Order>();
            if (single.CustomerId.HasValue)
            {
                var extFilter = new FilterCollection(new List<FilterCollectionItem>()
                {
                    new FilterCollectionItem()
                    {
                        field = "userId",
                        property = "userId",
                        value = single.UserId
                    }
                });

                var custTask = await _customerController.List(new PagingParamaters { id = single.CustomerId.Value.ToString() }, extFilter: extFilter);
                if (custTask.Success)
                    single.Customer = custTask.Items.FirstOrDefault();

                if (callExtFilter.OrderPaymentsByCapture)
                {
                    var orderHelper = new OrderHelper(_checkoutSettingsWebApiClient);
                    var orders = (await orderHelper.OrderPaymentsByCapture(new List<Order>() { single }));
                    return List2<Order>(orders);
                }
            }

            return List2<Order>(single);
        }


       

        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<Order>> CreateOrder()
        {
            var emptyOrder = new DCo.Order();

            // specify that order is an offline order.
            emptyOrder.Type = DCo.Order.OrderTypeConst.OFFLINE;
            emptyOrder.IPAddress = _ipAddress;

            var order = (await _orderWebApiClient.CreateOrder(emptyOrder)).ReadAsSync();

            return Single2(order.Map<Order>());
        }

        public class OrderIdArgs
        {
            public string OrderId { get; set; }
        }

        [HttpPostRoute(UriTemplate = "accept")]
        public async Task<Response<Order>> AcceptOrder(OrderIdArgs args)
        {
            var dc = (await _orderWebApiClient.PerformOrderAction(args.OrderId, new DCo.OrderAction { ActionName = "AcceptOrder" })).ReadAsSync();

            return Single2(dc.Map<Order>());
        }

        [HttpPostRoute(UriTemplate = "submit")]
        public async Task<Response<Order>> SubmitOrder(OrderIdArgs args)
        {
            try
            {
                var dc = (await _orderWebApiClient.PerformOrderAction(args.OrderId, new DCo.OrderAction { ActionName = "SubmitOrder" })).ReadAsSync();
                return Single2(dc.Map<Order>());
            }
            catch (ApiWebClientException ex)
            {
                if (ex.ErrorCode == "FORBIDDEN" && ex.RemoteError != null && ex.RemoteError.AdditionalErrorData != null && ex.RemoteError.AdditionalErrorData.Count > 0)
                {
                    throw new Exception(string.Join(" ", ex.RemoteError.AdditionalErrorData.Select(e => e.Value)));
                }
                else
                {
                    throw ex;
                }
            }
        }

        [HttpPostRoute(UriTemplate = "commitdraft")]
        public async Task<Response<Order>> CommitDraft(OrderIdArgs args)
        {
            var dcOrder = (await _orderWebApiClient.GetOrder(args.OrderId, true)).ReadAsSync();
            dcOrder = (await _orderWebApiClient.UpdateOrder(args.OrderId, dcOrder, APPLY_AND_COMMIT)).ReadAsSync();

            return Single2(dcOrder.Map<Order>());
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
            // because we tell the update to remove missing attributes, create and update cannot run simultaneously.
            var returnList = (await _orderWebApiClient.UpdateOrderAttributes(args.OrderId, args.Attributes, removeMissing: false)).ReadAsSync();

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
            var order = (await _orderWebApiClient.GetOrder(args.OrderId)).ReadAsSync();
            if (order.ShopperNotes == null)
            {
                order.ShopperNotes = new DCo.ShopperNotes
                {
                    Comments = args.Note
                };
            }
            else
                order.ShopperNotes.Comments = args.Note;

            order = (await _orderWebApiClient.UpdateOrder(args.OrderId, order)).ReadAsSync();

            return Single2(order.Map<Order>());
        }

        [HttpPostRoute(UriTemplate = "setgiftmessage")]
        public async Task<Response<Order>> SetGiftMessage(SetCustomerNoteArgs args)
        {
            var order = (await _orderWebApiClient.GetOrder(args.OrderId)).ReadAsSync();
            if (order.ShopperNotes == null)
            {
                order.ShopperNotes = new DCo.ShopperNotes
                {
                    GiftMessage = args.Note
                };
            }
            else
                order.ShopperNotes.GiftMessage = args.Note;

            order = (await _orderWebApiClient.UpdateOrder(args.OrderId, order)).ReadAsSync();

            return Single2(order.Map<Order>());
        }

        [HttpPostRoute(UriTemplate = "updatecontactinfo")]
        public async Task<Response<Order>> UpdateContactInfo(Order order)
        {
            var dcOrder = (await _orderWebApiClient.GetOrder(order.Id)).ReadAsSync();

            var billingContact = Mapper.Map<DCcore.Contact>(order.BillingContact);
            var fulfillmentContact = Mapper.Map<DCcore.Contact>(order.FulfillmentContact);

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
            if (billingInfoResult.HasException && billingInfoResult.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
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
            var dcOrder = (await _orderWebApiClient.GetOrder(args.OrderId)).ReadAsSync();

            return Single2(dcOrder.Map<Order>());
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
            DCs.FulfillmentInfo shippingInfo;

            var shippingInfoResult = await _orderWebApiClient.GetFulfillmentInfo(args.OrderId, draft);
            if (shippingInfoResult.HasException && shippingInfoResult.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
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

            await _orderWebApiClient.SetFulFillmentInfo(args.OrderId, shippingInfo, (draft ? APPLY_TO_DRAFT : APPLY_TO_ORIGINAL));

            var dcOrder = (await _orderWebApiClient.GetOrder(args.OrderId, draft)).ReadAsSync();
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
            public string UserId { get; set; }

            public string CartId { get; set; }
        }

        [HttpPostRoute(UriTemplate = "addCartToOrder")]
        public async Task<Response<string>> AddCartToOrder(SetCustomerAccountIdArgs args)
        {
            var cart = (await _cartWebApiClient.GetCart(args.CartId)).ReadAsSync();

            args.OrderId = (await _orderWebApiClient.CloneWithApiContext(ctx => ctx.PriceListCode = cart.PriceListCode).CreateOrderFromCart(args.CartId)).ReadAsSync().Id;

            //todo copy cart items into order instead of creating a new one.
            var res = await SetCustomerAccountId(args);
            if (res.Success)
            {
                return Single2(res.Items.Id);
            }
            else
            {
                return Single2((string)null, 0, res.Message);
            }
        }

        [HttpPostRoute(UriTemplate = "setcustomer")]
        public async Task<Response<Order>> SetCustomerAccountId(SetCustomerAccountIdArgs args)
        {
            var dcOrder = (await _orderWebApiClient.GetOrder(args.OrderId)).ReadAsSync();

            var order = await SetCustomer(dcOrder, args);

            return Single2(order);
        }

        public class SetPriceListArgs
        {
            public string OrderId { get; set; }
            public string PriceListCode { get; set; }
        }

        [HttpPostRoute(UriTemplate = "setpricelist")]
        public async Task<Response<Order>> SetPriceList(SetPriceListArgs args, [FromUri]bool draft = false)
        {
            // TODO: Hack to set price list, using ApiContext rather than parameter.
            var orderWebApiClient = _orderWebApiClient.CloneWithApiContext(ctx => { ctx.PriceListCode = args.PriceListCode; });
            var dcOrder = (await orderWebApiClient.ChangeOrderPriceList(args.OrderId, args.PriceListCode, draft ? APPLY_TO_DRAFT : APPLY_TO_ORIGINAL)).ReadAsSync();
            return Single2(Mapper.Map<Order>(dcOrder));
        }


        private async Task<Order> SetCustomer(DCo.Order dcOrder, SetCustomerAccountIdArgs args)
        {
            CustomerAccount dcCustomer;

            dcCustomer = (await _customerAccountWebApiClient.GetAccount(args.CustomerAccountId, null, args.UserId)).ReadAsSync();

            if (dcCustomer?.CustomerSet != null)
            {
                var customerset = (await _customerSetWebApiClient.GetCustomerSet(dcCustomer.CustomerSet)).ReadAsSync();
                if (!customerset.Sites.Any(site => site.SiteId == _apiContext.SiteId))
                {
                    throw new Exception("Customer doesn't belong to the site/customer set");
                }
            }



            var priceListCode = (await GetPriceListCode(dcCustomer));
            if (!ComparePriceList(dcOrder.PriceListCode, priceListCode))
            {
                (_apiContext as ApiContext).PriceListCode = priceListCode;
                var orderWebApiClient = _orderWebApiClient.CloneWithoutUserClaims();
                dcOrder = (await orderWebApiClient.ChangeOrderPriceList(args.OrderId, priceListCode, APPLY_TO_ORIGINAL)).ReadAsSync();
            }

            dcOrder.CustomerAccountId = args.CustomerAccountId;
            // Set the UserId directly so we can apply the correct B2B user in a multi-user account.
            dcOrder.UserId = dcCustomer?.UserId ?? dcOrder.UserId;

            // set BillingInfo and FulfillmentInfo to customer's default.
            if (dcOrder.BillingInfo == null || dcOrder.BillingInfo.BillingContact == null)
            {
                var defaultCustomerBillingContact = dcCustomer.GetDefaultBillingContact();
                if (defaultCustomerBillingContact != null)
                {
                    if (dcOrder.BillingInfo == null)
                    {
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

            return Mapper.Map<Order>(dcOrder);

        }

        /// <summary>
        /// Compare the string by treating null and empty value as same
        /// </summary>
        /// <returns>Returns <c>true</c> if the pricelists are equivalent, otherwise <c>false</c>.</returns>
        private bool ComparePriceList(string priceList1, string priceList2)
        {
            return String.IsNullOrEmpty(priceList1) ? String.IsNullOrEmpty(priceList2) : priceList1.Equals(priceList2, StringComparison.OrdinalIgnoreCase);
        }

        private async Task<string> GetPriceListAssignedToAccount(CustomerAccount customer)
        {
            if (!customer.AccountType.EqualsIgnoreCase("B2B")) return null;

            try
            {
                var accountResponse = await _b2BAccountWebApiClient.Value.GetB2BAccount(customer.Id, "None");
                var pricelistCode = !accountResponse.HasException ? accountResponse.ReadAsSync().PriceList : null;
                if (string.IsNullOrEmpty(pricelistCode)) return null;

                var response = await _priceListRuntimeWebApiClient.GetPriceList(pricelistCode).ConfigureAwait(false);
                return !response.HasException ? response.ReadAsSync().PriceListCode : null;
            }
            catch (Exception)
            {
                return null;
            }
        }

        private async Task<string> GetPriceListCode(CustomerAccount customer)
        {
            var accountPriceList = await GetPriceListAssignedToAccount(customer);
            if (!string.IsNullOrEmpty(accountPriceList)) return accountPriceList;

            var resolvedPriceListpriceList = (await _priceListRuntimeWebApiClient.GetResolvedPriceList(customer.Id)).ReadAsSync();
            if (resolvedPriceListpriceList != null)
            {
                return resolvedPriceListpriceList.PriceListCode;
            }

            var defaultPriceList = (await _priceListRuntimeWebApiClient.GetDefaultPriceList()).ReadAsSync();
            return defaultPriceList?.PriceListCode;
        }

        [HttpGetRoute(UriTemplate = "returnableitems")]
        public async Task<Response<List<OrderReturnableItem>>> GetReturnableItems([FromUri] string orderId)
        {
            var orderWebApiClient = _orderWebApiClient.CloneWithApiContext(ctx => ctx.SiteId = null);
            var returnableItems = (await orderWebApiClient.GetOrderReturnableItems(orderId)).ReadAsSync();
            return List2(Mapper.Map<List<OrderReturnableItem>>(returnableItems.Items), (int)returnableItems.TotalCount);
        }



        [HttpPostRoute(UriTemplate = "updateemailaddress")]
        public async Task<Response<Order>> UpdateEmailAddress(Order order, [FromUri] string newEmail)
        {

            if (string.IsNullOrEmpty(newEmail))
            {
                throw new Exception("Email must not be empty");
            }

            var dcOrder = (await _orderWebApiClient.GetOrder(order.Id)).ReadAsSync();

            if (newEmail == dcOrder.Email)
            {
                //short circuit for no changes
                return Single2(order);
            }


            dcOrder.Email = newEmail;

            dcOrder = (await _orderWebApiClient.UpdateOrder(order.Id, dcOrder, APPLY_TO_ORIGINAL)).ReadAsSync();
            return Single2(dcOrder.Map<Order>());

        }
    }
}
