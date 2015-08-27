using Mozu.AdminUser.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Security;
using NSubstitute;
using NUnit.Framework;

namespace Mozu.SiteBuilder.IntegrationTests.Admin
{
    [TestFixture]
    public class CurrentUserProviderTests
    {
        [SetUp]
        public void SetUp()
        {
            _authenticationHelper = Substitute.For<IAuthenticationHelper>();
            _adminUserWebApiClient = Substitute.For<IMultiScopeAdminUserWebApiClient>();
        }

        private IAuthenticationHelper _authenticationHelper;
        private IMultiScopeAdminUserWebApiClient _adminUserWebApiClient;

        //[Test]
        //public void GetCurrentUser_should_return_user_if_found_by_token_UserId()
        //{
        //    var expectedId = "youzer eye dee";
        //    _authenticationHelper.GetCurrentProfileToken().Returns(new Mozu.Core.Api.Contracts.UserProfile { UserId = expectedId });
        //    _adminUserWebApiClient.With(x => x.GetUser(expectedId, null), new Mozu.Core.Api.Contracts.User { Id = expectedId });

        //    var provider = GetProvider();

        //    var user = provider.GetCurrentUser();

        //    user.ShouldNotBeNull();
        //    user.Id.ShouldEqual(expectedId);
        //}

        //[Test]
        //public void GetCurrentUser_should_return_new_Unauthenticated_User_if_NotFound()
        //{
        //    _authenticationHelper.GetCurrentProfileToken().Returns(new Mozu.Core.Api.Contracts.UserProfile());
        //    _adminUserWebApiClient.WithAny(x => x.GetUser(null, null), null, msg => msg.StatusCode = HttpStatusCode.NotFound);

        //    var provider = GetProvider();

        //    var user = provider.GetCurrentUser();

        //    user.ShouldNotBeNull();
        //    user.IsAuthenticated.ShouldBeFalse();
        //}

        //private CurrentUserHelper GetProvider()
        //{
        //    return new CurrentUserHelper(_authenticationHelper, _adminUserWebApiClient);
        //}
    }
}