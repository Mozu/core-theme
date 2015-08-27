//using System;
//using System.Collections.Generic;
//using System.Linq;
//using NSubstitute;
//using NUnit.Framework;
//using Should;
//using Mozu.Core.Api.Contracts;
//using Mozu.Customer.Contracts;
//using Mozu.Customer.Contracts.Clients;
//using Mozu.SiteBuilder.Mvc.Customers;

//namespace Mozu.SiteBuilder.IntegrationTests.Mvc.Customers
//{
//    [TestFixture]
//    public class AccountContactRepositoryTests
//    {
//        private CustomerAccountContact _customer;
//        private CustomerAccountContact _updatedCustomer;
//        private ICustomerAccountWebApiClient _customerAccountWebApiClient;
//        private CustomerAccountContactCollection _allCustomers;
//        private CustomerAccountContact _createdCustomer;

//        //[SetUp]
//        //public void SetUp()
//        //{
//        //    _customerAccountWebApiClient = Substitute.For<ICustomerAccountWebApiClient>();

//        //    var contact = new Contact { FirstName = "Zetlen" };
//        //    var updatedContact = new Contact { LastNameOrSurname = "???" };
//        //    var createdContact = new Contact { CompanyOrOrganization = "Jimmy's All-Natural Unicorn Blood" };

//        //    _customer = new CustomerAccountContact { Id = 321, Contact = contact };
//        //    _updatedCustomer = new CustomerAccountContact { Id = 1337,  Contact = updatedContact };
//        //    _createdCustomer = new CustomerAccountContact { Id = 666, Contact = createdContact };
//        //    _allCustomers = new CustomerAccountContactCollection { Items = new List<CustomerAccountContact>
//        //        {
//        //            new CustomerAccountContact { Id = 4894 },
//        //            new CustomerAccountContact { Id = 9841 },
//        //            new CustomerAccountContact { Id = 3595 },
//        //        }};

//        //    _customerAccountWebApiClient.WithAny(x => x.GetCustomerAccountContact(null, null), _customer);
//        //    _customerAccountWebApiClient.WithAny(x => x.GetCustomerAccountContacts(null, null, null, null, null), _allCustomers);
//        //    _customerAccountWebApiClient.WithAny(x => x.UpdateCustomerAccountContact(null, null, null), _updatedCustomer);
//        //    _customerAccountWebApiClient.WithAny(x => x.AddCustomerAccountContact(null, null), _createdCustomer);
//        //}

//        [Test]
//        public void Get_should_return_mapped_CustomerAccount()
//        {
//            var repository = GetRepository();

//            var contact = repository.Get(123, 12).Result;

//            contact.Id.ShouldEqual(_customer.Id);
//            contact.Contact.FirstName.ShouldEqual(_customer.Contact.FirstName);
//        }

//        [Test]
//        public void GetAll_should_return_a_list_of_mapped_CustomerAccounts()
//        {
//            var repository = GetRepository();

//            var contacts = repository.GetAll(1234).Result;

//            contacts.Count().ShouldEqual(_allCustomers.Items.Count());
//            CollectionAssert.AreEquivalent(contacts.Select(x => x.Id), _allCustomers.Items.Select(x => x.Id));
//        }

//        [Test]
//        public void Update_should_return_a_mapped_CustomerAccount_with_matching_properties_from_service_customer()
//        {
//            var repository = GetRepository();

//            var contact = repository.Update(new UX.Models.Customers.CustomerAccountContact(), 1337).Result;

//            contact.Id.ShouldEqual(_updatedCustomer.Id);
//            contact.Contact.LastNameOrSurname.ShouldEqual(_updatedCustomer.Contact.LastNameOrSurname);
//        }

//        [Test]
//        public void Create_should_return_mapped_CustomerAccountContact_from_AddCustomerAccountContact()
//        {
//            var repository = GetRepository();

//            var contact = repository.Create(new UX.Models.Customers.CustomerAccountContact(), 666).Result;

//            contact.Id.ShouldEqual(_createdCustomer.Id);
//            contact.Contact.CompanyOrOrganization.ShouldEqual(_createdCustomer.Contact.CompanyOrOrganization);
//        }

//        private AccountContactRepository GetRepository()
//        {
//            return new AccountContactRepository(_customerAccountWebApiClient);
//        }
//    }
//}

