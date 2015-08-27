//using System.Collections.Generic;
//using System.Linq;
//using System.Web.Mvc;
//using Mozu.Provisioning.Contracts.Clients;
//using Mozu.SiteBuilder.Mvc;
//using Mozu.SiteBuilder.Mvc.Security;
//using Mozu.SiteBuilder.UX.Admin;
//using Mozu.SiteBuilder.UX.Admin.Api;
//using Mozu.SiteBuilder.UX.Admin.Api.Models;
//using Mozu.SiteBuilder.UX.Admin.Api.Models.Account;
//using Mozu.SiteBuilder.UX.Admin.Controllers;
//using Mozu.SiteBuilder.UX.Admin.Helpers;
//using Mozu.SiteBuilder.UX.Models.Admin;
//using NSubstitute;
//using NUnit.Framework;
//using Should;

//namespace Mozu.SiteBuilder.IntegrationTests.Admin.Controllers
//{
//    [TestFixture]
//    public class AuthControllerTests
//    {
//        private const string launchPadViewName = "Roles";
//        private const string adminRedirectUrl = "/admin";

//        private IVolusionLoginHelper _accountApi;
//        private IAuthenticationHelper _authHelper;
//        private ISiteBuilderContext _sbc;
//        private ICurrentUserHelper _currentUserHelper;
//        private IContextSwitcher _contextSwitcher;
//        private IUserHelper _userHelper;
//        private IPasswordHelper _passwordHelper;
//        private IMerchantSignUpWebApiClient _merchantSignUpWebApiClient;
//        private IRolesHelper _rolesHelper;

//        [SetUp]
//        public void SetUp()
//        {
//            _accountApi = Substitute.For<IVolusionLoginHelper>();
//            _authHelper = Substitute.For<IAuthenticationHelper>();
//            _sbc = Substitute.For<ISiteBuilderContext>();
//            _currentUserHelper = Substitute.For<ICurrentUserHelper>();
//            _contextSwitcher = Substitute.For<IContextSwitcher>();
//            _userHelper = Substitute.For<IUserHelper>();
//            _passwordHelper = Substitute.For<IPasswordHelper>();
//            _merchantSignUpWebApiClient = Substitute.For<IMerchantSignUpWebApiClient>();
//            _rolesHelper = Substitute.For<IRolesHelper>();
//        }

//        [TestFixture]
//        public class On_unsuccessful_Login : AuthControllerTests
//        {
//            private readonly LoginUser validLogin = new LoginUser { EmailAddress = "blah@volusion.com", Password = "Password1" };
//            private readonly LoginUser emptyLogin = new LoginUser();
//            private readonly LoginUser loginWithoutEmail = new LoginUser { Password = "Blah!1" };
//            private readonly LoginUser loginWithoutPassword = new LoginUser { EmailAddress = "user@volusion.com" };

//            [Test]
//            public void When_everything_is_missing_errors_should_be_present()
//            {
//                var controller = GetController();

//                var result = controller.Login(emptyLogin).Result as ViewResult;

//                result.ViewName.ShouldEqual("Index");
//                result.ViewData.ModelState["EmailAddress"].Errors.ShouldNotBeEmpty();
//                result.ViewData.ModelState["Password"].Errors.ShouldNotBeEmpty();
//            }

//            [Test]
//            public void When_email_is_missing_errors_should_be_present()
//            {
//                var controller = GetController();

//                var result = controller.Login(loginWithoutEmail).Result as ViewResult;

//                result.ViewName.ShouldEqual("Index");
//                result.ViewData.ModelState["EmailAddress"].Errors.ShouldNotBeEmpty();
//            }

//            [Test]
//            public void When_password_is_missing_errors_should_be_present()
//            {
//                var controller = GetController();

//                var result = controller.Login(loginWithoutPassword).Result as ViewResult;

//                result.ViewName.ShouldEqual("Index");
//                result.ViewData.ModelState["Password"].Errors.ShouldNotBeEmpty();
//            }
//        }

//        [TestFixture]
//        public class On_successful_Login : AuthControllerTests
//        {
//            private readonly LoginUser login = new LoginUser { EmailAddress = "blah@volusion.com", Password = "Password1" };
//            private List<TaContext> responseWithNoTenants;
//            private List<TaContext> responseWithOneTenant;
//            private List<TaContext> responseWithManyTenants;

//            [SetUp]
//            public new void SetUp()
//            {
//                responseWithNoTenants = new List<TaContext>();
//                responseWithOneTenant = new List<TaContext> { new TaContext() };
//                responseWithManyTenants = Enumerable.Repeat(new TaContext(), 30).ToList();
//                _contextSwitcher.WithAny(x => x.ChangeTenant(0), new Tenant.Contracts.Tenant());
//            }

//            [Test]
//            public void If_user_has_no_tenants_display_error_and_load_Index_view()
//            {
//                var controller = GetController();
//                _accountApi.With(x => x.VolusionLogIn(login), responseWithNoTenants);

//                var result = controller.Login(login).Result as ViewResult;

//                result.ViewName.ShouldEqual("Index");
//                result.ViewData.ModelState["General"].Errors.ShouldNotBeEmpty();
//            }

//            [Test]
//            public void If_user_has_1_tenant_automatically_change_to_that_tenant_and_redirect_to_admin()
//            {
//                var controller = GetController();
//                _accountApi.With(x => x.VolusionLogIn(login), responseWithOneTenant);

//                var result = controller.Login(login).Result as RedirectResult;

//                result.Url.ShouldEqual(adminRedirectUrl);
//            }

//            [Test]
//            public void If_user_has_more_than_1_tenant_redirect_to_launchpad()
//            {
//                var controller = GetController();
//                _accountApi.With(x => x.VolusionLogIn(login), responseWithManyTenants);

//                var result = controller.Login(login).Result as ViewResult;

//                result.ShouldNotBeNull();
//                result.ViewName.ShouldEqual(launchPadViewName);

//                var model = result.Model as List<TaContext>;
//                model.ShouldNotBeNull();
//                model.Count.ShouldEqual(responseWithManyTenants.Count);
//            }
//        }

//        public AuthController GetController()
//        {
//            return new AuthController(_accountApi, _authHelper, _sbc, _currentUserHelper, _contextSwitcher, _userHelper, _passwordHelper, _merchantSignUpWebApiClient, _rolesHelper);
//        }
//    }
//}

