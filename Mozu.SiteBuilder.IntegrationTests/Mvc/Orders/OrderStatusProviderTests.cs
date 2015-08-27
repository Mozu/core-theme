//using NUnit.Framework;
//using Mozu.SiteBuilder.Mvc.Orders;
//using Mozu.SiteBuilder.UX.Models.Checkout;

//namespace Mozu.SiteBuilder.IntegrationTests.Mvc.Orders
//{
//    [TestFixture]
//    public class OrderStatusProviderTests
//    {
//        [Test]
//        public void Everything_should_be_New_when_created()
//        {
//            var provider = GetProvider();

//            var model = new CheckoutModel{ShippingAddress = new ShipmentInformation(), ShippingMethod = new ShippingMethodInformation(), PaymentSection = new PaymentInformation()};
//            var page = new CheckoutPage(model).WithOrder(new OrderInformation { Shipment = new ShipmentInformation() });

//            provider.SetStatus(page);

//            Assert.AreEqual(model.ShippingAddress.StepStatus, StepStatus.New);
//            Assert.AreEqual(model.ShippingMethod.StepStatus, StepStatus.New);
//            Assert.AreEqual(model.PaymentSection.StepStatus, StepStatus.New);
//        }

//        [Test]
//        public void Everything_should_be_Complete_when_everything_is_filled_out()
//        {
//            var provider = GetProvider();

//            var shipmentInformation = new ShipmentInformation { Address1 = "123 fake st", FirstName = "Darby", LastName = "McGillicutty", CountryCode = "US", StateOrProvince = "TX", PostalOrZipCode = "78759" };
//            var shippingMethodInformation = new ShippingMethodInformation { Id = "CUSTOM-500" };
//            var paymentInformation = new PaymentInformation
//                {
//                    OrderId = "blah",
//                    PaymentType = "CreditCard",
//                    CardType = "VISA",
//                    CardExpireMonth = 10,
//                    CardExpireYear = 2030,
//                    CardNumberPartOrMask = "************4532",
//                    FirstName = "robot",
//                    LastName = "chicken",
//                    Address1 = "123 fake st",
//                    CityOrTown = "algona",
//                    StateOrProvince = "TX",
//                    CountryCode = "US",
//                    PostalOrZipCode = "50105",
//                    CVV = "321",
//                    PaymentServiceCardId = "5bab5your0e34511b5b0d828mom3d28a"
//                };
//            //var paymentInformation = new PaymentInformation { PaymentOrCardType = "Check", };
//            var model = new CheckoutModel
//                {
//                    ShippingAddress = shipmentInformation,
//                    ShippingMethod = shippingMethodInformation,
//                    PaymentSection = paymentInformation,
//                };
//            var page = new CheckoutPage(model).WithOrder(new OrderInformation { Shipment = shipmentInformation });

//            provider.SetStatus(page);

//            Assert.AreEqual(model.ShippingAddress.StepStatus, StepStatus.Complete);
//            Assert.AreEqual(model.ShippingMethod.StepStatus, StepStatus.Complete);
//            Assert.AreEqual(model.PaymentSection.StepStatus, StepStatus.Complete);
//        }

//        private OrderStatusProvider GetProvider()
//        {
//            return new OrderStatusProvider();
//        }
//    }
//}

