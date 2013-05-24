using System;
using System.Collections.Generic;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class OrderController : BaseController
    {
        private  IOrderWebApiClient _orderWebApiClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public OrderController(IOrderWebApiClient orderWebApiClient)
        {
            _orderWebApiClient = orderWebApiClient;
        }

        [WebGet(UriTemplate = "list")]
        public async Task<Response<List<Order>>> List()
        {
            var orders = await GetMock();
            return List2(orders);
        }

        /// <summary>
        /// Gets a mock list of Orders.
        /// </summary>
        private Task<List<Order>> GetMock()
        {
            var allTheOrders = new List<Order>();

            var bfCustomer = new OrderCustomer { Id = "c12345", FirstName = "Ben", LastName = "Franklin" };

            allTheOrders.Add(new Order
            {
                Id = "o123",
                OrderNumber = 12,
                IpAddress = "127.0.0.1",
                Customer = bfCustomer,
                Total = 229.48m,
                OrderStatus = "Processing",
                ShippingStatus = "Partial Ship",
                PaymentStatus = "Paid",
                AvailableOrderActions = new List<string>()
            });


            var taskResult = new TaskCompletionSource<List<Order>>();
            taskResult.SetResult(allTheOrders);

            return taskResult.Task;
        }


    }
}