using System;
using System.Net;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api;
using NSubstitute;
using NUnit.Framework;
using Should;

namespace Mozu.SiteBuilder.IntegrationTests
{
    [TestFixture]
    public class UserHelperTests
    {
        private IMultiScopeAdminUserWebApiClient _userWebApiClient;

        [SetUp]
        public void SetUp()
        {
            _userWebApiClient = Substitute.For<IMultiScopeAdminUserWebApiClient>();
        }

        [Test]
        public void GetUser_by_id_should_return_mapped_user()
        {
            var id = Guid.NewGuid().ToString("n");
            _userWebApiClient.With(x => x.GetUser(id, null), new Mozu.Core.Api.Contracts.User { Id = id });

            var api = GetHelper();

            var user = api.GetUser(id);
            user.Id.ShouldEqual(id);
        }

        [Test]
        public void GetUser_should_return_null_if_response_is_not_successful()
        {
            _userWebApiClient.WithAny(x => x.GetUser(null, null), null, msg => msg.StatusCode = HttpStatusCode.NotFound);

            var api = GetHelper();

            var user = api.GetUser("whatever");

            user.ShouldBeNull();
        }

        private UserHelper GetHelper()
        {
            return new UserHelper(_userWebApiClient);
        }
    }
}
