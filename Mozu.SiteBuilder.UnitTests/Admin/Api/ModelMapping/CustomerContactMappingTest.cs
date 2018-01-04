using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.ModelMapping;
using NUnit.Framework;
using DC = Mozu.Customer.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UnitTests.Admin.Api.ModelMapping
{
    [TestFixture]
    [Category("Mapping")]
    public class CustomerContactMappingTest
    {
        private static DC.CustomerContact dcTestObj = new DC.CustomerContact
        {
            AccountId = 1100,
            Address = new Core.Api.Contracts.Address
            {
                Address1 = "1835 Kramer Lane",
                CityOrTown = "Austin",
                StateOrProvince = "TX",
                CountryCode = "US",
                PostalOrZipCode = "78758",
                AddressType = Core.Api.Contracts.Address.AddressTypes.Residential
            },
            CompanyOrOrganization = "",
            Email = "joeblow@volusion.com",
            FaxNumber = null,
            FirstName = "AAA",
            MiddleNameOrInitial = "",
            LastNameOrSurname = "BB",
            PhoneNumbers = new Core.Api.Contracts.Phone
            {
                Home = "512-555-0000",
                Mobile = "512-555-0000",
                Work = ""
            },
            Types = new List<DC.ContactType> {
                new DC.ContactType { Name = DC.ContactTypeConst.SHIPPING, IsPrimary = true },
                new DC.ContactType { Name = DC.ContactTypeConst.BILLING, IsPrimary = true },
            }
        };
        private static CustomerContact testObj = new CustomerContact
        {
            AccountId = 1100,
            CompanyOrOrganization = "",
            Email = "joeblow@volusion.com",
            FaxNumber = null,
            FirstName = "AAA",
            IsBilling = true

        };


        [TestFixtureSetUp]
        public void FixtureSetup()
        {
            Mapper.Reset();
            Mapper.Initialize(cfg =>
            {
                cfg.AddProfile<ContactMapping>();
                cfg.AddProfile<CustomerContactMapping>();
            });
            
        }

        [TestFixtureTearDown]
        public void FixtureTearDown()
        {
            Mapper.Reset();
        }

        [Test]
        public void AddressType_should_map_to_sb_contract() {
            var mapped = Mapper.Map<DC.CustomerContact, CustomerContact>(dcTestObj);
            Assert.AreEqual(Core.Api.Contracts.Address.AddressTypes.Residential, mapped.AddressType);
        }
        
        [Test]
        public void AddressType_should_map_to_dc_contract()
        {
            var custContact = new CustomerContact()
            {
                IsPrimaryShipping = true,
                IsShipping = true
            };
            var mapped = Mapper.Map<DC.CustomerContact>(custContact);
            Assert.IsTrue(mapped.Types[0].IsPrimary);
            Assert.AreEqual("Shipping", mapped.Types[0].Name);
        }

        [Test]
        public void Should_map_CustomerContact_base()
        {
            var mapped = Mapper.Map<CustomerContact>(dcTestObj);

            Assert.AreEqual(mapped.Email, dcTestObj.Email);
            Assert.IsTrue(mapped.Email == dcTestObj.Email);
        }

        [Test]
        public void Should_map_CustomerContact_base_reverse()
        {
            var mapped = Mapper.Map<DC.CustomerContact>(testObj);

            Assert.AreEqual(mapped.Email, dcTestObj.Email);
            Assert.IsTrue(mapped.Email == dcTestObj.Email);
        }

    }
}
