using System;
using NUnit.Framework;
using NSubstitute;
using Mozu.Core.Settings;
using Mozu.Core.Test;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UnitTests.Utils;
using System.Net;
using System.Collections.Generic;
using Mozu.Core;
using Microsoft.AspNetCore.Mvc;
using Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers;
using Mozu.Location.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.SiteBuilder.UnitTests.Extensions;
using Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.SiteBuilder.Mvc.Contexts;

namespace Mozu.SiteBuilder.UnitTests.StoreFront.Controllers
{
    [TestFixture]
    [Category("StaticContent")]
    class CheckoutControllerTests : UnitTestsFor<CheckoutController>
    {
        string staticContentPath;
        string devcenterpath;
        string file;

        [OneTimeSetUp]
        public void FixtureSetup()
        {
            devcenterpath = System.IO.Path.GetTempPath();
            staticContentPath = devcenterpath + "/t-12345/";
        }

        [OneTimeTearDown]
        public void Kill()
        {
        }


        [Test, TestCaseSource("GetConfirmationCases")]
        public async Task ConfirmationTestRunner(string orderStatus, HttpStatusCode expected, int tenandId)
        {
            // Arrange
            var settings = MockContainer.ResolveAndSubstituteFor<ISettings>();
            var apiContext = MockContainer.ResolveAndSubstituteFor<IApiContext>();
            settings.AppSettings("SiteBuilderStaticContent").Returns(devcenterpath);
            apiContext.TenantId.Returns(tenandId);

            var location = new Location.Contracts.Location
            {
                Code = "loc1"
            };
            var locClient = MockContainer.ResolveAndSubstituteFor<ILocationRuntimeWebApiClient>();
            locClient.GetDirectShipLocation().Returns(ServiceClientResponseExtensions.AsServiceClientResponseAsync(location));
            var order = new Order
            {
                Status = orderStatus,
                Items = new List<OrderItem>
                {
                    new OrderItem
                    {
                        FulfillmentMethod = "Ship",
                        FulfillmentLocationCode = "loc1"
                    }
                }
            };
            var orderClient = MockContainer.ResolveAndSubstituteFor<IOrderWebApiClient>();
            orderClient.GetOrder(Arg.Any<string>()).Returns(ServiceClientResponseExtensions.AsServiceClientResponseAsync(order));

            //Act
            InitObjectUnderTest();
            ObjectUnderTest.ControllerContext = new ControllerContext
            {
                HttpContext = HttpContextHelpers.CreateFromContainer(MockContainer.Container)

            };
            ObjectUnderTest.PageContext = PageContext.CreateForTesting(null, null, null);

            //Assert  
            var response = await ObjectUnderTest.Confirmation("123");
            if (expected == HttpStatusCode.OK)
            {
                Assert.True(response is Mozu.SiteBuilder.Mvc.ActionResults.ViewResult);
                Assert.True((response as Mozu.SiteBuilder.Mvc.ActionResults.ViewResult).ViewName.Equals("confirmation"));
            }
            else
            {
                Assert.True(response is RedirectResult);
                Assert.False((response as RedirectResult).Url.Contains("confirmation"));
            }
        }

        private static IEnumerable<object[]> GetConfirmationCases()
        {
            yield return new object[] { "PendingShipment", HttpStatusCode.OK, 12345 };
            yield return new object[] { "Errored", HttpStatusCode.OK, 12345 };
            yield return new object[] { "Pending", HttpStatusCode.Redirect, 12345 };
            yield return new object[] { "Foo", HttpStatusCode.Redirect, 12345 };
        }


    }
}