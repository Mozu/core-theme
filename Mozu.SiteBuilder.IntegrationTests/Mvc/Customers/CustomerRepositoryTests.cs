//using System;
//using System.Collections.Generic;
//using System.Linq;
//using Mozu.Core.Api.Contracts;
//using NSubstitute;
//using NUnit.Framework;
//using Should;
//using Mozu.Customer.Contracts;
//using Mozu.Customer.Contracts.Clients;
//using Mozu.SiteBuilder.Mvc.Customers;

//namespace Mozu.SiteBuilder.IntegrationTests.Mvc.Customers
//{
//    [TestFixture]
//    public class CustomerRepositoryTests
//    {
//        private ICustomerAccountWebApiClient _customerAccountWebApiClient;
//        private ICustomerGroupsRepository _customerGroupsRepository;
//        private CustomerAccount _account;
//        private CustomerAccountCollection _accounts;

//        const int startIndex = 0, pageSize = 20, customerAccountId = 1001;
//        const string sortBy = "Name DESC";
//        string filter = "Name sw 'D'";
//        const string responseGroups = "summary";

//        [SetUp]
//        public void SetUp()
//        {
//            _customerAccountWebApiClient = Substitute.For<ICustomerAccountWebApiClient>();
//            _customerGroupsRepository = Substitute.For<ICustomerGroupsRepository>();

//            _account = GetAccount();
//            _accounts = GetAccounts();

//            _customerAccountWebApiClient.With(x => x.GetCustomerAccounts(startIndex, pageSize, sortBy, responseGroups, filter), _accounts);
//            _customerAccountWebApiClient.With(x => x.GetCustomerAccount(customerAccountId), _account);
//        }

//        private CustomerAccount GetAccount()
//        {
//            return new CustomerAccount
//            {
//                Id = 1001,
//                PrimaryBillingContact = new Contact { FirstName = "Wilbur" },
//            };
//        }

//        private CustomerAccountCollection GetAccounts()
//        {
//            return new CustomerAccountCollection
//            {
//                Items = new List<CustomerAccount>
//                {
//                    new CustomerAccount { Id = 7226, UserId = "596b8ebb2e6c47c884edff588ac3c3ab",
//                        Contacts = new List<CustomerAccountContact>
//                        {
//                            new CustomerAccountContact(), new CustomerAccountContact()
//                        },
//                    },
//                    new CustomerAccount { Id = 7482, UserId = "fd377534dca5411db0724cc3848c30ed",
//                        Contacts = new List<CustomerAccountContact>
//                        {
//                            new CustomerAccountContact(), new CustomerAccountContact()
//                        },
//                        OrderSummary = new OrderSummary(),
//                    },
//                    new CustomerAccount { Id = 8079, UserId = "5f5d4229b2cf424c9adb9fb3a21e71fd",
//                        Contacts = new List<CustomerAccountContact>(),
//                        OrderSummary = new OrderSummary(),
//                    },
//                    new CustomerAccount { Id = 8115, UserId = "e15f5bcc1db5426c99f3aba1e6ef82b0",
//                        Contacts = new List<CustomerAccountContact>
//                        {
//                            new CustomerAccountContact()
//                        },
//                        OrderSummary = new OrderSummary(),
//                    },
//                },
//            };
//        }

//        [Test]
//        public void GetAll_should_return_mapped_CustomerAccounts_with_Contacts_and_OrderSummary_from_service()
//        {
//            var repository = GetRepository();

//            var customerAccounts = repository.GetAll(startIndex, pageSize, filter, sortBy, responseGroups).Result.ToArray();

//            customerAccounts.Count().ShouldEqual(2);
//            customerAccounts.Select(x => x.Id).ShouldNotContain(7226); // OrderSummary is missing
//            customerAccounts.Select(x => x.Id).ShouldNotContain(8079); // No Contacts exist
//        }

//        [Test]
//        public void Get_should_return_mapped_CustomerAccount_from_service()
//        {
//            var repository = GetRepository();

//            var customerAccount = repository.Get(1001).Result;

//            customerAccount.Id.ShouldEqual(_account.Id);
//            customerAccount.PrimaryBillingContact.FirstName.ShouldEqual(_account.PrimaryBillingContact.FirstName);
//        }

//        [Test]
//        public void GetByUserId_should_filter_by_userId()
//        {
//            var id = Guid.NewGuid().ToString("n");
//            var repository = GetRepository();
//            filter = "UserId eq " + id;

//            var collection = new CustomerAccountCollection { Items = new List<CustomerAccount> { _account } };
//            _customerAccountWebApiClient.With(x => x.GetCustomerAccounts(null, null, null, null, filter), collection);

//            var customerAccount = repository.GetByUserId(id).Result;

//            _customerAccountWebApiClient.Received(1).GetCustomerAccounts(null, null, null, null, filter);
//            customerAccount.Id.ShouldEqual(_account.Id);
//        }

//        private CustomerRepository GetRepository()
//        {
//            return new CustomerRepository(_customerAccountWebApiClient, _customerGroupsRepository);
//        }
//    }
//}

