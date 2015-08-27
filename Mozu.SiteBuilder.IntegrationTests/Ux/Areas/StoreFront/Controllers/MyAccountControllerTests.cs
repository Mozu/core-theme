//using System;
//using System.Collections.Generic;
//using System.Web.Mvc;
//using Mozu.CommerceRuntime.Contracts.Clients;
//using NSubstitute;
//using NUnit.Framework;
//using Should;
//using Mozu.Core;

//using Mozu.SiteBuilder.Mvc;
//using Mozu.SiteBuilder.Mvc.Customers;
//using Mozu.SiteBuilder.Mvc.Security;
//using Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers;
//using Mozu.SiteBuilder.UX.Models.Customers;
//using Mozu.User.Contracts.Clients;
//using Contact = Mozu.SiteBuilder.UX.Models.Customers.Contact;
//using User = Mozu.Core.Api.Contracts.User;
//using Mozu.Customer.Contracts.Clients;

//namespace Mozu.SiteBuilder.IntegrationTests.Ux.Areas.StoreFront.Controllers
//{
//    [TestFixture]
//    public class MyAccountControllerTests
//    {
//        private ICustomerRepository _customerRepository;
//        private IAccountContactRepository _accountContactRepository;
//        private IUserWebApiClient _userWebApiClient;
//        private IOrderWebApiClient _orderWebApiClient;
//        private IAuthenticationHelper _authenticationHelper;
//        private ICustomerAccountWebApiClient _customerAccountWebApiClient;
//        private LightweightUserClaims _lightweightUser;
//        private Core.Api.Contracts.User _user;

//        [SetUp]
//        public void SetUp()
//        {
//            _customerRepository = Substitute.For<ICustomerRepository>();
//            _accountContactRepository = Substitute.For<IAccountContactRepository>();
//            _userWebApiClient = Substitute.For<IUserWebApiClient>();
//            _orderWebApiClient = Substitute.For<IOrderWebApiClient>();
//            _authenticationHelper = Substitute.For<IAuthenticationHelper>();
//            _customerAccountWebApiClient = Substitute.For<ICustomerAccountWebApiClient>();

//            _lightweightUser = LightweightUserClaims.CreateForAnonymousShopper(1, 2);


//            _user = new Mozu.Core.Api.Contracts.User();
//            _userWebApiClient.With(x => x.GetUser(_lightweightUser.UserId), _user);
//            _userWebApiClient.With(x => x.UpdateUser(_user, _lightweightUser.UserId), _user);
//        }

//        //[Test]
//        //public void Index_should_apply_filter_to_GetOrders()
//        //{
//        //    var id = 12345;
//        //    var expectedFilter = "OrderStatus ne \"New\" and CustomerAccountId eq \"12345\" and OrderNumber ne null";
//        //    var orders = new List<Mozu.Order.Contracts.Order>();

//        //    var customerAccount = new CustomerAccount { Id = id };
//        //    _orderWebApiClient.With(x => x.GetOrders(0, 25, null, expectedFilter), new OrderCollection { Items = orders });
//        //    _customerRepository.With(x => x.GetByUserId(Guid.Empty.ToString("n")), customerAccount);

//        //    var controller = GetController();

//        //    var result = controller.Index().Result as ViewResult;
//        //    var model = result.Model as CustomerAccount;

//        //    model.ShouldNotBeNull();
//        //    model.Id.ShouldEqual(id);
//        //}

//        [Test]
//        public void ChangePassword_should_assign_true_to_Data_if_no_exceptions_are_thrown()
//        {
//            var controller = GetController();
//            _userWebApiClient.WithAny(x => x.ChangePassword(null, null), TestResponse.Void);

//            var result = controller.ChangePassword(new PasswordInfo()).Result as JsonDCResult;
//            Assert.That(result.Data, Is.True);
//        }

//        [Test]
//        public void DeleteCustomerContact_should_do_things()
//        {
//            var controller = GetController();
//            var id = 122333;
//            _lightweightUser.UserId = Guid.NewGuid().ToString("n");
//            var contact = new CustomerAccountContact();

//            _customerRepository.With(x => x.GetByUserId(_lightweightUser.UserId), new CustomerAccount { Id = id });
//            controller.DeleteCustomerContact(contact);

//            _accountContactRepository.Received(1).Delete(contact, id);
//        }

//        [Test]
//        public void UpdateEmail_should_assign_email_to_user_from_GetUser_and_UpdateUser()
//        {
//            var controller = GetController();
//            var email = "test_user@volusion.com";

//            var result = controller.UpdateEmail(email).Result as JsonDCResult;

//            _userWebApiClient.Received(1).UpdateUser(Arg.Is<Mozu.Core.Api.Contracts.User>(x => x.EmailAddress == email), _lightweightUser.UserId);
//            result.Data.ShouldEqual(email);
//        }

//        [Test]
//        public void UpdateCustomerContact_should_send_contact_to_repository()
//        {
//            var controller = GetController();
//            var id = 455666;
//            var contact = new CustomerAccountContact();
//            var updatedContact = new CustomerAccountContact();

//            _accountContactRepository.With(x => x.Update(Arg.Any<CustomerAccountContact>(), Arg.Any<int?>()), updatedContact);

//            _customerRepository.With(x => x.GetByUserId(_lightweightUser.UserId), new CustomerAccount { Id = id });

//            var result = controller.UpdateCustomerContact(contact).Result as JsonDCResult;

//            _accountContactRepository.Received(1).Update(contact, id);
//            result.Data.ShouldBeSameAs(updatedContact);
//        }

//        [Test]
//        public void Update_should_delegate_to_CustomerRepository()
//        {
//            var controller = GetController();
//            var id = 1010101;
//            var account = new CustomerAccount { Id = id };
//            var updatedAccount = new CustomerAccount();

//            _customerRepository.With(x => x.Update(account, account.Id), updatedAccount);

//            var result = controller.Update(account).Result as JsonDCResult;

//            _customerRepository.Received(1).Update(account, id);
//            result.Data.ShouldBeSameAs(updatedAccount);
//        }

//        [Test]
//        public void AddCustomerContact_should_pass_contact_to_AccountContactRepository_Create()
//        {
//            var controller = GetController();
//            var contact = new CustomerAccountContact { Contact = new Contact { FirstName = "Travis", MiddleName = "The", LastName = "Dolphin" } };
//            var createdContact = new CustomerAccountContact();
//            var customerAccount = new CustomerAccount { Id = 58008 };

//            _customerRepository.With(x => x.GetByUserId(_lightweightUser.UserId), customerAccount);
//            _accountContactRepository.With(x => x.Create(contact, customerAccount.Id), createdContact);

//            var result = controller.AddCustomerContact(contact).Result as JsonDCResult;

//            result.Data.ShouldBeSameAs(createdContact);
//        }

//        [Test]
//        public void GetAccount_should_return_value_from_CustomerRepository()
//        {
//            var controller = GetController();
//            var account = new CustomerAccount();

//            _customerRepository.With(x => x.GetByUserId(_lightweightUser.UserId), account);

//            var result = controller.GetAccount().Result as JsonDCResult;

//            result.Data.ShouldBeSameAs(account);
//        }

//        public MyAccountController GetController()
//        {
//            return new MyAccountController(_customerRepository, _customerAccountWebApiClient, _accountContactRepository, _userWebApiClient, _orderWebApiClient, _authenticationHelper, null );
//        }
//    }
//}

