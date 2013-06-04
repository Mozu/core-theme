using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using NSubstitute;
using DCc = Mozu.Customer.Contracts;
using DCclient = Mozu.Core.Api.Contracts.Client;
using DCo = Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.SiteBuilder.UX.Admin.Helpers.OrderHelpers;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class OrderController : BaseController
    {
        private IOrderWebApiClient _orderWebApiClient;
        private ICustomerAccountWebApiClient _customerWebApiClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public OrderController(IOrderWebApiClient orderWebApiClient)
        {
            _orderWebApiClient = orderWebApiClient;
            // _orderWebApiClient = MockByProck();
            // _customerWebApiClient = MockByProckstomer();
        }

        public static List<Order> DoSort<TKey>(List<Order> orders, Func<Order, TKey> keySelector, bool isAscending)
        {
            if (isAscending)
                return orders.OrderBy(keySelector).ToList();
            else
                return orders.OrderByDescending(keySelector).ToList();
        }

        [WebGet(UriTemplate = "list")]
        public async Task<Response<List<Order>>> List([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            int? startIndex = pagingParams.startIndex;
            int? pageSize = pagingParams.pageSize ?? 20;
            SortingCollectionItem sort = pagingParams.sort == null ? null : pagingParams.sort.FirstOrDefault();

            var dcOrders = (await _orderWebApiClient.GetOrders(startIndex, pageSize, pagingParams.sort.ToSortString(), "" /* TODO: filter */)).ReadAsSync();

            var orders = await GetMock();
            // var orders2 = Mapper.Map<List<Order>>(dcOrders.Items);

            if (sort != null)
            {
                switch (sort.property)
                {
                    case "orderId":
                        orders = DoSort(orders, o => o.Id, sort.IsAscending);
                        break;
                    case "orderNumber":
                        orders = DoSort(orders, o => o.OrderNumber, sort.IsAscending);
                        break;
                    case "createDate":
                        orders = DoSort(orders, o => o.CreateDate, sort.IsAscending);
                        break;
                    case "customer.firstName":
                        orders = DoSort(orders, o => o.Customer.FirstName, sort.IsAscending);
                        break;
                    case "customer.lastName":
                        orders = DoSort(orders, o => o.Customer.LastName, sort.IsAscending);
                        break;
                    case "total":
                        orders = DoSort(orders, o => o.Total, sort.IsAscending);
                        break;
                    case "orderStatus":
                        orders = DoSort(orders, o => o.OrderStatus, sort.IsAscending);
                        break;
                    case "shippingStatus":
                        orders = DoSort(orders, o => o.ShippingStatus, sort.IsAscending);
                        break;
                }
            }

            if (pagingParams.id != null)
                return List2( orders.Where(o => o.Id == pagingParams.id).ToList() );

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
                Subtotal = 220m,
                ShippingTotal = 9.48m,
                TaxTotal = 0m,
                FeeTotal = 0m,
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