using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core.Api.Routing;
using Mozu.Core.Settings;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Returns;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Helpers.ReturnHelpers;
using DCp = Mozu.CommerceRuntime.Contracts.Payments;
using DCr = Mozu.CommerceRuntime.Contracts.Returns;
using DCu = Mozu.Customer.Contracts;
using ReturnActions = Mozu.CommerceRuntime.Contracts.Returns.ReturnAction.ReturnActionNameConst;
using PaymentActions = Mozu.CommerceRuntime.Contracts.Payments.PaymentAction.PaymentActionNameConst;
using PaymentTypes = Mozu.CommerceRuntime.Contracts.Payments.PaymentTypeConst;
using ApiCustomer = Mozu.SiteBuilder.UX.Admin.Api.Models.Customer;
using AdminUser2 = Mozu.SiteBuilder.UX.Admin.Api.Models.Account.User;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.Core.ErrorHandling;
using Mozu.Core.Exceptions;
using Mozu.Core.Extensions;
using Order = Mozu.SiteBuilder.UX.Admin.Api.Models.Order.Order;

// TODO Write return filter and search helpers! (See CustomerController)

namespace Mozu.SiteBuilder.UX.Admin.Api
{

    [WebApi("app/return", SuppressDescriptorGeneration = true)]
    public partial class ReturnController : BaseController
    {
        private readonly ISettings _settings;
        private IOrderWebApiClient _orderWebApiClient;
        private readonly IReturnWebApiClient _returnWebApiClient;
        private readonly ICreditWebApiClient _creditWebApiClient;
        private readonly IChannelWebApiClient _channelWebApiClient;

