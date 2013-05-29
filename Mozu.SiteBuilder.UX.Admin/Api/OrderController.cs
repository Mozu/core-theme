using System;
using System.Linq;
using System.Collections.Generic;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using NSubstitute;
using DCo = Mozu.CommerceRuntime.Contracts.Orders;
using DCc = Mozu.Customer.Contracts;
using DCclient = Mozu.Core.Api.Contracts.Client;

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

        /// <summary>
        /// Provide a mock order repository
        /// </summary>
        private IOrderWebApiClient MockByProck()
        {
            var api = Substitute.For<IOrderWebApiClient>();

            api.GetOrders(Arg.Any<int?>(), Arg.Any<int?>(), Arg.Any<string>(), Arg.Any<string>()).Returns(arg => {
                var orders = new DCo.OrderCollection();
                orders.Items = new List<DCo.Order>
                {
                    new DCo.Order {
                        Id = "o123",
                        CustomerAccountId = 1,
                        OrderNumber = 12,
                        CreateDate = new DateTime(2013, 03, 22),
                        IPAddress = "127.0.0.1",
                        AvailableOrderActions = new List<string>(),
                    },
                    new DCo.Order {
                        Id = "o124",
                        CustomerAccountId = 2,
                        OrderNumber = 107363,
                        CreateDate = new DateTime(2013, 03, 18),
                        IPAddress = "173.194.46.2",
                        Items = new List<DCo.OrderItem> {
                            new DCo.OrderItem {
                                Id = "i123"
                            }
                        }
                    }
                };

                // wrap the order collection in a Task<DCC.ServiceClientResponse<DCo.OrderCollection>>
                var response = Substitute.For<DCclient.ServiceClientResponse<DCo.OrderCollection>>();
                response.ReadAsSync().Returns(orders);
                var responseTask = new TaskCompletionSource<DCclient.ServiceClientResponse<DCo.OrderCollection>>();
                responseTask.SetResult(response);

                return responseTask.Task;
            });

            return api;
        }

        /// <summary>
        /// Provide a mock customer repository
        /// </summary>
        private ICustomerAccountWebApiClient MockByProckstomer()
        {
            var api = Substitute.For<ICustomerAccountWebApiClient>();
            
            api.GetCustomerAccount(Arg.Any<int?>()).Returns(args => {
                int? custId = args.Arg<int?>();
                DCc.CustomerAccount cust;

                switch (custId)
                {
                    case 1:
                        cust = new DCc.CustomerAccount {
                            Id = 1,
                            Groups = new List<DCc.CustomerAccountGroup>(),
                            Contacts = new List<DCc.CustomerAccountContact> {
                                new DCc.CustomerAccountContact {
                                    Id = 1,
                                    IsPrimary = true,
                                    Contact = new Core.Api.Contracts.Contact {
                                        FirstName = "Ben",
                                        LastNameOrSurname = "Franklin",
                                    }
                                }
                            }
                        };
                        break;
                    case 2:
                        cust = new DCc.CustomerAccount {
                            Id = 1,
                            Groups = (new string[] { "VIP", "Company ABC", "Coupon User" }).Select(g => new DCc.CustomerAccountGroup { Name = g }).ToList(),
                            Contacts = new List<DCc.CustomerAccountContact> {
                                new DCc.CustomerAccountContact {
                                    Id = 2,
                                    IsPrimary = true,
                                    Contact = new Core.Api.Contracts.Contact {
                                        FirstName = "John",
                                        LastNameOrSurname = "Smith",
                                    }
                                }
                            }
                        };
                        break;
                    default:
                        cust = null;
                        break;
                }

                // wrap the customer in a Task<DCC.ServiceClientResponse<DCc.CustomerAccount>>
                var response = Substitute.For<DCclient.ServiceClientResponse<DCc.CustomerAccount>>();
                response.ReadAsSync().Returns(cust);
                var responseTask = new TaskCompletionSource<DCclient.ServiceClientResponse<DCc.CustomerAccount>>();
                responseTask.SetResult(response);

                return responseTask.Task;
            });

            return api;
        }
    }
}