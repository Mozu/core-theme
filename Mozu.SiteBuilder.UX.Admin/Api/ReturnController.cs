using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core.Api.Routing;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Returns;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Helpers.ReturnHelpers;
using DCp = Mozu.CommerceRuntime.Contracts.Payments;
using DCr = Mozu.CommerceRuntime.Contracts.Returns;
using ReturnActions = Mozu.CommerceRuntime.Contracts.Returns.ReturnAction.ReturnActionNameConst;
using PaymentActions = Mozu.CommerceRuntime.Contracts.Payments.PaymentAction.PaymentActionNameConst;
using PaymentTypes = Mozu.CommerceRuntime.Contracts.Payments.PaymentTypeConst;
using ApiCustomer = Mozu.SiteBuilder.UX.Admin.Api.Models.Customer;
using AdminUser2 = Mozu.SiteBuilder.UX.Admin.Api.Models.Account.User;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.Core.Api.Client.Exceptions;
using Mozu.Core.ErrorHandling;
using Mozu.Core.Exceptions;
using Mozu.Core.Extensions;
using Order = Mozu.SiteBuilder.UX.Admin.Api.Models.Order.Order;
using Mozu.SiteBuilder.UX.Admin.ApiWrappers;
using CARSModel = Mozu.CARS.Contracts.Model;
using Mozu.Location.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/return", SuppressDescriptorGeneration = true)]
    public partial class ReturnController : BaseController
    {
        private readonly IOrderWebApiClient _orderWebApiClient;
        private readonly IReturnWebApiClient _returnWebApiClient;
        private readonly IChannelWebApiClient _channelWebApiClient;

        private readonly ICustomerAccountWebApiClient _customerWebApiClient;
        private readonly IMultiScopeAdminUserWebApiClient _usersWebApiClient;

        private readonly ConcurrentDictionary<string, string> channelCache = new ConcurrentDictionary<string, string>();
        private readonly ConcurrentDictionary<string, string> userCache = new ConcurrentDictionary<string, string>();
        private readonly ICARSApiWrapper _CARSApiWrapper;
        private readonly ILocationAdminWebApiClient _locationWebApiClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public ReturnController(IOrderWebApiClient orderWebApiClient, IReturnWebApiClient returnWebApiClient,
            ICustomerAccountWebApiClient customerWebApiClient, IMultiScopeAdminUserWebApiClient userWebApiClient,
            IChannelWebApiClient channelWebApiClient,
            ICARSApiWrapper CARSApiWrapper,
            ILocationAdminWebApiClient locationWebApiClient)
        {
            _orderWebApiClient = orderWebApiClient;
            _returnWebApiClient = returnWebApiClient;
            _customerWebApiClient = customerWebApiClient;
            _usersWebApiClient = userWebApiClient;
            _channelWebApiClient = channelWebApiClient;
            _CARSApiWrapper = CARSApiWrapper;
            _locationWebApiClient = locationWebApiClient;
        }

        /// <summary>
        /// Use this for getting returns for the grid.
        /// </summary>
        /// <param name="dcRmas">The contract returns to conver</param>
        /// <returns>The converted API returns</returns>
        private async Task<List<Return>> MultiMapFromContract(List<DCr.Return> dcRmas)
        {
            var rmas = Mapper.Map<List<Return>>(dcRmas);
            foreach (var rma in rmas)
            {
                rma.ChannelName = await GetChannelName(rma.ChannelCode);
            }
            return rmas;
        }

        /// <summary>
        /// Use this for a single order. Does additional API calls to fill out more info.
        /// Do not use this for bulk calls.
        /// </summary>
        /// <param name="dcRma">The contract return to convert</param>
        /// <returns>The converted API return</returns>
        private async Task<Return> SingleMapFromContract(DCr.Return dcRma)
        {
            var rma = Mapper.Map<Return>(dcRma);

            rma.ChannelName = await GetChannelName(rma.ChannelCode);
            if (rma.Contact == null)
            {
                rma.Contact = await GetCustomerContact(rma.CustomerAccountId);
            }

            var customerName = rma.Contact == null ? string.Empty : $"{rma.Contact.FirstName} {rma.Contact.LastName} #{rma.CustomerAccountId}";
            rma.CreatedBy = await GetUserNameById(rma.CreatedBy) ?? customerName;
            rma.UpdatedBy = await GetUserNameById(rma.UpdatedBy) ?? customerName;

            if (!rma.ReturnOrderId.IsNullOrEmpty())
            {
                // TenantId and SiteId are automatically added via ApiContext on the back end.
                var filter = $"parentReturnId eq {rma.Id}";
                // TODO: Do we really want the Header responseGroup? It reduces payload, but money values are goofed up, though total seems ok.
                var dcOrders = (await _orderWebApiClient.GetOrders(filter: filter, responseGroups: "Header")).ReadAsSync();
                var sbOrders = Mapper.Map<List<Order>>(dcOrders.Items);
                rma.ReturnOrders = sbOrders;
            }

            // Internal notes should only be created by "admin" users, not shoppers.
            // These are found in React code by looking into the Context > Tenant > Users

            foreach (var customerNote in rma.CustomerNotes)
            {
                customerNote.CreateBy = await GetUserNameById(customerNote.CreateBy) ?? customerName;
                customerNote.UpdateBy = await GetUserNameById(customerNote.UpdateBy) ?? customerName;
            }

            return rma;
        }

        /// <summary>
        /// Looks up a channel name for a given channel code. Results are cached for the current lifetime (request).
        /// </summary>
        /// <param name="channelCode">The channel code to look up</param>
        /// <returns>The corresponding channel name, or the code if not found</returns>
        private async Task<string> GetChannelName(string channelCode)
        {
            if (channelCode.IsNullOrEmpty()) return string.Empty;

            if (!channelCache.ContainsKey(channelCode))
            {
                try
                {
                    var channel = (await _channelWebApiClient.GetChannel(channelCode)).ReadAsSync();
                    channelCache[channelCode] = channel.Name;
                }
                catch (MozuApplicationException appException)
                {
                    if (!ErrorCodes.ITEM_NOT_FOUND.Equals(appException.ErrorCode)) throw;

                    // If the channel can't be found, fallback to the channel code.
                    channelCache[channelCode] = channelCode;
                }
            }
            return channelCache[channelCode];
        }

        private async Task<Contact> GetCustomerContact(int? customerAccountId)
        {
            if (customerAccountId == null) return null;

            try
            {
                var account = (await _customerWebApiClient.GetAccount(customerAccountId)).ReadAsSync();
                if (account == null) return null;

                return new Contact
                {
                    FirstName = account.FirstName,
                    LastName = account.LastName,
                    Email = account.EmailAddress
                };
            }
            catch (MozuApplicationException appException)
            {
                if (ErrorCodes.ITEM_NOT_FOUND.Equals(appException.ErrorCode)) return null;

                throw;
            }
        }

        private async Task<string> GetUserNameById(string userId)
        {
            if (!userCache.ContainsKey(userId))
            {
                try
                {
                    var userResult = (await _usersWebApiClient.GetUser(userId)).ReadAsSync();
                    userCache[userId] = userResult == null ? null : $"{userResult.FirstName} {userResult.LastName}";
                }
                catch (MozuApplicationException appException)
                {
                    if (ErrorCodes.ITEM_NOT_FOUND.Equals(appException.ErrorCode))
                    {
                        userCache[userId] = null;
                    }
                    else if (appException is ApiWebClientException && ((ApiWebClientException)appException).RemoteError.Items.Any(x => x.ErrorCode == ErrorCodes.ITEM_NOT_FOUND))
                    {
                        userCache[userId] = null;
                    }
                    else
                    {
                        throw;
                    }
                }
            }
            return userCache[userId];
        }


        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<Return>>> List([FromUri] PagingParamaters pagingParams,
            [FromUri] FilterCollection extFilter,
            [FromUri] bool draft = false)
        {
            if (!string.IsNullOrEmpty(pagingParams?.id))
            {
                return await GetSingleReturn(pagingParams.id);
            }

            var startIndex = pagingParams?.startIndex;
            var pageSize = pagingParams?.pageSize ?? 20;
            var sort = pagingParams?.sort.ToSortString() ?? "returnNumber desc";
            var filter = extFilter.ToFilterString();
            var q = extFilter.ToQString();

            var dcReturns = (await _returnWebApiClient.GetReturns(startIndex: startIndex,
                pageSize: pageSize,
                sortBy: sort,
                filter: filter,
                q: q)).ReadAsSync();

            var returns = await MultiMapFromContract(dcReturns.Items);

            return List2(returns, dcReturns.TotalCount);
        }

        private async Task<Response<List<Return>>> GetSingleReturn(string returnId)
        {
            var dcReturn = (await _returnWebApiClient.GetReturn(returnId)).ReadAsSync();

            if (dcReturn == null) throw new HttpResponseException(HttpStatusCode.NotFound);

            var sbReturn = await SingleMapFromContract(dcReturn);

            return List2(sbReturn);
        }

        // This handles a list of returns because the ExtJS Return Proxy expects to work with a list of returns.
        [HttpPostRoute(UriTemplate = "createmulti")]
        public async Task<Response<List<Return>>> CreateMulti(List<Return> returns)
        {
            var retList = new List<Return>();
            foreach (var rma in returns)
            {
                var dcRma = Mapper.Map<DCr.Return>(rma);
                dcRma = (await _returnWebApiClient.CreateReturn(dcRma)).ReadAsSync();
                if (dcRma.AvailableActions.Contains(ReturnActions.AUTHORIZE))
                {
                    dcRma = (await _returnWebApiClient.PerformReturnActions(new DCr.ReturnAction()
                    {
                        ActionName = ReturnActions.AUTHORIZE,
                        ReturnIds = new List<string> { dcRma.Id }
                    })).ReadAsSync().Items.First();
                }
                retList.Add(await SingleMapFromContract(dcRma));
            }
            return List2(retList);
        }

        [HttpPostRoute(UriTemplate = "action")]
        public async Task<Response<List<Return>>> PerformReturnActions(DCr.ReturnAction action)
        {
            var dcRmas = (await _returnWebApiClient.PerformReturnActions(action)).ReadAsSync().Items;
            var rmas = await MultiMapFromContract(dcRmas);

            return List2(rmas);
        }

        public class PaymentActionDTO
        {
            public string OrderId { get; set; }
            public string ReturnId { get; set; }
            public string PaymentId { get; set; }
            public string PaymentType { get; set; }
            public decimal Amount { get; set; }
        }

        [HttpGetRoute(UriTemplate = "reasons")]
        public async Task<Response<List<string>>> GetReasons()
        {
            var returnReasons = (await _returnWebApiClient.GetReasons()).ReadAsSync().Items;

            return List2(returnReasons);
        }

        [HttpPostRoute(UriTemplate = "paymentAction")]
        public async Task<Response<List<Return>>> CreatePaymentActionForReturn(PaymentActionDTO action)
        {
            var dcPaymentAction = new DCp.PaymentAction
            {
                ActionName = PaymentActions.CREDIT_PAYMENT,
                Amount = action.Amount
            };

            switch (action.PaymentType)
            {
                case PaymentTypes.CREDIT_CARD:
                    dcPaymentAction.ReferenceSourcePaymentId = action.PaymentId;
                    break;
                case PaymentTypes.STORE_CREDIT:
                    dcPaymentAction.NewBillingInfo = new DCp.BillingInfo { PaymentType = PaymentTypes.STORE_CREDIT };
                    break;
            }

            var dcRma = (await _returnWebApiClient.CreatePaymentActionForReturn(action.ReturnId, dcPaymentAction)).ReadAsSync();

            dcRma.RefundAmount = dcRma.Payments.Sum(x => x.AmountCredited);
            dcRma = (await _returnWebApiClient.UpdateReturn(dcRma.Id, dcRma)).ReadAsSync();
            var rma = await SingleMapFromContract(dcRma);
            return List2(new List<Return> { rma });
        }

        public class ReplaceItemsArgs
        {
            /// <summary>
            /// The Id of the return you're performing the action upon
            /// </summary>
            public string ReturnId { get; set; }
            /// <summary>
            /// Pairings of ReturnItem IDs with the corresponding quantity to replace
            /// If empty or missing, assumes all items.
            /// </summary>
            public Dictionary<string, int> ItemReplacements { get; set; }
            /// <summary>
            /// An optional note to save when performing a replacement
            /// </summary>
            public string Note { get; set; }
        }

        [HttpPostRoute(UriTemplate = "createReplacementOrder")]
        public async Task<Response<Order>> CreateReplacementOrder(ReplaceItemsArgs args)
        {
            if (string.IsNullOrEmpty(args.ReturnId))
            {
                throw new VaeValidationConflictException($"{nameof(args.ReturnId)} not specified.");
            }

            var specifiers = args.ItemReplacements?.Select(x => new DCr.ReturnItemSpecifier { ReturnItemId = x.Key, Quantity = x.Value }).ToList();

            var childOrder = (await _returnWebApiClient.CreateReturnShippingOrder(args.ReturnId, specifiers)).ReadAsSync();

            if (!string.IsNullOrEmpty(args.Note))
            {
                (await _returnWebApiClient.CreateReturnNote(args.ReturnId, new OrderNote { Text = args.Note })).ReadAsSync();
            }

            return Single2(Mapper.Map<Order>(childOrder));
        }

        public class RefundPaymentsArgs
        {
            /// <summary>
            /// The Id of the return you're performing the action upon
            /// </summary>
            public string ReturnId { get; set; }
            /// <summary>
            /// The payments to apply the refund to
            /// </summary>
            public List<RefundPaymentAction> Refunds { get; set; }
            /// <summary>
            /// Pairings of ReturnItem IDs with the corresponding amount to refund for that item
            /// </summary>
            public Dictionary<string, decimal> ItemRefundAmounts { get; set; }
            /// <summary>
            /// An optional note to save when performing a refund
            /// </summary>
            public string Note { get; set; }

            public class RefundPaymentAction
            {
                public string OrderPaymentId { get; set; }
                public string PaymentType { get; set; }
                public decimal Amount { get; set; }
            }
        }

        [HttpPostRoute(UriTemplate = "refundPayments")]
        public async Task<Response<Return>> RefundPayments(RefundPaymentsArgs args)
        {
            if (string.IsNullOrEmpty(args.ReturnId))
            {
                throw new VaeValidationConflictException($"{nameof(args.ReturnId)} not specified.");
            }
            if (args.ItemRefundAmounts == null || !args.ItemRefundAmounts.Any())
            {
                throw new VaeValidationConflictException($"{nameof(args.ItemRefundAmounts)} not specified.");
            }
            if (args.Refunds == null || !args.Refunds.Any())
            {
                throw new VaeValidationConflictException($"{nameof(args.Refunds)} not specified.");
            }

            var itemTotal = args.ItemRefundAmounts.Sum(x => x.Value);
            var refundTotal = args.Refunds.Sum(x => x.Amount);
            if (itemTotal != refundTotal)
            {
                throw new VaeValidationConflictException($"Item refund total of {itemTotal} does not match refund total of {refundTotal}.");
            }

            var returnToUpdate = (await _returnWebApiClient.GetReturn(args.ReturnId)).ReadAsSync();

            foreach (var itemToRefundAmount in args.ItemRefundAmounts)
            {
                var item = returnToUpdate.Items.FirstOrDefault(x => x.Id == itemToRefundAmount.Key);
                if (item == null)
                {
                    throw new VaeItemNotFoundException(itemToRefundAmount.Key, "Item not found on return.");
                }
                item.RefundAmount = (item.RefundAmount ?? 0) + itemToRefundAmount.Value;
            }

            var existingPayments = (await _returnWebApiClient.GetPayments(args.ReturnId)).ReadAsSync();

            foreach (var refund in args.Refunds)
            {
                var dcPaymentAction = new DCp.PaymentAction
                {
                    ActionName = PaymentActions.CREDIT_PAYMENT,
                    Amount = refund.Amount
                };

                // If you don't have an OrderPaymentId, you're creating a new payment, either a Store Credit or a Check.
                if (string.IsNullOrEmpty(refund.OrderPaymentId))
                {
                    var acceptableNewRefundTypes = new[] { PaymentTypes.STORE_CREDIT, PaymentTypes.CHECK };
                    if (!acceptableNewRefundTypes.Contains(refund.PaymentType))
                    {
                        throw new VaeValidationConflictException(nameof(refund.PaymentType), $"\"{refund.PaymentType}\" is not a valid payment type for a new refund.");
                    }

                    dcPaymentAction.NewBillingInfo = new DCp.BillingInfo { PaymentType = refund.PaymentType };
                    (await _returnWebApiClient.CreatePaymentActionForReturn(args.ReturnId, dcPaymentAction)).ReadAsSync();
                }
                // If you are updating an order payment and we've already touched it, do an update.
                else if (existingPayments != null && existingPayments.Items.Any(i => i.Id == refund.OrderPaymentId))
                {
                    (await _returnWebApiClient.PerformPaymentActionForReturn(args.ReturnId, refund.OrderPaymentId, dcPaymentAction)).ReadAsSync();
                }
                // Otherwise do a create.
                else
                {
                    dcPaymentAction.ReferenceSourcePaymentId = refund.OrderPaymentId;
                    (await _returnWebApiClient.CreatePaymentActionForReturn(args.ReturnId, dcPaymentAction)).ReadAsSync();
                }
            }

            // TODO: If one of the refunds fails, we may need to adjust the item refund amounts accordingly.
            // TODO: What to do if we successfully refund, but this update fails?
            (await _returnWebApiClient.UpdateReturn(returnToUpdate.Id, returnToUpdate)).ReadAsSync();

            if (!string.IsNullOrEmpty(args.Note))
            {
                (await _returnWebApiClient.CreateReturnNote(args.ReturnId, new OrderNote { Text = args.Note })).ReadAsSync();
            }

            var dcReturn = (await _returnWebApiClient.GetReturn(args.ReturnId)).ReadAsSync();

            return Single2(await SingleMapFromContract(dcReturn));
        }


        public class CreateStoreCreditArgs
        {
            public string ReturnId { get; set; }
            public decimal Amount { get; set; }
        }

        [HttpPostRoute(UriTemplate = "createStoreCredit")]
        public async Task<Response<Return>> CreateStoreCredit(CreateStoreCreditArgs args)
        {
            var dcPaymentAction = new DCp.PaymentAction
            {
                ActionName = PaymentActions.CREDIT_PAYMENT,
                Amount = args.Amount,
                NewBillingInfo = new DCp.BillingInfo
                {
                    PaymentType = PaymentTypes.STORE_CREDIT
                }
            };

            var dcReturn = (await _returnWebApiClient.CreatePaymentActionForReturn(args.ReturnId, dcPaymentAction)).ReadAsSync();
            return Single2(await SingleMapFromContract(dcReturn));
        }

        // This handles a list of returns because the ExtJS Return Proxy expects to work with a list of returns.
        [HttpPostRoute(UriTemplate = "editmulti")]
        public async Task<Response<List<Return>>> EditMulti(List<Return> returns)
        {
            var retList = new List<Return>();
            foreach (var rma in returns)
            {
                var dcRma = Mapper.Map<DCr.Return>(rma);
                dcRma = (await _returnWebApiClient.UpdateReturn(dcRma.Id, dcRma)).ReadAsSync();

                retList.Add(await SingleMapFromContract(dcRma));
            }

            return List2(retList);
        }

        public class EditReturnArgs
        {
            /// <summary>
            /// The modified return.
            /// </summary>
            public Return Return { get; set; }
            /// <summary>
            /// An optional note to save when editing the return.
            /// </summary>
            public string Note { get; set; }
        }

        // The endpoint used for the react/redux return editor.
        [HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<Return>> Edit(EditReturnArgs args)
        {
            var dcRma = Mapper.Map<DCr.Return>(args.Return);
            dcRma = (await _returnWebApiClient.UpdateReturn(dcRma.Id, dcRma)).ReadAsSync();

            if (!string.IsNullOrEmpty(args.Note))
            {
                (await _returnWebApiClient.CreateReturnNote(args.Return.Id, new OrderNote { Text = args.Note })).ReadAsSync();
                dcRma = (await _returnWebApiClient.GetReturn(args.Return.Id)).ReadAsSync();
            }

            return Single2(await SingleMapFromContract(dcRma));
        }

        [HttpPostRoute(UriTemplate = "resendemail")]
        public async Task<Response<Return>> SendRMAEmail(DCr.ReturnAction action)
        {
            await (await _returnWebApiClient.ResendReturnEmail(action)).ReadAsAsync();

            // Why don't we just change the method signature?
            return EmptySingle2<Return>();
        }

        [HttpGetRoute(UriTemplate = "shipping/package/label")]
        public async Task<HttpResponseMessage> GetPackageLabel([FromUri]string returnId, [FromUri]string packageId)
        {
            var serviceResponse = await _returnWebApiClient.GetPackageLabel(returnId, packageId);

            // var contentStream = await response; // .ReadAsAsync();
            var httpContent = serviceResponse.ResponseMessage.Content;

            var contentStream = await httpContent.ReadAsStreamAsync();
            var myResponse = new HttpResponseMessage(HttpStatusCode.OK);
            myResponse.Content = new StreamContent(contentStream);
            myResponse.Content.Headers.ContentLength = serviceResponse.ResponseMessage.Content.Headers.ContentLength;
            myResponse.Content.Headers.ContentType = serviceResponse.ResponseMessage.Content.Headers.ContentType;
            myResponse.Content.Headers.LastModified = serviceResponse.ResponseMessage.Content.Headers.LastModified;
            return myResponse;
        }

        [HttpGetRoute(UriTemplate = "shipping/label")]
        public async Task<HttpResponseMessage> GetReturnLabel([FromUri]string returnId)
        {
            var returns = (await _returnWebApiClient.GetReturn(returnId)).ReadAsSync();
            if (string.IsNullOrEmpty(returns.Id))
            {
                throw new VaeValidationConflictException($"Return {returnId} not found.");
            }

            var order = (await _orderWebApiClient.GetOrder(returns.OriginalOrderId)).ReadAsAsync().Result;
            if (order == null)
            {
                throw new VaeValidationConflictException($"Order {returns.OriginalOrderId} not found.");
            }

            var location = (await _locationWebApiClient.GetLocation(returns.LocationCode)).ReadAsAsync().Result;
            if (location == null)
            {
                throw new VaeValidationConflictException($"Location {returns.LocationCode} not found.");
            }

            CARSModel.GenerateLabelRequest body = new CARSModel.GenerateLabelRequest();
            body.Currency = returns.CurrencyCode;

            body.FromContact = new CARSModel.Contact()
            {
                PersonName = order.FulfillmentInfo.FulfillmentContact.FirstName + " " + order.FulfillmentInfo.FulfillmentContact.LastNameOrSurname,
                Address = new List<string>() {
                    order.FulfillmentInfo.FulfillmentContact?.Address?.Address1??"",
                    order.FulfillmentInfo.FulfillmentContact?.Address?.Address2??"",
                    order.FulfillmentInfo.FulfillmentContact?.Address?.Address3??"",
                    order.FulfillmentInfo.FulfillmentContact?.Address?.Address4??""},
                PostalCode = order.FulfillmentInfo.FulfillmentContact?.Address?.PostalOrZipCode,
                City = order.FulfillmentInfo.FulfillmentContact?.Address?.CityOrTown,
                PhoneNumber = order.FulfillmentInfo.FulfillmentContact?.PhoneNumbers?.Home ?? order.FulfillmentInfo.FulfillmentContact?.PhoneNumbers?.Mobile,
                CountryCode = order.FulfillmentInfo.FulfillmentContact?.Address?.CountryCode,
                Residential = order.FulfillmentInfo.FulfillmentContact?.Address?.AddressType?.Equals("Residential") ?? false,
                StateCode = order.FulfillmentInfo.FulfillmentContact?.Address?.StateOrProvince,
                CompanyName = order.FulfillmentInfo.FulfillmentContact?.CompanyOrOrganization,
                Email = order.FulfillmentInfo.FulfillmentContact?.Email
            };

            body.ToContact = new CARSModel.Contact()
            {
                PersonName = location.Name,
                Address = new List<string>() {
                    string.Join(" ",location.Address?.Address1??""
                    ,location.Address?.Address2??""
                    ,location.Address?.Address3??""
                    ,location.Address?.Address4??"")
               },

                PostalCode = location.Address?.PostalOrZipCode,
                City = location.Address?.CityOrTown,
                CountryCode = location.Address?.CountryCode,
                PhoneNumber = string.IsNullOrWhiteSpace(location.Phone) ? "55555555555" : location.Phone,
                Residential = location.Address?.AddressType?.Equals("Residential"),
                StateCode = location.Address.StateOrProvince,
                CompanyName = null,
                Email = null
            };

            body.LocationCode = returns.LocationCode;
            body.OrderID = returns.OriginalOrderId;
            body.PackageHeight = 2;
            body.PackageWidth = 6;
            body.PackageLength = 12;
            body.PackageWeight = 2;
            body.Price = 20;
            body.Carrier = "UPS";
            body.PackagingType = "UPS_CUSTOMER_SUPPLIED_PACKAGE";
            body.ServiceType = "UPS_GROUND";
            body.LabelFormat = "LASER";
            body.UnitType = "IMPERIAL";
            body.ShipmentID = "1234";
            body.ValidateAddress = true;
            body.CustomerReferences = null;
            body.Test = false;

            var serviceResponse = _CARSApiWrapper.GenerateLabelUsingPOST(body);

            return Request.CreateResponse(HttpStatusCode.OK, serviceResponse);
        }

    }
}