        private readonly ICustomerAccountWebApiClient _customerWebApiClient;
        private readonly IMultiScopeAdminUserWebApiClient _usersWebApiClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public ReturnController(IOrderWebApiClient orderWebApiClient, IReturnWebApiClient returnWebApiClient, ICreditWebApiClient creditWebApiClient,
            ISettings settings, ICustomerAccountWebApiClient customerWebApiClient, IMultiScopeAdminUserWebApiClient userWebApiClient,
            IChannelWebApiClient channelWebApiClient)
        {
            _settings = settings;
            _orderWebApiClient = orderWebApiClient;
            _returnWebApiClient = returnWebApiClient;
            _creditWebApiClient = creditWebApiClient;
            _customerWebApiClient = customerWebApiClient;
            _usersWebApiClient = userWebApiClient;
            _channelWebApiClient = channelWebApiClient;
        }

        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<Return>>> List([FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter, [FromUri] bool draft = false)
        {
            // TODO: Do we need to clone the _returnWebApiClient to clear out the siteId?

            // Get a single return
            if (!string.IsNullOrEmpty(pagingParams?.id))
            {
                return await GetSingleReturn(pagingParams.id);
            }

            int? startIndex = pagingParams?.startIndex;
            int? pageSize = pagingParams?.pageSize ?? 20;
            var sort = pagingParams?.sort.ToSortString();
            var filter = extFilter.ToFilterString();
            var q = extFilter.ToQString();
            // TODO: Should we do this other stuff used by the OrderController?
            //int? qLimit = q == null ? (int?)null : 26;
            //var responseGroups = "header,payment,packageheaders,availableactions";

            var dcReturns = (await _returnWebApiClient.GetReturns(startIndex: startIndex, pageSize: pageSize, sortBy: sort, filter: filter, q: q)).ReadAsSync();

            var returns = Mapper.Map<List<Return>>(dcReturns.Items);

            // Loop through the returns and get the channel code if it isn't in the dictionary below.
            // Remove this when we remove ext returns, this is checking for a return call from ext:
            var extReturn = filter.Contains("originalorderid");

            var channelDictionary = new Dictionary<string, string>();
            foreach (var ret in returns)
            {
                if (!ret.ChannelCode.IsNullOrEmpty())
                {
                    if (!channelDictionary.ContainsKey(ret.ChannelCode))
                    {
                        try
                        {
                            var channel = (await _channelWebApiClient.GetChannel(ret.ChannelCode)).ReadAsSync();
                            channelDictionary[channel.Code] = channel.Name;
                        }
                        catch (MozuApplicationException appException)
                        {
                            if (!ErrorCodes.ITEM_NOT_FOUND.Equals(appException.ErrorCode)) throw;

                            // If the channel can't be found, fallback to the channel code.
                            channelDictionary[ret.ChannelCode] = ret.ChannelCode;
                        }
                    }
                    ret.ChannelName = channelDictionary[ret.ChannelCode];
                }

                // If this is a return call from Ext, then we need the additional info!
                if (extReturn)
                {
                    await FillAdditionalInfo(ret);
                }
            }

            return List2(returns, total: (int)dcReturns.TotalCount);
        }

        private async Task FillAdditionalInfo(Return rma)
        {
            // Check the customer information -- if we already know about the customer, don't requery.
            if (rma.Contact == null)
            {
                var customerResult = await LookupCustomerAccount(rma.CustomerAccountId);
                if (customerResult != null)
                {
                    rma.Contact = new Contact
                    {
                        FirstName = customerResult.FirstName,
                        LastName = customerResult.LastName,
                        Email = customerResult.EmailAddress
                    };
                }
            }
            var customerName = rma.Contact == null ? string.Empty : $"{rma.Contact.FirstName} {rma.Contact.LastName} #{rma.CustomerAccountId}";

            // Check the users..we can skip the user retrieval on this return if:
            var sameUser = rma.CreatedBy == rma.UpdatedBy;

            rma.CreatedBy = await LookUpUserById(rma.CreatedBy) ?? customerName;

            rma.UpdatedBy = !sameUser ? await LookUpUserById(rma.UpdatedBy) ?? customerName : rma.CreatedBy;

            // I want to sum all the items where the return was required.
            rma.TotalItemsToReplace = rma.Items.Where(x => x.ReturnType == "Replace").Sum(x => x.Quantity);
            rma.ItemsReplaced = rma.Items.Sum(x => x.QuantityReplaced.GetValueOrDefault(0));

            rma.TotalItemsToRefund = rma.Items.Where(x => x.ReturnType == "Refund").Sum(x => x.Quantity);
            rma.ItemsRefunded = rma.Items.Where(x => x.RefundAmount > 0).Sum(x => x.Quantity);

            // Run through all the return items and place them all into one single list at the parent return level.
            // TODO: Remap this to keep the notes at the item level.
            rma.CustomerNotes = rma.Items.Where(x => !x.Notes.IsNullOrEmpty()).Select(x => x.Notes).ToList().FirstOrDefault();

            // TODO: Fix this when we have multiple orders
            if (!rma.ReturnOrderId.IsNullOrEmpty())
            {
                // TenantId and SiteId are automatically added via ApiContext on the back end.
                var filter = $"parentReturnId eq {rma.Id}";
                // TODO: Do we really want the Header responseGroup? It reduces payload, but money values are goofed up, though total seems ok.
                var dcOrders = (await _orderWebApiClient.GetOrders(filter: filter, responseGroups: "Header")).ReadAsSync();
                var sbOrders = Mapper.Map<List<Order>>(dcOrders.Items);
                rma.ReturnOrders = sbOrders;
            }
        }

        private async Task<DCu.CustomerAccount> LookupCustomerAccount(int? customerAccountId)
        {
            if (customerAccountId == null) return null;

            try
            {
                return (await _customerWebApiClient.GetAccount(customerAccountId)).ReadAsSync();
            }
            catch (MozuApplicationException appException)
            {
                if (ErrorCodes.ITEM_NOT_FOUND.Equals(appException.ErrorCode)) return null;

                throw;
            }
        }

        private async Task<string> LookUpUserById(string userId)
        {
            try
            {
                var userResult = (await _usersWebApiClient.GetUser(userId)).ReadAsSync();

                return userResult == null ? null : $"{userResult.FirstName} {userResult.LastName}";
            }
            catch (MozuApplicationException appException)
            {
                // Handle VaeItemNotFoundException
                if (ErrorCodes.ITEM_NOT_FOUND.Equals(appException.ErrorCode)) return null;

                throw;
            }
        }

        private async Task<Response<List<Return>>> GetSingleReturn(string returnId)
        {
            var dcReturn = (await _returnWebApiClient.GetReturn(returnId)).ReadAsSync();

            if (dcReturn == null) throw new HttpResponseException(HttpStatusCode.NotFound);

            var sbReturn = Mapper.Map<Return>(dcReturn);

            await FillAdditionalInfo(sbReturn);

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
                retList.Add(Mapper.Map<Return>(dcRma));
            }
            return List2(retList);
        }

        [HttpPostRoute(UriTemplate = "action")]
        public async Task<Response<List<Return>>> PerformReturnActions(DCr.ReturnAction action)
        {
            var dcRma = (await _returnWebApiClient.PerformReturnActions(action)).ReadAsSync().Items;

            return List2(Mapper.Map<List<Return>>(dcRma));
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
            return List2(Mapper.Map<List<Return>>(new List<DCr.Return> { dcRma }));
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

            var specifiers = args.ItemReplacements?.Select(x => new DCr.ReturnItemSpecifier {ReturnItemId = x.Key, Quantity = x.Value}).ToList();

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

            return Single2(Mapper.Map<Return>(dcReturn));
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
            return Single2(Mapper.Map<Return>(dcReturn));
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

                retList.Add(Mapper.Map<Return>(dcRma));
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

            return Single2(Mapper.Map<Return>(dcRma));
        }

        [HttpPostRoute(UriTemplate = "resendemail")]
        public async Task<Response<Return>> SendRMAEmail(DCr.ReturnAction action)
        {
            await (await _returnWebApiClient.ResendReturnEmail(action)).ReadAsAsync();

            return this.EmptySingle2<Return>();
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
    }
}
