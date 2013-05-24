using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Customers;
using OrderAdmin = Mozu.SiteBuilder.UX.Models.Orders;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class Order_OldController : BaseController
    {
        private readonly IOrderWebApiClient _orderWebApiClient;

        public Order_OldController(IOrderWebApiClient orderWebApiClient)
        {
            if (orderWebApiClient == null)
            {
                throw new ArgumentNullException("orderWebApiClient");
            }

            _orderWebApiClient = orderWebApiClient;
        }

        [WebGet(UriTemplate = "availableorderactions/?orderId={orderId}")]
        public async Task<Response<List<string>>> GetAvailableOrderActions(string orderId)
        {
            var response = (await _orderWebApiClient.GetAvailableActions(orderId)).ReadAsSync();

            return List2(response);
        }

        [WebGet(UriTemplate = "availableshipmentactions/?orderId={orderId}")]
        public async Task<Response<List<string>>> GetAvailableShipmentActions(string orderId)
        {
            var response = (await _orderWebApiClient.GetAvailableShipmentActions(orderId)).ReadAsSync();
            return List2(response);
        }

        [WebGet(UriTemplate = "availablepaymentactions/?orderId={orderId}")]
        public async Task<Response<List<string>>> GetAvailablePaymentActions(string orderId)
        {
            var response = (await _orderWebApiClient.GetAvailablePaymentActions(orderId)).ReadAsSync();
            return List2(response);
        }

        /// <summary>
        /// Performs actions on the order
        /// </summary>
        /// <param name="orderId">The ID of the order</param>
        /// <param name="action">One of the following: Cancel, Close, Create, SetAsProcessing, Submit</param>
        /// <returns>Order</returns>
        [WebGet(UriTemplate = "orderaction/?orderId={orderId}&action={action}")]
        public async Task<Response<OrderAdmin.Order>> PerformOrderAction(string orderId, string action)
        {
            var response = (await _orderWebApiClient.PerformOrderAction(orderId, action)).ReadAsSync();
            return Single2(Mapper.Map<OrderAdmin.Order>(response));
        }

        /// <summary>
        /// Performs actions on the order shipment
        /// </summary>
        /// <param name="orderId">The ID of the order></param>
        /// <param name="action">One of the following: Ship</param>
        /// <returns></returns>
        [WebGet(UriTemplate = "shipmentaction/?orderId={orderId}&action={action}")]
        public async Task<Response<OrderAdmin.Order>> PerformShipmentAction(string orderId, string action)
        {
            var response = (await _orderWebApiClient.PerformShipmentAction(orderId, action)).ReadAsSync();
            return Single2(Mapper.Map<OrderAdmin.Order>(response));
        }

        // TODO: Need the strings here
        /// <summary>
        /// Performs actions on the payment
        /// </summary>
        /// <param name="orderId">The ID of the order</param>
        /// <param name="action">One of the following: ????</param>
        /// <returns></returns>
        [WebGet(UriTemplate = "paymentaction/?orderId={orderId}&action={action}")]
        public async Task<Response<OrderAdmin.Order>> PerformPaymentAction(string orderId, string action)
        {
            var response = (await _orderWebApiClient.PerformPaymentAction(orderId, action, null)).ReadAsSync();
            return Single2(Mapper.Map<OrderAdmin.Order>(response));
        }

        // Orders

        [WebGet(UriTemplate = "autocomplete/?query={query}")]
        public async Task<Response<List<AutoCompleteField<string>>>> SearchByName(string query, FilterCollection extFilter)
        {
            var filter = string.Empty;

            if (!string.IsNullOrEmpty(query))
            {
                int num;
                int.TryParse(query, out num);
                filter = string.Format(num > 0 ? "OrderNumber eq {0}" : "Payment.Card.BillingAddress.FirstName cont \"{0}\" or Payment.Card.BillingAddress.LastNameOrSurname cont \"{0}\"", query);
            }

            var response = (await _orderWebApiClient.GetOrders(0, 500, null, filter)).ReadAsSync();

            var retList = response.Items.Select(p => new AutoCompleteField<string>
            {
                Display = p.Payment.Card.BillingAddress.FirstName + " " + p.Payment.Card.BillingAddress.LastNameOrSurname,
                Path = p.Payment.Card.BillingAddress.FirstName + " " + p.Payment.Card.BillingAddress.LastNameOrSurname,
                Value = p.Id
            }).ToList();

            return List2(retList);
        }

        [WebGet(UriTemplate = "read")]
        public async Task<Response<List<OrderAdmin.Order>>> GetOrders([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            if (pagingParams.id != null)
            {
                var res = (await _orderWebApiClient.GetOrders(pagingParams.startIndex, pagingParams.pageSize, null, "OrderNumber eq " + pagingParams.id)).ReadAsSync();
                return List2(Mapper.Map<List<OrderAdmin.Order>>(res.Items));
            }
            var query = extFilter.GetValue<string>("query", null);
            string filter = "OrderStatus ne \"New\"";
            if (!string.IsNullOrEmpty(query))
            {
                int num;
                if (int.TryParse(query, out num))
                {
                    filter = "OrderNumber eq " + num;
                }
                else
                {
                    filter = string.Format("OrderStatus ne \"New\" and ( Payment.Card.BillingAddress.FirstName cont \"{0}\" or Payment.Card.BillingAddress.LastNameOrSurname cont \"{0}\" )", query);
                }
            }

            var customerId = extFilter.GetValue("customerId", 0);
            if (customerId != 0)
            {
                filter = "CustomerAccountId eq " + customerId;
            }

            var response = (await _orderWebApiClient.GetOrders(pagingParams.startIndex, pagingParams.pageSize, GetSort(pagingParams), filter)).ReadAsSync();
            return List2(Mapper.Map<List<OrderAdmin.Order>>(response.Items), (int)response.TotalCount);
        }

        private static string GetSort(PagingParamaters p)
        {
            if (p == null || p.sort == null || p.sort.Count == 0)
                return null;

            var sb = new StringBuilder();

            foreach (var sort in p.sort)
            {
                if (sb.Length > 0)
                {
                    sb.Append(" and ");
                }

                switch (sort.property.ToLowerInvariant())
                {
                    case "ordernumber":
                        sb.Append("OrderNumber");
                        break;
                    case "updatedate":
                        sb.Append("UpdateDate");
                        break;
                    case "billingfirstname":
                        sb.Append("Payment.Card.BillingAddress.FirstName");
                        break;
                    case "billinglastname":
                        sb.Append("Payment.Card.BillingAddress.LastNameOrSurname");
                        break;
                    case "total":
                        sb.Append("Total");
                        break;
                    case "fulfillmentstatus":
                        sb.Append("FulfillmentStatus");
                        break;
                    default:
                        {
                            throw new InvalidOperationException("unknown sort.property " + sort.property);
                        }
                }
                sb.Append(sort.IsAscending ? " asc" : " desc");
            }

            return sb.ToString();
        }

        [WebInvoke(UriTemplate = "create")]
        public async Task<Response<List<OrderAdmin.Order>>> CreateOrder(List<OrderAdmin.Order> orders)
        {
            var retOrders = new List<OrderAdmin.Order>();
            foreach (var order in orders)
            {
                var so = Mapper.Map<Mozu.CommerceRuntime.Contracts.Orders.Order >(order);
                var response = (await _orderWebApiClient.CreateOrder(so)).ReadAsSync();
                retOrders.Add(Mapper.Map<OrderAdmin.Order>(response));
            }
            return List2(retOrders);
        }

        [WebInvoke(UriTemplate = "delete/?orderId={orderId}")]
        public async Task<Response<OrderAdmin.Order>> DeleteOrder(string orderId)
        {
            var response = await _orderWebApiClient.DeleteOrder(orderId);
            var ret = response.ReadAsSync();
            return SuccessWithTotal2<OrderAdmin.Order>(1);
        }

        // Order notes

        [WebInvoke(UriTemplate = "ordernote/create/?orderId={orderId}")]
        public async Task<Response<OrderAdmin.OrderNote>> CreateOrderNote(OrderAdmin.OrderNote orderNote, string orderId)
        {
            var res = (await _orderWebApiClient.CreateOrderNote(Mapper.Map<Mozu.CommerceRuntime.Contracts.Orders.OrderNote>(orderNote), orderId)).ReadAsSync();
            return Single2(Mapper.Map<OrderAdmin.OrderNote>(res));
        }

        [WebInvoke(UriTemplate = "ordernote/read/?orderId={orderId}&id={id}")]
        public async Task<Response<OrderAdmin.OrderNote>> GetOrderNote(string orderId, string id)
        {
            var response = (await _orderWebApiClient.GetOrderNote(orderId, id)).ReadAsSync();
            return Single2(Mapper.Map<OrderAdmin.OrderNote>(response));
        }

        [WebGet(UriTemplate = "ordernote/list/?orderId={orderId}")]
        public async Task<Response<List<OrderAdmin.OrderNote>>> GetOrderNotes(string orderId)
        {
            var response = (await _orderWebApiClient.GetOrderNotes(orderId)).ReadAsSync();
            return Single2(Mapper.Map<List<OrderAdmin.OrderNote>>(response));
        }

        [WebInvoke(UriTemplate = "ordernote/delete/?orderId={orderId}&orderNoteId={orderNoteId}")]
        public async Task<Response<List<OrderAdmin.OrderNote>>> DeleteOrderNote(string orderId, string orderNoteId)
        {
            var response = (await _orderWebApiClient.DeleteOrderNote(orderId, orderNoteId)).ReadAsSync();
            return SuccessWithTotal2<List<OrderAdmin.OrderNote>>(1);
        }

        // Payment transactions

        [WebGet(UriTemplate = "paymenttransaction/list/?orderId={orderId}")]
        public async Task<Response<List<OrderAdmin.PaymentTransaction>>> GetPaymentTransactions(string orderId)
        {
            var response = (await _orderWebApiClient.GetPaymentTransactions(orderId)).ReadAsSync();
            return List2(Mapper.Map<List<OrderAdmin.PaymentTransaction>>(response));
        }

        [WebInvoke(UriTemplate = "paymenttransaction/create/?orderId={orderId}")]
        public async Task<Response<OrderAdmin.PaymentTransaction>> CreatePaymentTransaction(OrderAdmin.PaymentTransaction paymentTransaction, string orderId)
        {
            var response = (await _orderWebApiClient.CreatePaymentTransaction(Mapper.Map<Mozu.CommerceRuntime.Contracts.Orders.PaymentTransaction>(paymentTransaction), orderId)).ReadAsSync();
            return Single2(Mapper.Map<OrderAdmin.PaymentTransaction>(response));
        }

        // Shipment

        [WebGet(UriTemplate = "shipment/read/?orderId={orderId}")]
        public async Task<Response<OrderAdmin.Shipment>> GetShipment(string orderId)
        {
            var response = (await _orderWebApiClient.GetShipment(orderId)).ReadAsSync();
            return Single2(Mapper.Map<OrderAdmin.Shipment>(response));
        }

        [WebInvoke(UriTemplate = "shipment/edit/?orderId={orderId}")]
        public async Task<Response<OrderAdmin.Shipment>> UpdateShipment(OrderAdmin.Shipment shipment, string orderId)
        {
            var response = (await _orderWebApiClient.UpdateShipment(Mapper.Map<Mozu.CommerceRuntime.Contracts.Orders.Shipment>(shipment), orderId)).ReadAsSync();
            return Single2(Mapper.Map<OrderAdmin.Shipment>(response));
        }

        [WebInvoke(UriTemplate = "shipment/delete/?orderId={orderId}")]
        public async Task<Response<List<OrderAdmin.Shipment>>> DeleteShipment(string orderId)
        {
            var response = (await _orderWebApiClient.DeleteShipment(orderId)).ReadAsSync();
            return SuccessWithTotal2<List<OrderAdmin.Shipment>>(1);
        }

        // Payment

        [WebGet(UriTemplate = "payment/read/?orderId={orderId}")]
        public async Task<Response<OrderAdmin.PaymentReference>> GetPayment(string orderId)
        {
            var response = (await _orderWebApiClient.GetPayment(orderId)).ReadAsSync();
            return Single2(Mapper.Map<OrderAdmin.PaymentReference>(response));
        }

        [WebInvoke(UriTemplate = "payment/edit/?orderId={orderId}")]
        public async Task<Response<OrderAdmin.PaymentReference>> UpdatePayment(OrderAdmin.PaymentReference payment, string orderId)
        {
            Mozu.CommerceRuntime.Contracts.Orders .PaymentReference dcPayment = Mapper.Map<Mozu.CommerceRuntime.Contracts.Orders.PaymentReference>(payment);
            var response = (await _orderWebApiClient.UpdatePayment(dcPayment, orderId)).ReadAsSync();

            OrderAdmin.PaymentReference ret = Mapper.Map<OrderAdmin.PaymentReference>(response);

            return Single2(ret);
        }

        // Order items

        [WebGet(UriTemplate = "orderitem/read/?orderItemid={orderItemid}&orderId={orderId}")]
        public async Task<Response<OrderAdmin.OrderItem>> GetOrderItem(string orderItemId, string orderId)
        {
            var response = (await _orderWebApiClient.GetOrderItem(orderItemId, orderId)).ReadAsSync();
            var ret = Mapper.Map<OrderAdmin.OrderItem>(response);
            return Single2(ret);
        }

        [WebGet(UriTemplate = "orderitem/list/?orderId={orderId}")]
        public async Task<Response<List<OrderAdmin.OrderItem>>> GetOrderItems(string orderId)
        {
            var response = (await _orderWebApiClient.GetOrderItems(orderId)).ReadAsSync();
            var ret = Mapper.Map<List<OrderAdmin.OrderItem>>(response.Items);
            return List2(ret);
        }

        // Customers

        [WebGet(UriTemplate = "customer/list/?customerId={customerId}")]
        public async Task<Response<List<OrderAdmin.Order>>> GetCustomerOrders([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter, int customerId)
        {
            var filter = string.Format("CustomerAccountId eq {0}", customerId);
            var response = (await _orderWebApiClient.GetOrders(pagingParams.startIndex, pagingParams.pageSize, null, filter)).ReadAsSync();
            var ret = Mapper.Map<List<OrderAdmin.Order>>(response.Items);
            return List2(ret);
        }
    }
}