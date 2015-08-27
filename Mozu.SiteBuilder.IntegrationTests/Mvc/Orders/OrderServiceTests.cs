//using System;
//using System.Collections.Generic;
//using System.Linq;
//using Mozu.Core.Settings;
//using NSubstitute;
//using NUnit.Framework;
//using Should;
//using Mozu.Cart.Contracts.Clients;
//using Mozu.Core;
//using Mozu.Order.Contracts;
//using Mozu.Order.Contracts.Clients;
//using Mozu.SiteBuilder.Mvc.Customers;
//using Mozu.SiteBuilder.Mvc.Security;
//using Mozu.SiteBuilder.UX.Models.Checkout;
//using Mozu.SiteSettings.Order.Contracts;
//using Mozu.SiteSettings.Order.Contracts.Clients;
//using Mozu.SiteSettings.Shipping.Contracts;
//using Mozu.SiteSettings.Shipping.Contracts.Clients;
//using Mozu.User.Contracts;
//using Mozu.User.Contracts.Clients;

//namespace Mozu.SiteBuilder.IntegrationTests.Mvc.Orders
//{
//    [TestFixture]
//    public class OrderServiceTests
//    {
//        private IOrderWebApiClient _orderWebApiClient;
//        private IUserWebApiClient _userWebApiClient;
//        private IShippingSettingsWebApiClient _shippingSettingsWebApiClient;
//        private ICartWebApiClient _cartWebApiClient;
//        private ICheckoutSettingsWebApiClient _checkoutSettingsWebApiClient;
//        private IApiContext _apiContext;
//        private IAuthTicketWebApiClient _authTicketWebApiClient;
//        private IAuthenticationHelper _authenticationHelper;
//        private ICustomerRepository _customerRepository;
//        private ISettings _settings;
//        private string _orderId;
//        private List<SiteShippingRegion> _siteShippingRegions;

//        [SetUp]
//        public void SetUp()
//        {
//            _orderWebApiClient = Substitute.For<IOrderWebApiClient>();
//            _userWebApiClient = Substitute.For<IUserWebApiClient>();
//            _shippingSettingsWebApiClient = Substitute.For<IShippingSettingsWebApiClient>();
//            _cartWebApiClient = Substitute.For<ICartWebApiClient>();
//            _checkoutSettingsWebApiClient = Substitute.For<ICheckoutSettingsWebApiClient>();
//            _apiContext = Substitute.For<IApiContext>();
//            _authTicketWebApiClient = Substitute.For<IAuthTicketWebApiClient>();
//            _authenticationHelper = Substitute.For<IAuthenticationHelper>();
//            _customerRepository = Substitute.For<ICustomerRepository>();

//            _orderId = Guid.NewGuid().ToString("n");
//            _settings = Substitute.For<ISettings>();
//            _siteShippingRegions = new List<SiteShippingRegion>
//                {
//                    new SiteShippingRegion { ISOCountryCode = "USA" },
//                    new SiteShippingRegion { ISOCountryCode = "CAN" },
//                };
//        }

//        [Test]
//        public void CreateAccount_should_not_lookup_user_or_CreateUser_if_submitInformation_CreateAccount_is_false()
//        {
//            var submitInformation = new SubmitInformation { CreateAccount = false };
//            var service = GetOrderService();

//            service.CreateAccount(submitInformation, _orderId);

//            _userWebApiClient.DidNotReceive().GetUserByEmail(Arg.Any<string>());
//            _userWebApiClient.DidNotReceive().CreateUser(Arg.Any<Mozu.Core.Api.Contracts.User>());
//        }

//        [Test, Ignore("The CreateAccount method sets _orderWebApiClient with a new value, making this hard to test.")]
//        public void CreateAccount_should_throw_if_account_already_exists()
//        {
//            var submitInformation = new SubmitInformation { CreateAccount = true };
//            var service = GetOrderService();

//            service.CreateAccount(submitInformation, _orderId);
//        }

//        [TestCase(new [] { "capture", "seize", "die" }, 1, true)]
//        [TestCase(new [] { "wat?", "lol!" }, 0, false)]
//        [TestCase(new [] { "capture", "seize", "die" }, 0, false)]
//        [TestCase(new [] { "wat?", "lol!" }, 0, true)]
//        public void PerformPaymentActions_should_perform_capture_if_available_and_settings_specify(string[] actions, int timesCalled, bool settingsSpecifiyCapture)
//        {
//            var actionName = "capture";
//            var service = GetOrderService();
//            var settings = new OrderProcessingSettings
//            {
//                PaymentProcessingFlowType = settingsSpecifiyCapture ? OrderProcessingSettings.PaymentProcessingFlowTypes.AuthorizeAndCaptureOnOrderPlacement : null
//            };

//            _orderWebApiClient.With(x => x.GetAvailablePaymentActions(_orderId), actions.ToList());
//            _checkoutSettingsWebApiClient.With(x => x.GetOrderProcessingSettings(), settings);

