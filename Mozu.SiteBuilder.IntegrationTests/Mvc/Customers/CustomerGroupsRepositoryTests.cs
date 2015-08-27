//using System.Collections.Generic;
//using System.IO;
//using System.Net.Http;
//using NSubstitute;
//using NUnit.Framework;
//using Should;
//using Mozu.Customer.Contracts;
//using Mozu.Customer.Contracts.Clients;
//using Mozu.SiteBuilder.Mvc.Customers;

//namespace Mozu.SiteBuilder.IntegrationTests.Mvc.Customers
//{
//    [TestFixture]
//    public class CustomerGroupsRepositoryTests
//    {
//        private ICustomerGroupWebApiClient _customerGroupsWebApiClient;
//        private ICustomerAccountWebApiClient _customerAccountWebApiClient;

//        private List<CustomerGroup> _allCustomerGroups;
//        private CustomerGroup _createdCustomerGroup;
//        private CustomerGroup _getCustomerGroup;

//        [SetUp]
//        public void SetUp()
//        {
//            _customerGroupsWebApiClient = Substitute.For<ICustomerGroupWebApiClient>();
//            _customerAccountWebApiClient = Substitute.For<ICustomerAccountWebApiClient>();

//            _getCustomerGroup = new CustomerGroup { Id = 32354, Name = "Rudolph the Horse mask" };
//            _createdCustomerGroup = new CustomerGroup { Id = 123, Name = "Gingerbread" };
//            _allCustomerGroups = new List<CustomerGroup>
//                {
//                    new CustomerGroup { Id = 111, Name = "Seasonal Flavors" },
//                    new CustomerGroup { Id = 222, Name = "Candy Canes" },
//                };

//            _customerGroupsWebApiClient.With(x => x.GetCustomerGroup(Arg.Any<int?>()), _getCustomerGroup);
//            _customerGroupsWebApiClient.With(x => x.GetCustomerGroups(Arg.Any<int?>(), Arg.Any<int?>(), Arg.Any<string>(), Arg.Any<string>()), new CustomerGroupCollection { Items = _allCustomerGroups });
//            _customerGroupsWebApiClient.With(x => x.AddCustomerGroup(Arg.Any<CustomerGroup>()), _createdCustomerGroup);
//            _customerGroupsWebApiClient.With(x => x.DeleteCustomerGroup(Arg.Any<int?>()), TestResponse.Void);
//        }

//        [Test]
//        public void GetAll_should_return_CustomerGroups_mapped_from_service()
//        {
//            var repository = GetRepository();

//            var groups = repository.GetAll("", null, 0).Result;

//            groups[0].Id.ShouldEqual(_allCustomerGroups[0].Id);
//            groups[0].Name.ShouldEqual(_allCustomerGroups[0].Name);
//        }

//        [Test]
//        public void Create_should_return_mapped_CustomerGroup_from_service_AddCustomerGroup()
//        {
//            var repository = GetRepository();

//            var group = repository.Create(new UX.Models.Customers.CustomerGroup()).Result;

//            group.Name.ShouldEqual(_createdCustomerGroup.Name);
//            group.Id.ShouldEqual(_createdCustomerGroup.Id);
//        }

//        [Test]
//        public void Delete_should_pass_group_Id_to_service_DeleteCustomerGroup()
//        {
//            var id = 432;
//            var repository = GetRepository();

//            repository.Delete(new UX.Models.Customers.CustomerGroup { Id = id, Name = "Peter Cetera" });

//            _customerGroupsWebApiClient.Received(1).DeleteCustomerGroup(id);
//        }

//        private CustomerGroupsRepository GetRepository()
//        {
//            return new CustomerGroupsRepository(_customerGroupsWebApiClient, _customerAccountWebApiClient);
//        }
//    }
//}

