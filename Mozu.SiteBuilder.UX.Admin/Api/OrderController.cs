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
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using Mozu.SiteBuilder.UX.Admin.Helpers.OrderHelpers;
using DCo = Mozu.CommerceRuntime.Contracts.Orders;
using DCp = Mozu.CommerceRuntime.Contracts.Payments;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public partial class OrderController : BaseController
    {
        private IOrderWebApiClient _orderWebApiClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public OrderController(IOrderWebApiClient orderWebApiClient)
        {
            _orderWebApiClient = orderWebApiClient;
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

            var mock_orders = await GetMock();

            DCo.OrderCollection dcOrders = null;
            
            if (!string.IsNullOrEmpty(pagingParams.id) && !mock_orders.Any(o => o.Id == pagingParams.id))
            {
                dcOrders = new DCo.OrderCollection() {Items = new List<DCo.Order>()};
                var order = (await _orderWebApiClient.GetOrder(pagingParams.id)).ReadAsSync();
                if (order != null)
                {
                    dcOrders.Items.Add(order);
                }
            }
            else
            {
                var filter = "Status ne \"Created\"";
                dcOrders = (await _orderWebApiClient.GetOrders(startIndex, pageSize, pagingParams.sort.ToSortString(), filter)).ReadAsSync();
            }

            var real_orders = dcOrders != null ? Mapper.Map<List<Order>>(dcOrders.Items) : new List<Order>();

            var orders = new List<Order>();
            orders.AddRange(mock_orders);
            orders.AddRange(real_orders);

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
                        orders = DoSort(orders, o => o.BillingContact.FirstName, sort.IsAscending);
                        break;
                    case "customer.lastName":
                        orders = DoSort(orders, o => o.BillingContact.LastName, sort.IsAscending);
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

            new DCo.Order {
                Packages = null
            };

            if (pagingParams.id != null)
                return List2(orders.Where(o => o.Id == pagingParams.id).ToList());

            return List2(orders);
        }

        [WebInvoke(Method = "POST", UriTemplate = "cancel")]
        public async Task<Response<List<Order>>> CancelOrder(string orderId)
        {
            var dc = (await _orderWebApiClient.PerformOrderAction(orderId, new DCo.OrderAction { ActionName = "CancelOrder" })).ReadAsSync();

            return List2( Mapper.Map<Order>(dc) );
        }


        /// <summary>
        /// Gets a mock list of Orders.
        /// </summary>
        private Task<List<Order>> GetMock()
        {
            var allTheOrders = new List<Order>();

            var jsContact = new Contact
            {
                Id = 12346,
                FirstName = "John",
                LastName = "Smith",
                CompanyOrOrganization = "Company ABC",
                Address1 = "1308 Horseback Hollow",
                CityOrTown = "Austin",
                StateOrProvince = "TX",
                PostalOrZipCode = "78732",
                CountryCode = "United States",
//                CustomerSince = new DateTime(2011, 03, 18),
//                TotalOrders = 4,
//                TotalSpent = 597.96m,
//                Groups = new List<string> { "VIP", "Coupon User" }
            };

            var order_template = new Order
            {
                Id = "o124",
                OrderNumber = 107363,
                CreateDate = new DateTime(2013, 03, 18),
                IpAddress = "173.194.46.2",
                CustomerId = null,
                BillingContact = jsContact,
                Subtotal = 225m,
                ShippingCost = 9.48m,
                ShippingMethodName = "USPS Standard",
                ShippingDiscount = -5m,
                ShippingDiscountDescription = "Cheap Shipping SUPER SAVER",
                ShippingTotal = 4.48m,
                TaxTotal = 0m,
                FeeTotal = 0m,
                AdjustmentDescription = "Friends and family discount",
                AdjustmentTotal = 10m,
                OrderDiscountDescription = "$5 Off Orders Over $224",
                OrderDiscountTotal = -5m,
                Total = 229.48m,
                CustomerNote = "Please take special care in packaging. Thanks!",
                Items = new List<OrderItem> {
                    new OrderItem {
                        Id = "i123",
                        ProductCode = "HOBO-LL",
                        ProductName = "Slouchy leather... lace hobo",
                        UnitPrice = 90m,
                        Quantity = 2,
                        Subtotal = 180m,
                        Discount = new OrderItemDiscount {
                            Description = "$10 off all leather bags",
                            UnitPrice = -10m,
                            Quantity = 2,
                            Total = -20m
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
                },
                Payments = new List<OrderPayment>()
            };


            var order_authorized_only = order_template.Clone<Order>();
            order_authorized_only.Id = "o1001";
            order_authorized_only.BillingContact.FirstName = "Authorized";
            order_authorized_only.PaymentStatus = "Unpaid";
            order_authorized_only.Payments = new List<OrderPayment> {
                    new OrderPayment {
                        Id = "337", 
                        OrderId = "o1001",
                        Status = "Authorized",
                        AmountCollected = 0m, 
                        PaymentType = "CreditCard", 
                        CardType = "Visa", 
                        CardNumber="xxxx-xxxx-xxxx-1111", 
                        PaymentServiceTransactionId = "00158221",
                        CreateDate = new DateTime(2013, 03, 18, 12, 30, 00)
                    }
            };
            allTheOrders.Add(order_authorized_only);

            var order_paid_in_full = order_template.Clone<Order>();
            order_paid_in_full.Id = "o1002";
            order_paid_in_full.BillingContact.FirstName = "Paid";
            order_paid_in_full.BillingContact.LastName = "In Full";
            order_paid_in_full.PaymentStatus = "Paid";
            order_paid_in_full.Payments = new List<OrderPayment> {
                new OrderPayment {
                    Id = "340",
                    OrderId = "o1002",
                    Status = "Paid",
                    AmountCollected = 229.48m,
                    PaymentType = "CreditCard",
                    CardType = "Visa",
                    CardNumber="xxxx-xxxx-xxxx-1111", 
                    PaymentServiceTransactionId = "00158555",
                    CreateDate = new DateTime(2013, 03, 18, 13, 00, 00)
                }
            };
            allTheOrders.Add(order_paid_in_full);

            var order_partial_payment = order_template.Clone<Order>();
            order_partial_payment.Id = "o1003";
            order_partial_payment.BillingContact.FirstName = "Partial";
            order_partial_payment.BillingContact.LastName = "Payment";
            order_partial_payment.PaymentStatus = "Unpaid";
            order_partial_payment.Payments = new List<OrderPayment> {
                    new OrderPayment {
                        Id = "337", 
                        OrderId = "o1003",
                        Status = "Authorized",
                        AmountCollected = 0m, 
                        PaymentType = "CreditCard", 
                        CardType = "Visa", 
                        CardNumber="xxxx-xxxx-xxxx-1111", 
                        PaymentServiceTransactionId = "00158221",
                        CreateDate = new DateTime(2013, 03, 18, 12, 30, 00)
                    },
                    new OrderPayment {
                            Id = "339",
                            OrderId = "o1003",
                            Status = "Paid",
                            AmountCollected = 129.48m, 
                            PaymentType = "CreditCard", 
                            CardType = "Visa", 
                            CardNumber="xxxx-xxxx-xxxx-1111", 
                            PaymentServiceTransactionId = "00158555",
                            CreateDate = new DateTime(2013, 03, 18, 13, 00, 00)
                    }
            };
            allTheOrders.Add(order_partial_payment);

            var order_with_some_packages = order_template.Clone<Order>();
            order_with_some_packages.Id = "o1004";
            order_with_some_packages.BillingContact.FirstName = "Packages";
            order_with_some_packages.BillingContact.LastName = "ForYou";
            order_with_some_packages.Packages = new List<OrderPackage> { 
                new OrderPackage {
                    Id = "o1004-p1",
                    Status = "NotShipped",
                    Items = new List<OrderPackageItem> {
                        new OrderPackageItem {
                            OrderItemId = "i123",
                            ProductCode = "HOBO-LL",
                            ProductName = "Slouchy leather... lace hobo",
                            Quantity = 1
                        },
                        new OrderPackageItem {
                            OrderItemId = "i124",
                            ProductCode = "789MAE",
                            ProductName = "Mary Mae's... Summer Sandals",
                            Quantity = 1
                        }
                    }
                },
                new OrderPackage {
                    Id = "o1004-p2",
                    Status = "NotShipped",
                    Items = new List<OrderPackageItem> {
                        new OrderPackageItem {
                            OrderItemId = "i124",
                            ProductCode = "HOBO-LL",
                            ProductName = "Slouchy leather... lace hobo",
                            Quantity = 1
                        }
                    }
                }
            };
            order_with_some_packages.UnpackagedItems = new List<OrderPackageItem> {
                new OrderPackageItem {
                    OrderItemId = "i124",
                    ProductCode = "789MAE",
                    ProductName = "Mary Mae's... Summer Sandals",
                    Quantity = 1
                }
            };
            allTheOrders.Add(order_with_some_packages);

            var taskResult = new TaskCompletionSource<List<Order>>();
            taskResult.SetResult(allTheOrders);

            return taskResult.Task;
        }
    }
}