//            _orderWebApiClient.With(x => x.PerformPaymentAction(_orderId, actionName, null), new Mozu.Order.Contracts.Order());

//            service.PerformPaymentActions(_orderId);

//            _orderWebApiClient.Received(timesCalled).PerformPaymentAction(_orderId, actionName, null);
//        }

//        [Test]
//        public void Submit_should_DeleteCart_if_order_is_given_an_OrderNumber()
//        {
//            var actionName = "submit";
//            var cartId = Guid.NewGuid().ToString("n");
//            var service = GetOrderService();
//            var orderInformation = new OrderInformation();

//            _orderWebApiClient.With(x => x.GetAvailablePaymentActions(_orderId), new List<string> { actionName });
//            _orderWebApiClient.With(x => x.GetAvailableActions(_orderId), new List<string> { actionName });
//            _orderWebApiClient.With(x => x.PerformOrderAction(_orderId, actionName), new Mozu.Order.Contracts.Order { OriginalCartId = cartId, OrderNumber = 1 });
//            _cartWebApiClient.With(x => x.DeleteCart(cartId), TestResponse.Void);

//            service.Submit(_orderId, orderInformation);

//            _cartWebApiClient.Received(1).DeleteCart(cartId);
//        }

//        [Test]
//        public void UpdateShippingMethod_should_send_Shipment_to_service_with_Id_from_selected_method()
//        {
//            var code = "SM101";
//            var service = GetOrderService();
//            var shippingMethodInformation = new ShippingMethodInformation { Id = code };

//            _orderWebApiClient.With(x => x.UpdateShipment(Arg.Any<Shipment>(), _orderId), new Shipment());
//            _orderWebApiClient.With(x => x.GetShipment(_orderId), new Shipment());

//            service.UpdateShippingMethod(shippingMethodInformation, _orderId);

//            _orderWebApiClient.Received(1).UpdateShipment(Arg.Is<Shipment>(x => x.ShippingMethodCode == code), _orderId);
//        }

//        [Test]
//        public void GetShippableCountries_should_return_KeyValuePairs_of_CountryCode_and_CountryCode()
//        {
//            var service = GetOrderService();

//            _shippingSettingsWebApiClient.With(x => x.GetShippingRegions(), _siteShippingRegions);

//            var pairs = service.GetShippableCountries();

//            pairs.Select(x => x.Key).ShouldEqual(new [] { "USA", "CAN" });
//            pairs.Select(x => x.Value).ShouldEqual(new [] { "USA", "CAN" }); // TODO: There should be friendly names, this is just the rule right now...
//        }

//        [TestCase(0, "abc", "")]
//        [TestCase(0, "abc", "    ")]
//        [TestCase(0, "abc", null)]
//        [TestCase(1, "abc", "COUP")]
//        [TestCase(0, "", "")]
//        [TestCase(0, "", "    ")]
//        [TestCase(0, "", null)]
//        [TestCase(0, "", "COUP")]
//        public void RemoveCoupon_should_not_call_service_if_code_or_orderId_is_missing(int timesCalled, string orderId, string couponCode)
//        {
//            var service = GetOrderService();
//            _orderWebApiClient.With(x => x.RemoveCoupon(orderId), new Mozu.Order.Contracts.Order());

//            service.RemoveCoupon(couponCode, orderId);

//            _orderWebApiClient.Received(timesCalled).RemoveCoupon(orderId);
//        }

//        [TestCase(1, "orderid", "CODE")]
//        [TestCase(0, "       ", "CODE")]
//        [TestCase(0, "orderid", "    ")]
//        public void UpdateCoupon_should_ApplyCoupon_if_orderId_and_CouponCode_exist(int timesCalled, string orderId, string couponCode)
//        {
//            var service = GetOrderService();
//            _orderWebApiClient.With(x => x.ApplyCoupon(orderId, couponCode), new Mozu.Order.Contracts.Order());

//            service.UpdateCoupon(orderId, new OrderInformation { CouponCode = couponCode });

//            _orderWebApiClient.Received(timesCalled).ApplyCoupon(orderId, couponCode);
//        }

//        [TestCase(1, "pp")]
//        [TestCase(0, null)]
//        public void UpdateCoupon_should_RemoveCoupon_if_orderId_exists_and_Order_RemoveCoupon_is_true(int timesCalled, string orderId)
//        {
//            var service = GetOrderService();
//            _orderWebApiClient.With(x => x.RemoveCoupon(orderId), new Mozu.Order.Contracts.Order());

//            service.UpdateCoupon(orderId, new OrderInformation { RemoveCoupon = true });

//            _orderWebApiClient.Received(timesCalled).RemoveCoupon(orderId);
//        }

//        [TestCase("   ", "   ")]
//        [TestCase("   ", "abc")]
//        [TestCase("abc", "   ")]
//        public void UpdateComment_should_do_nothing_if_text_or_orderId_is_missing(string text, string orderId)
//        {
//            var service = GetOrderService();

