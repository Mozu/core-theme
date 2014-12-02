using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Routing;
using Mozu.Core.Exceptions;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using DCo = Mozu.CommerceRuntime.Contracts.Orders;
using DCp = Mozu.CommerceRuntime.Contracts.Payments;
using DCs = Mozu.CommerceRuntime.Contracts.Fulfillment;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public partial class OrderController
    {
        private static readonly List<string> VALID_BULK_ACTIONS = new List<string>
        {
            CommerceRuntime.Contracts.Orders.OrderAction.OrderActionNameConst.ACCEPT_ORDER,
            CommerceRuntime.Contracts.Orders.OrderAction.OrderActionNameConst.CANCEL_ORDER,
            CommerceRuntime.Contracts.Fulfillment.FulfillmentAction.FulfillmentActionNameConst.SHIP,
            CommerceRuntime.Contracts.Payments.PaymentAction.PaymentActionNameConst.CAPTURE_PAYMENT
        };


        [HttpPostRoute(UriTemplate = "action")]
        public async Task<Response<List<OrderActionResult>>> PerformOrdersAction(BulkOrderRequest request)
        {
            if (!VALID_BULK_ACTIONS.Contains(request.ActionName, StringComparer.OrdinalIgnoreCase))
            {
                throw new VaeMissingOrInvalidParameterException("ActionName",
                    string.Format("Valid bulk order actions are '{0}'",
                        string.Join("' , '", VALID_BULK_ACTIONS)));
            }
            var performOrderActionTasks = request.OrderContexts.Select(
                ctx => PerformOrderAction(request.ActionName, ctx))
                        .ToList();

            var bulkResult = new Response<List<OrderActionResult>>{Success = true, Items = new List<OrderActionResult>(), Total = request.OrderContexts.Count};
            await Task.WhenAll(performOrderActionTasks);
            foreach (var orderIdToActionTask in performOrderActionTasks)
            {
                var actionResult = orderIdToActionTask.Result;
                var orderActionResult = new OrderActionResult { OrderId = actionResult.OrderId, Successful = true, Message = actionResult.Message };
                bulkResult.Items.Add(orderActionResult);
                orderActionResult.StatusCode = actionResult.StatusCode;
                if (orderActionResult.StatusCode != HttpStatusCode.OK)
                {
                    bulkResult.Success = false;
                    orderActionResult.Successful = false;
                }
            }
            return bulkResult;
        }

        private async Task<InternalBulkActionResult> PerformOrderAction(string actionName, OrderContext orderContext)
        {
            if (actionName.EqualsIgnoreCase(CommerceRuntime.Contracts.Orders.OrderAction.OrderActionNameConst.ACCEPT_ORDER)
                || actionName.EqualsIgnoreCase(CommerceRuntime.Contracts.Orders.OrderAction.OrderActionNameConst.CANCEL_ORDER))
            {
                return await PerformRootAction(actionName, orderContext);
            }
            if (actionName.EqualsIgnoreCase(CommerceRuntime.Contracts.Fulfillment.FulfillmentAction.FulfillmentActionNameConst.SHIP))
            {
                return await PerformFulfillmentShipAction(actionName, orderContext);
            }
            if(actionName.EqualsIgnoreCase(CommerceRuntime.Contracts.Payments.PaymentAction.PaymentActionNameConst.CAPTURE_PAYMENT)){
                return await PerformPaymentCaptureAction(actionName, orderContext);
            }
            throw new VaeMissingOrInvalidParameterException("actionName");
        }

        private async Task<InternalBulkActionResult> PerformRootAction(string actionName, OrderContext orderContext)
        {
            var orderWebApiClient = _orderWebApiClient.CloneWithApiContext(context => context.MasterCatalogId = orderContext.MasterCatalogId);

            var orderResponse = await orderWebApiClient.PerformOrderAction(orderContext.OrderId, new DCo.OrderAction { ActionName = actionName });
            var result = new InternalBulkActionResult
            {
                ActionName = actionName,
                OrderId = orderContext.OrderId,
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
        private async Task<InternalBulkActionResult> PerformFulfillmentShipAction(string actionName, OrderContext orderContext)
        {
            var orderWebApiClient = _orderWebApiClient.CloneWithApiContext(context => context.MasterCatalogId = orderContext.MasterCatalogId);
            var orderResponse = await orderWebApiClient.GetOrder(orderContext.OrderId);
            var result = new InternalBulkActionResult
            {
                ActionName = actionName,
                OrderId = orderContext.OrderId,
                StatusCode = orderResponse.ResponseMessage.StatusCode
            };
            if (result.StatusCode == HttpStatusCode.OK)
            {
                var packages = orderResponse.ReadAsSync().Packages;
                if (packages.IsNullOrEmpty())
                {
                    result.StatusCode = HttpStatusCode.NotFound;
                    result.Message = "No packages found on the order";
                    return result;
                }

                // happy path, go forth a perform action on orders physical packages
                var fulfillmentResponse = await orderWebApiClient.PerformFulfillmentAction(orderContext.OrderId,
                    new DCs.FulfillmentAction()
                    {
                        ActionName = actionName,
                        PackageIds = packages.Select(p => p.Id).ToList()
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
//                    if (digitalPackages.Any())
//                    {
//                        // successfully marked physical packages as shipped but need to inform the user that there were digital packages
//                        result.Message = string.Format("Order contains {0} digital packages which were not altered", digitalPackages.Count);
//                    }
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
        private async Task<InternalBulkActionResult> PerformPaymentCaptureAction(string actionName, OrderContext orderContext)
        {
            var orderWebApiClient = _orderWebApiClient.CloneWithApiContext(context => context.MasterCatalogId = orderContext.MasterCatalogId);
            var result = new InternalBulkActionResult
            {
                ActionName = actionName,
                StatusCode = HttpStatusCode.BadRequest,
                OrderId = orderContext.OrderId
            };
            var orderResponse = await orderWebApiClient.GetPayments(orderContext.OrderId);

            var payments = orderResponse.ReadAsSync().Items;

            // perform validation on the payments; return BadRequest early if validation fails
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
                result.Message = string.Format("'{0}' is not a valid paymentType for a bulk capture action.",
                    CommerceRuntime.Contracts.Payments.PaymentTypeConst.CHECK);
                return result;
            }

            // validation passed; perform payment action
            var action = new DCp.PaymentAction
            {
                ActionName = actionName,
                Amount = payment.AmountRequested - payment.AmountCollected
            };

            var paymentResponse = await orderWebApiClient.PerformPaymentAction(orderContext.OrderId, payment.Id, action);

            // overwrite default values with real ones from the response
            result.StatusCode = paymentResponse.ResponseMessage.StatusCode;
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
