using System.Web.Mvc;
using Mozu.CommerceRuntime.Contracts.Clients;
using NSubstitute;
using NUnit.Framework;

using Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers;

namespace Mozu.SiteBuilder.IntegrationTests
{
    [TestFixture]
    public class CartControllerTests
    {
        private ICartWebApiClient _cartWebApiClient;

        [TestFixtureSetUp]
        public void TestFixtureSetUp()
        {
            _cartWebApiClient = Substitute.For<ICartWebApiClient>();
        }

        [Test]
        public void Cart_returned_from_services_should_have_same_Id_as_StoreFront_Cart()
        {
            var controller = GetController();
            var entity = new Mozu.CommerceRuntime.Contracts.Carts.Cart { Id = "1f6b06fb016648b28d9731181e99e78c" };

            _cartWebApiClient.With(x => x.GetOrCreateCart(), entity);

            var result = controller.Index().Result as ViewResult;
            var cart = result.Model as UX.Models.StoreFront.Cart.Cart;

            Assert.That(cart, Is.Not.Null);
            Assert.That(cart.Id, Is.EqualTo(entity.Id));
        }

        private CartController GetController()
        {
            return new CartController(_cartWebApiClient, null, null, null);
        }
    }
}