//            service.UpdateComment(text, orderId);

//            _orderWebApiClient.Received(0).CreateOrderNote(Arg.Any<OrderNote>(), Arg.Any<string>());
//            _orderWebApiClient.Received(0).UpdateOrderNote(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<OrderNote>());
//        }

//        [Test]
//        public void UpdateComment_should_CreateOrderNote_if_no_Notes_exist_on_order()
//        {
//            var service = GetOrderService();
//            var notes = new List<OrderNote> { new OrderNote { Text = "I'm a note!" } };

//            _orderWebApiClient.With(x => x.GetOrderNotes(_orderId), notes);
//            _orderWebApiClient.With(x => x.CreateOrderNote(notes.First(), _orderId), new OrderNote());

//            service.UpdateComment("note to self", _orderId);

//            _orderWebApiClient.Received(1).CreateOrderNote(notes.First(), _orderId);
//        }

//        [Test]
//        public void UpdateComment_should_UpdateOrderNote_if_a_Note_already_exists_on_order()
//        {
//            var service = GetOrderService();
//            var id = Guid.NewGuid().ToString("n");
//            var notes = new List<OrderNote> { new OrderNote { Id = id, Text = "I'm a note!" } };

//            _orderWebApiClient.With(x => x.GetOrderNotes(_orderId), notes);
//            _orderWebApiClient.With(x => x.UpdateOrderNote(_orderId, id, notes.First()), new OrderNote());

//            service.UpdateComment("notes are neat", _orderId);

//            _orderWebApiClient.Received(1).UpdateOrderNote(_orderId, id, notes.First());
//        }

//        [Test]
//        public void GetAvailableShippingMethods_should_return_empty_if_order_doesnt_satisfy_conditions()
//        {
//            var service = GetOrderService();

//            var methods = service.GetAvailableShippingMethods(new OrderInformation());

//            methods.Items.ShouldBeEmpty();
//        }

//        [Test]
//        public void GetAvailableShippingMethods_should_return_results_from_service_if_order_satisfies_conditions()
//        {
//            var service = GetOrderService();
//            var id = Guid.NewGuid().ToString("n");
//            var orderInformation = new OrderInformation
//            {
//                Id = id,
//                Shipment = new ShipmentInformation
//                {
//                    FirstName = "Monte",
//                    LastName = "Dickerson",
//                    Address1 = "123 fake st",
//                    StateOrProvince = "TX",
//                    CountryCode = "USA",
//                    PostalOrZipCode = "78704"
//                }
//            };
//            var rates = new List<ShippingRate>
//            {
//                new ShippingRate { ShippingMethodCode = "A", Cost = 12m, Price = 14m, IsValid = true },
//                new ShippingRate { ShippingMethodCode = "B", Cost = 29m, Price = 50m, IsValid = true },
//                new ShippingRate { ShippingMethodCode = "C", Cost = 3m, Price = 7m, IsValid = false },
//            };

//            _orderWebApiClient.With(x => x.GetAvailableShippingMethods(orderInformation.Id), rates);

//            var methods = service.GetAvailableShippingMethods(orderInformation);

//            methods.Items.ShouldNotBeEmpty();
//            methods.Items.All(x => x.OrderId == id).ShouldBeTrue();
//            methods.Items.Select(x => x.Id).ShouldNotContain(rates.Last().ShippingMethodCode); // This one is invalid
//        }

//        [TestCase("")]
//        [TestCase("   ")]
//        [TestCase(null)]
//        public void GetOrder_should_return_null_if_orderId_is_missing(string orderId)
//        {
//            var service = GetOrderService();

//            var order = service.GetOrder(orderId);

//            order.ShouldBeNull();
//        }

//        [Test]
//        public void GetOrder_should_return_null_if_services_throws_exception()
//        {
//            var orderId = Guid.NewGuid().ToString("n");
//            var service = GetOrderService();

//            _orderWebApiClient.WithException(x => x.GetOrder(orderId), new Exception("mongo is dead"));

//            var order = service.GetOrder(orderId);

//            order.ShouldBeNull();
//        }

//        [Test]
//        public void GetOrder_should_return_mapped_Order_from_services()
//        {
//            var id = Guid.NewGuid().ToString("n");
//            var service = GetOrderService();

//            _orderWebApiClient.With(x => x.GetOrder(id), new Mozu.Order.Contracts.Order { Id = id });

//            var order = service.GetOrder(id);

//            order.Id.ShouldEqual(id);
//        }

//        public SiteBuilder.Mvc.Orders.OrderService GetOrderService()
//        {
//            return new SiteBuilder.Mvc.Orders.OrderService(_orderWebApiClient, _userWebApiClient,
//                                                           _shippingSettingsWebApiClient, _cartWebApiClient,
//                                                           _checkoutSettingsWebApiClient, _apiContext,
//                                                           _authTicketWebApiClient, _authenticationHelper,
//                                                           _customerRepository, _settings);
//        }
//    }
//}

