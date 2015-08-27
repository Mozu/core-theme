using System;
using System.Net;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Account;
using NSubstitute;
using NUnit.Framework;
using Should;

namespace Mozu.SiteBuilder.IntegrationTests
{
    [TestFixture]
    public class UserHelperTests
    {
        [SetUp]
        public void SetUp()
        {
            IMultiScopeAdminUserWebApiClient client = Substitute.For<IMultiScopeAdminUserWebApiClient, ICloneable>();
            _userWebApiClient = client;
            ((ICloneable) client).Clone().Returns(_userWebApiClient);
        }

        private IMultiScopeAdminUserWebApiClient _userWebApiClient;

        //[Test]
        //public void GetUser_by_id_should_return_mapped_user()
        //{
        //    var id = Guid.NewGuid().ToString("n");
        //    _userWebApiClient.With(x => x.GetUser(id, null), new Mozu.Core.Api.Contracts.User { Id = id });

        //    var api = GetHelper();

        //    var user = api.GetUser(id);
        //    user.Id.ShouldEqual(id);
        //}

        private UserHelper GetHelper()
        {
            return new UserHelper(_userWebApiClient);
        }

        [Test]
        public void GetUser_should_return_null_if_response_is_not_successful()
        {
            _userWebApiClient.WithAny(x => x.GetUser(null, null), null, msg => msg.StatusCode = HttpStatusCode.NotFound);

            UserHelper api = GetHelper();

            User user = api.GetUser("whatever");

            user.ShouldBeNull();
        }
    }
}