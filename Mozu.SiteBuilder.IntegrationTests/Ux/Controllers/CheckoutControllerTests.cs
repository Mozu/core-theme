//using System;
//using System.Diagnostics;
//using System.Linq;
//using System.Runtime.Serialization;
//using System.Web.Mvc;
//using Mozu.CommerceRuntime.Contracts.Clients;
//using NSubstitute;
//using NUnit.Framework;
//using Should;
//using Mozu.SiteBuilder.Mvc;
//using Mozu.SiteBuilder.Mvc.Orders;
//using Mozu.SiteBuilder.Mvc.Security;
//using Mozu.SiteBuilder.UX.Admin.Api.ModelMapping;
//using Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers;
//using Mozu.SiteBuilder.UX.Configuration;
//using Mozu.SiteBuilder.UX.Models.Checkout;

//namespace Mozu.SiteBuilder.IntegrationTests.Ux.Controllers
//{
//    [TestFixture]
//    public class CheckoutControllerTests
//    {
//        private IOrderService orderService;
//        private IOrderWebApiClient orderWebApiClient;
//        private OrderInformation order;

//        [TestFixtureSetUp]
//        public void TestFixtureSetUp()
//        {
//            var profile = new OrderMapping();
//            AutoMapper.Mapper.AddProfile(profile);
//        }

//        [SetUp]
//        public void SetUp()
//        {
//            order = new OrderInformation();
//            orderService = Substitute.For<IOrderService>();
//           // orderService.GetOrder(Arg.Any<string>()).Returns(order);
//            orderWebApiClient = Substitute.For<IOrderWebApiClient>();
//        }

//        //[Test, Ignore("Lots of underlying features changed since this test was first written. It probably needs to be removed and other parts tested. I'm not even sure it's a useful test any longer.")]
//        //public void UpdateShippingInformation_should_update_only_expected_fields()
//        //{
//        //    var controller = GetController();

//        //    var info = new ShipmentInformation
//        //    {
//        //        Address1 = "123 fake st",
//        //        Address2 = "apt 5000",
//        //        CityOrTown = "Anytown",
//        //        CountryCode = "USA",
//        //        FirstName = "firsty",
//        //        LastName = "lasty",
//        //        PostalOrZipCode = "12345",
//        //        StateOrProvince = "XX",
//        //    };

//        //    var result = controller.UpdateShippingAddress(info) as JsonResult;
//        //    var model = result.Data as Mozu.Order.Contracts.Order;

//        //    model.Shipment.ShippingAddress.FirstName.ShouldEqual(info.FirstName);
//        //    model.Shipment.ShippingAddress.LastNameOrSurname.ShouldEqual(info.LastName);
//        //    model.Shipment.ShippingAddress.Address.Address1.ShouldEqual(info.Address1);
//        //    model.Shipment.ShippingAddress.Address.Address2.ShouldEqual(info.Address2);
//        //    model.Shipment.ShippingAddress.Address.CityOrTown.ShouldEqual(info.CityOrTown);
//        //    model.Shipment.ShippingAddress.Address.StateOrProvince.ShouldEqual(info.StateOrProvince);
//        //    model.Shipment.ShippingAddress.Address.CountryCode.ShouldEqual(info.CountryCode);
//        //    model.Shipment.ShippingAddress.Address.PostalOrZipCode.ShouldEqual(info.PostalOrZipCode);
//        //}

//        [Test]
//        public void Create_checkout_viewModel_information_for_knockout()
//        {
//            var baseType = typeof (CheckoutInformation);
//            var types = from t in baseType.Assembly.GetTypes()
//                        where baseType.IsAssignableFrom(t) && !t.IsAbstract
//                        select t;

//            foreach (var type in types)
//            {
//                var props = from p in type.GetProperties()
//                            let data = p.GetCustomAttributes(typeof(DataMemberAttribute), true)
//                            where data.Any()
//                            let attrs = data.Cast<DataMemberAttribute>().First()
//                            select attrs.Name;

//                Debug.WriteLine("var {0} = {{{2}\t{1}{2}}};", type.Name, string.Join(", ", props), Environment.NewLine);
//            }
//        }

//        private CheckoutController GetController()
//        {
//            return new CheckoutController(orderService, new AuthenticationHelper(null), new CookieProvider(null,null), new PciSettingsProvider(), orderWebApiClient);
//        }
//    }
//}

