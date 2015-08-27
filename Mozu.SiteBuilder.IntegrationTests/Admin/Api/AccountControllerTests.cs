//using System;
//using System.Linq;
//using System.Net;
//using Mozu.AdminUser.Contracts.Clients;
//using Mozu.Core;
//using Mozu.Core.Api.Contracts;
//using Mozu.Core.Settings;
//using Mozu.Provisioning.Contracts.Clients;
//using Mozu.SiteBuilder.UX.Admin;
//using Mozu.SiteBuilder.UX.Admin.Api;
//using Mozu.SiteBuilder.UX.Admin.Helpers;
//using Mozu.Tenant.Contracts.Clients;
//using NSubstitute;
//using NUnit.Framework;
//using Mozu.SiteBuilder.Mvc;
//using Mozu.SiteBuilder.Mvc.Security;
//using Should;
//using Role = Mozu.Core.Api.Contracts.Role;
//using IAuthTicketWebApiClient = Mozu.AdminUser.Contracts.Clients.IAuthTicketWebApiClient;
//using IInvitationWebApiClient = Mozu.AdminUser.Contracts.Clients.IInvitationWebApiClient;
//using IMultiScopeRoleWebApiClient = Mozu.AdminUser.Contracts.Clients.IMultiScopeRoleWebApiClient;

//namespace Mozu.SiteBuilder.IntegrationTests.Admin.Api
//{
//    [TestFixture]
//    public class AccountControllerTests
//    {
//        private IMultiScopeAdminUserWebApiClient _userWebApiClient;
//        private IMultiScopeRoleWebApiClient _roleWebApiClient;
//        private IAuthTicketWebApiClient _authTicketWebApiClient;
//        private ITenantsWebApiClient _tenantsWebApiClient;
//        private IAuthenticationHelper _authenticationHelper;
//        private IUniversalSiteApiClient _sitesWebApiClient;
//        private IInvitationWebApiClient _invitationWebApiClient;
//        //private IMerchantSignUpWebApiClient _merchantSignUpWebApiClient;
//        private IMultiScopeAdminUserWebApiClient _adminUserWebApiClient;
//        private ISiteBuilderContext _siteBuilderContext;
//        private ISettings _settings;
//        private IContextSwitcher _contextSwitcher;
//        private IUserHelper _userHelper;

//        [SetUp]
//        public void SetUp()
//        {
//            // HOLY DEPENDENCIES!?!?!
//            _userWebApiClient = Substitute.For<IMultiScopeAdminUserWebApiClient>();
//            _roleWebApiClient = Substitute.For<IMultiScopeRoleWebApiClient>();
//            _authTicketWebApiClient = Substitute.For<IAuthTicketWebApiClient>();
//            _tenantsWebApiClient = Substitute.For<ITenantsWebApiClient>();
//            _authenticationHelper = Substitute.For<IAuthenticationHelper>();
//            _sitesWebApiClient = Substitute.For<IUniversalSiteApiClient>();
//            _invitationWebApiClient = Substitute.For<IInvitationWebApiClient>();
//            //_merchantSignUpWebApiClient = Substitute.For<IMerchantServiceWebApiClient>();
//            _adminUserWebApiClient = Substitute.For<IMultiScopeAdminUserWebApiClient>();
//            _siteBuilderContext = Substitute.For<ISiteBuilderContext>();
//            _settings = Substitute.For<ISettings>();
//            _contextSwitcher = Substitute.For<IContextSwitcher>();
//            _userHelper = Substitute.For<IUserHelper>();
//        }

//        [Test, Ignore("Has dependency on 'SiteBuilderContext.Current'. Can this be replaced with injected instance?")]
//        public void GetAccount_should_return_mapped_user()
//        {
//            var id = Guid.NewGuid().ToString("n");
//            var api = GetApi();

//            var account = api.GetAccount().Result;

//            account.Items.First().Id.ShouldEqual(id);
//        }

//        [Test]
//        public void GetRoles_should_returned_mapped_roles_from_Roles_service()
//        {
//            var serviceRoles = new[] { new Role { Id = 123 }, new Role { Id = 234 } };
//            _roleWebApiClient.With(x => x.GetRoles(), new RoleCollection { Items = serviceRoles.ToList() });

//            var api = GetApi();
//            var roles = api.GetRoles().Result;

//            roles.Items.First().Id.ShouldEqual(serviceRoles.First().Id);
//            roles.Items.Last().Id.ShouldEqual(serviceRoles.Last().Id);
//        }

//        [Test]
//        public void GetRoles_should_only_call_service_once_per_AccountApi_instance()
//        {
//            var serviceRoles = new[] { new Role { Id = 345 }, new Role { Id = 456 } };
//            _roleWebApiClient.With(x => x.GetRoles(), new RoleCollection { Items = serviceRoles.ToList() });

//            var api = GetApi();

//            api.GetRoles();
//            api.GetRoles();
//            api.GetRoles();

//            _roleWebApiClient.Received(1).GetRoles();
//        }

//        [Test]
//        public void Logoff_should_delegate_to_AuthenticationHelper()
//        {
//            var api = GetApi();
//            api.Logoff();

//            _authenticationHelper.Received(1).LogOut();
//        }

//        [Test]
//        public void DeleteInvitation_should_delegate_to_InvitationWebApiClient()
//        {
//            var invitation = new UX.Admin.Api.Models.Account.Invitation { Id = "dsaklfjadsfkjf" };
//            var api = GetApi();

//            _invitationWebApiClient.With(x => x.DeclineInvitation(invitation.Id), TestResponse.Void);

//            api.DeleteInvitation(invitation);

//            _invitationWebApiClient.Received(1).DeclineInvitation(invitation.Id);
//        }

//        [Test]
//        public void ResendInvitation_should_delegate_to_InvitationWebApiClient()
//        {
//            var invitation = new UX.Admin.Api.Models.Account.Invitation { Id = "dsaklfjadsfkjf" };
//            var api = GetApi();

//            _invitationWebApiClient.With(x => x.ResubmitInvitation(invitation.Id), TestResponse.Void);

//            api.ResendInvitation(invitation);

//            _invitationWebApiClient.Received(1).ResubmitInvitation(invitation.Id);
//        }

//        private AccountController GetApi()
//        {
//            return new AccountController(_userWebApiClient, _roleWebApiClient, _authTicketWebApiClient, _tenantsWebApiClient, _authenticationHelper,
//                _sitesWebApiClient, _invitationWebApiClient, _adminUserWebApiClient, _siteBuilderContext,
//                _settings, _contextSwitcher, _userHelper);
//        }
//    }
//}

