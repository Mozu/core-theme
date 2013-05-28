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

            var bfCustomer = new OrderCustomer
            {
                Id = "c12345",
                FirstName = "Ben",
                LastName = "Franklin",
                CustomerSince = new DateTime(2011, 01, 01),
                TotalOrders = 1,
                TotalSpent = 99.05m,
                Groups = new List<string>()
            };


            var jsCustomer = new OrderCustomer
            {
                Id = "c12346",
                FirstName = "John",
                LastName = "Smith",
                CustomerSince = new DateTime(2011, 03, 18),
                TotalOrders = 4,
                TotalSpent = 597.96m,
                Groups = new List<string> { "VIP", "Company ABC", "Coupon User" }
            };

            allTheOrders.Add(new Order
            {
                Id = "o123",
                OrderNumber = 12,
                CreateDate = new DateTime(2013, 03, 22),
                IpAddress = "127.0.0.1",
                Customer = bfCustomer,
                Total = 99.05m,
                OrderStatus = "Processing",
                ShippingStatus = "Partial Ship",
                PaymentStatus = "Paid",
                AvailableOrderActions = new List<string>()
            });

            allTheOrders.Add(new Order
            {
                Id = "o124",
                OrderNumber = 107363,
                CreateDate = new DateTime(2013, 03, 18),
                IpAddress = "173.194.46.2",
                Customer = jsCustomer,
                Total = 229.48m,
                CustomerNote = "Please take special care in packaging. Thanks!",
                Items = new List<OrderItem>
                {
                    new OrderItem {
                        Id = "i123",
                        ProductCode = "HOBO-LL",
                        ProductName = "Slouchy leather... lace hobo",
                        UnitPrice = 90m,
                        Quantity = 2,
                        Subtotal = 180m,
                        Discount = new OrderItemDiscount {
                            Description = "$10 off all leather bags",
                            UnitPrice = 10m,
                            Quantity = 2,
                            Total = 20m
                        },
                        Total = 160m
                    },
                    new OrderItem {
                        Id = "i124",
                        ProductCode = "789MAE",
                        ProductName = "Mary Mae's... Summer Sandals",
                        UnitPrice = 30m,
                        Quantity = 2,
                        Subtotal = 60m,
                        Total = 60m
                    }
                }
            });

            var taskResult = new TaskCompletionSource<List<Order>>();
            taskResult.SetResult(allTheOrders);

            return taskResult.Task;
        }


    }
}