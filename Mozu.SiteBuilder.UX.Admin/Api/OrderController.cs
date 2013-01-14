using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using OrderClinet = Mozu.Order.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Customers;
using OrderAdmin = Mozu.SiteBuilder.UX.Models.Orders;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class OrderController : BaseController
    {
        private readonly OrderClinet.IOrderWebApiClient _orderWebApiClient;

        public OrderController(OrderClinet.IOrderWebApiClient orderWebApiClient)
        {
            if(orderWebApiClient == null)
            {
                throw new ArgumentNullException("orderWebApiClient");
            }

            _orderWebApiClient = orderWebApiClient;
        }

        [WebGet(UriTemplate = "availableorderactions/?orderId={orderId}")]
        public Task<Response<List<string>>> GetAvailableOrderActions(string orderId)
        {
            var response = _orderWebApiClient.GetAvailableActions(orderId).Result.ReadAsSync();
            return List(response);
        }

        [WebGet(UriTemplate = "availableshipmentactions/?orderId={orderId}")]
        public Task<Response<List<string>>> GetAvailableShipmentActions(string orderId)
        {
            var response = _orderWebApiClient.GetAvailableShipmentActions(orderId).Result.ReadAsSync();
            return List(response);
        }

        [WebGet(UriTemplate = "availablepaymentactions/?orderId={orderId}")]
        public Task<Response<List<string>>> GetAvailablePaymentActions(string orderId)
        {
            var response = _orderWebApiClient.GetAvailablePaymentActions(orderId).Result.ReadAsSync();
            return List(response);
        }

        /// <summary>
        /// Performs actions on the order
        /// </summary>
        /// <param name="orderId">The ID of the order</param>
        /// <param name="action">One of the following: Cancel, Close, Create, SetAsProcessing, Submit</param>
        /// <returns>Order</returns>
        [WebGet(UriTemplate = "orderaction/?orderId={orderId}&action={action}")]
        public Task<Response<OrderAdmin.Order>> PerformOrderAction(string orderId, string action)
        {
            var response = _orderWebApiClient.PerformOrderAction(orderId, action).Result.ReadAsSync();
            return Single(Mapper.Map<OrderAdmin.Order>(response));
        }

        /// <summary>
        /// Performs actions on the order shipment
        /// </summary>
        /// <param name="orderId">The ID of the order></param>
        /// <param name="action">One of the following: Ship</param>
        /// <returns></returns>
        [WebGet(UriTemplate = "shipmentaction/?orderId={orderId}&action={action}")]
        public Task<Response<OrderAdmin.Order>> PerformShipmentAction(string orderId, string action)
        {
            var response = _orderWebApiClient.PerformShipmentAction(orderId, action).Result.ReadAsSync();
            return Single(Mapper.Map<OrderAdmin.Order>(response));
        }

        // TODO: Need the strings here
        /// <summary>
        /// Performs actions on the payment
        /// </summary>
        /// <param name="orderId">The ID of the order</param>
        /// <param name="action">One of the following: ????</param>
        /// <returns></returns>
        [WebGet(UriTemplate = "paymentaction/?orderId={orderId}&action={action}")]
        public Task<Response<OrderAdmin.Order>> PerformPaymentAction(string orderId, string action)
        {
            var response = _orderWebApiClient.PerformPaymentAction(orderId, action, null).Result.ReadAsSync();
            return Single(Mapper.Map<OrderAdmin.Order>(response));
        }

        // Orders

        [WebGet(UriTemplate = "autocomplete/?query={query}")]
        public Task<Response<List<AutoCompleteField<string>>>> SearchByName(string query, FilterCollection extFilter)
        {
            var filter = string.Empty;

            if (!string.IsNullOrEmpty(query))
            {
                int num;
                int.TryParse(query, out num);
                filter = string.Format(num > 0 ? "OrderNumber eq {0}" : "Payment.Card.BillingAddress.FirstName cont \"{0}\" or Payment.Card.BillingAddress.LastNameOrSurname cont \"{0}\"", query);
            }

            var response = _orderWebApiClient.GetOrders(0, 500, null, filter).Result.ReadAsSync();

            var retList = response.Items.Select(p => new AutoCompleteField<string>
            {
                Display = p.Payment.Card.BillingAddress.FirstName + " " + p.Payment.Card.BillingAddress.LastNameOrSurname,
                Path = p.Payment.Card.BillingAddress.FirstName + " " + p.Payment.Card.BillingAddress.LastNameOrSurname,
                Value = p.Id
            }).ToList();

            return List(retList);
        }

        [WebGet(UriTemplate = "read")]
        public Task<Response<List<OrderAdmin.Order>>> GetOrders(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            if (pagingParams.id != null)
            {
                var res = _orderWebApiClient.GetOrders(pagingParams.startIndex, pagingParams.pageSize, null, "OrderNumber eq " + pagingParams.id).Result.ReadAsSync();
                return List(Mapper.Map<List<OrderAdmin.Order>>(res.Items));
            }
            var query = extFilter.GetValue<string>("query", null);
            string filter = "OrderStatus ne \"New\"";
            if (!string.IsNullOrEmpty(query) )
            {
                int num;
                if ( int.TryParse(query, out num))
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

            var response = _orderWebApiClient.GetOrders(pagingParams.startIndex, pagingParams.pageSize, GetSort(pagingParams), filter).Result.ReadAsSync();
            return List(Mapper.Map<List<OrderAdmin.Order>>(response.Items), (int)response.TotalCount);
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
                var so = Mapper.Map<Mozu.Order.Contracts.Order>(order);
                var response = await _orderWebApiClient.CreateOrder(so);
                var ret = await response.ReadAsAsync();
                retOrders.Add(Mapper.Map<OrderAdmin.Order>(ret));
            }
            return List2<OrderAdmin.Order>  (retOrders);
        }

        [WebInvoke(UriTemplate = "delete/?orderId={orderId}")]
        public Task<Response<bool>> DeleteOrder(string orderId)
        {
            var response = _orderWebApiClient.DeleteOrder(orderId).Result.ReadAsSync();
            return Single(true);
        }

        // Order notes

        [WebInvoke(UriTemplate = "ordernote/create/?orderId={orderId}")]
        public Task<Response<OrderAdmin.OrderNote>> CreateOrderNote(OrderAdmin.OrderNote orderNote, string orderId)
        {
            var response = _orderWebApiClient.CreateOrderNote(Mapper.Map<Mozu.Order.Contracts.OrderNote>(orderNote), orderId).Result.ReadAsSync();
            return Single(Mapper.Map<OrderAdmin.OrderNote>(response));
        }

        [WebInvoke(UriTemplate = "ordernote/read/?orderId={orderId}&id={id}")]
        public Task<Response<OrderAdmin.OrderNote>> GetOrderNote(string orderId, string id)
        {
            var response = _orderWebApiClient.GetOrderNote(orderId, id).Result.ReadAsSync();
            return Single(Mapper.Map<OrderAdmin.OrderNote>(response));
        }

        [WebGet(UriTemplate = "ordernote/list/?orderId={orderId}")]
        public Task<Response<List<OrderAdmin.OrderNote>>> GetOrderNotes(string orderId)
        {
            var response = _orderWebApiClient.GetOrderNotes(orderId).Result.ReadAsSync();
            return Single(Mapper.Map<List<OrderAdmin.OrderNote>>(response));
        }

        [WebInvoke(UriTemplate = "ordernote/delete/?orderId={orderId}&orderNoteId={orderNoteId}")]
        public Task<Response<bool>> DeleteOrderNote(string orderId, string orderNoteId)
        {
            var response = _orderWebApiClient.DeleteOrderNote(orderId, orderNoteId).Result.ReadAsSync();
            return Single(true);
        }

        // Payment transactions

        [WebGet(UriTemplate = "paymenttransaction/list/?orderId={orderId}")]
        public Task<Response<List<OrderAdmin.PaymentTransaction>>> GetPaymentTransactions(string orderId)
        {
            var response = _orderWebApiClient.GetPaymentTransactions(orderId).Result.ReadAsSync();
            return List(Mapper.Map<List<OrderAdmin.PaymentTransaction>>(response));
        }

        [WebInvoke(UriTemplate = "paymenttransaction/create/?orderId={orderId}")]
        public Task<Response<OrderAdmin.PaymentTransaction>> CreatePaymentTransaction(OrderAdmin.PaymentTransaction paymentTransaction, string orderId)
        {
            var response = _orderWebApiClient.CreatePaymentTransaction(Mapper.Map<Mozu.Order.Contracts.PaymentTransaction>(paymentTransaction), orderId).Result.ReadAsSync();
            return Single(Mapper.Map<OrderAdmin.PaymentTransaction>(response));
        }

        // Shipment

        [WebGet(UriTemplate = "shipment/read/?orderId={orderId}")]
        public Task<Response<OrderAdmin.Shipment>> GetShipment(string orderId)
        {
            var response = _orderWebApiClient.GetShipment(orderId).Result.ReadAsSync();
            return Single(Mapper.Map<OrderAdmin.Shipment>(response));
        }

        [WebInvoke(UriTemplate = "shipment/edit/?orderId={orderId}")]
        public Task<Response<OrderAdmin.Shipment>> UpdateShipment(OrderAdmin.Shipment shipment, string orderId)
        {
            var response = _orderWebApiClient.UpdateShipment(Mapper.Map<Mozu.Order.Contracts.Shipment>(shipment), orderId).Result.ReadAsSync();
            return Single(Mapper.Map<OrderAdmin.Shipment>(response));
        }

        [WebInvoke(UriTemplate = "shipment/delete/?orderId={orderId}")]
        public Task<Response<bool>> DeleteShipment(string orderId)
        {
            var response = _orderWebApiClient.DeleteShipment(orderId).Result.ReadAsSync();
            return Single(true);
        }

        // Payment

        [WebGet(UriTemplate = "payment/read/?orderId={orderId}")]
        public Task<Response<OrderAdmin.PaymentReference>> GetPayment(string orderId)
        {
            var response = _orderWebApiClient.GetPayment(orderId).Result.ReadAsSync();
            return Single(Mapper.Map<OrderAdmin.PaymentReference>(response));
        } 

        [WebInvoke(UriTemplate = "payment/edit/?orderId={orderId}")]
        public Task<Response<OrderAdmin.PaymentReference>> UpdatePayment(OrderAdmin.PaymentReference payment, string orderId)
        {
            var response = _orderWebApiClient.UpdatePayment(Mapper.Map<Mozu.Order.Contracts.PaymentReference>(payment), orderId).Result.ReadAsSync();
            return Single(Mapper.Map<OrderAdmin.PaymentReference>(response));
        }

        // Order items

        [WebGet(UriTemplate = "orderitem/read/?orderItemid={orderItemid}&orderId={orderId}")]
        public Task<Response<OrderAdmin.OrderItem>> GetOrderItem(string orderItemId, string orderId)
        {
            var response = _orderWebApiClient.GetOrderItem(orderItemId, orderId).Result.ReadAsSync();
            return Single(Mapper.Map<OrderAdmin.OrderItem>(response));
        }

        [WebGet(UriTemplate = "orderitem/list/?orderId={orderId}")]
        public Task<Response<List<OrderAdmin.OrderItem>>> GetOrderItems(string orderId)
        {
            var response = _orderWebApiClient.GetOrderItems(orderId).Result.ReadAsSync();
            return List(Mapper.Map<List<OrderAdmin.OrderItem>>(response.Items));
        }

        // Customers

        [WebGet(UriTemplate = "customer/list/?customerId={customerId}")]
        public Task<Response<List<OrderAdmin.Order>>> GetCustomerOrders(PagingParamaters pagingParams, FilterCollection extFilter, int customerId)
        {
            var filter = string.Format("CustomerAccountId eq {0}", customerId);
            var response = _orderWebApiClient.GetOrders(pagingParams.startIndex, pagingParams.pageSize, null, filter).Result.ReadAsSync();
            return List(Mapper.Map<List<OrderAdmin.Order>>(response.Items));
        }
    }
}