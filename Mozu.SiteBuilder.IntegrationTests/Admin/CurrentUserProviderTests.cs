using System.Net;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Admin;
using NSubstitute;
using NUnit.Framework;
using Should;

namespace Mozu.SiteBuilder.IntegrationTests.Admin
{
    [TestFixture]
    public class CurrentUserProviderTests
    {
        private IAuthenticationHelper _authenticationHelper;
        private IAdminUserWebApiClient _adminUserWebApiClient;

        [SetUp]
        public void SetUp()
        {
            _authenticationHelper = Substitute.For<IAuthenticationHelper>();
            _adminUserWebApiClient = Substitute.For<IAdminUserWebApiClient>();
        }

        [Test]
        public void GetCurrentUser_should_return_user_if_found_by_token_UserId()
        {
            var expectedId = "youzer eye dee";
            _authenticationHelper.GetCurrentProfileToken().Returns(new ProfileToken { UserId = expectedId });
            _adminUserWebApiClient.With(x => x.GetUser(expectedId, null), new Mozu.Core.Api.Contracts.User { Id = expectedId });

            var provider = GetProvider();

            var user = provider.GetCurrentUser();

            user.ShouldNotBeNull();
            user.Id.ShouldEqual(expectedId);
        }

        [Test]
        public void GetCurrentUser_should_return_new_Unauthenticated_User_if_NotFound()
        {
            _authenticationHelper.GetCurrentProfileToken().Returns(new ProfileToken());
            _adminUserWebApiClient.WithAny(x => x.GetUser(null, null), null, msg => msg.StatusCode = HttpStatusCode.NotFound);

            var provider = GetProvider();

            var user = provider.GetCurrentUser();

            user.ShouldNotBeNull();
            user.IsAuthenticated.ShouldBeFalse();
        }

        private CurrentUserHelper GetProvider()
        {
            return new CurrentUserHelper(_authenticationHelper, _adminUserWebApiClient);
        }
    }
}
