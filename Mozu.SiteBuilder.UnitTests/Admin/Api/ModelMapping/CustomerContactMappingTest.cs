using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.ModelMapping;
using NUnit.Framework;
using DC = Mozu.Customer.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Should;

namespace Mozu.SiteBuilder.UnitTests.Admin.Api.ModelMapping
{
    [TestFixture]
    [Category("Mapping")]
    public class CustomerContactMappingTest
    {
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
        public void Should_map_from_contract_to_domain()
        {
            var contractContact = new DC.CustomerContact
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
                CompanyOrOrganization = Guid.NewGuid().ToString(),
                Email = "joeblow@volusion.com",
                FirstName = "AAA",
                MiddleNameOrInitial = "BBB",
                LastNameOrSurname = "CCC",
                FaxNumber = "555-444-3333",
                PhoneNumbers = new Core.Api.Contracts.Phone
                {
                    Home = "512-555-0000",
                    Mobile = "512-555-0000",
                    Work = "555-123-1234"
                },
                Types = new List<DC.ContactType> {
                    new DC.ContactType { Name = DC.ContactTypeConst.SHIPPING, IsPrimary = true },
                    new DC.ContactType { Name = DC.ContactTypeConst.BILLING, IsPrimary = true }
                }
            };

            var domainContact = Mapper.Map<DC.CustomerContact, CustomerContact>(contractContact);
            domainContact.AccountId.ShouldEqual(contractContact.AccountId);
            domainContact.Address1.ShouldEqual(contractContact.Address.Address1);
            domainContact.CityOrTown.ShouldEqual(contractContact.Address.CityOrTown);
            domainContact.StateOrProvince.ShouldEqual(contractContact.Address.StateOrProvince);
            domainContact.CountryCode.ShouldEqual(contractContact.Address.CountryCode);
            domainContact.PostalOrZipCode.ShouldEqual(contractContact.Address.PostalOrZipCode);
            domainContact.AddressType.ShouldEqual("Residential");
            domainContact.CompanyOrOrganization.ShouldEqual(contractContact.CompanyOrOrganization);
            domainContact.Email.ShouldEqual(contractContact.Email);
            domainContact.FirstName.ShouldEqual(contractContact.FirstName);
            domainContact.MiddleName.ShouldEqual(contractContact.MiddleNameOrInitial);
            domainContact.LastName.ShouldEqual(contractContact.LastNameOrSurname);
            domainContact.FaxNumber.ShouldEqual(contractContact.FaxNumber);
            domainContact.HomePhone.ShouldEqual(contractContact.PhoneNumbers.Home);
            domainContact.MobilePhone.ShouldEqual(contractContact.PhoneNumbers.Mobile);
            domainContact.WorkPhone.ShouldEqual(contractContact.PhoneNumbers.Work);
            domainContact.IsBilling.ShouldBeTrue();
            domainContact.IsPrimaryBilling.ShouldBeTrue();
            domainContact.IsShipping.ShouldBeTrue();
            domainContact.IsPrimaryShipping.ShouldBeTrue();
        }

        [Test]
        public void Should_map_from_domain_to_contract()
        {
            var domainContact = new CustomerContact
            {
                AccountId = 1100,
                Address1 = "1835 Kramer Lane",
                CityOrTown = "Austin",
                StateOrProvince = "TX",
                CountryCode = "US",
                PostalOrZipCode = "78758",
                AddressType = "Residential",
                CompanyOrOrganization = Guid.NewGuid().ToString(),
                Email = "joeblow@volusion.com",
                FirstName = "AAA",
                MiddleName = "BBB",
                LastName = "CCC",
                FaxNumber = "555-444-3333",
                HomePhone = "512-555-0000",
                MobilePhone = "512-555-0000",
                WorkPhone = "555-123-1234",
                IsBilling = true,
                IsPrimaryBilling = true,
                IsShipping = true,
                IsPrimaryShipping = true
            };

            var contractContact = Mapper.Map<CustomerContact, DC.CustomerContact>(domainContact);
            contractContact.AccountId.ShouldEqual(domainContact.AccountId.Value);
            contractContact.Address.Address1.ShouldEqual(domainContact.Address1);
            contractContact.Address.CityOrTown.ShouldEqual(domainContact.CityOrTown);
            contractContact.Address.StateOrProvince.ShouldEqual(domainContact.StateOrProvince);
            contractContact.Address.CountryCode.ShouldEqual(domainContact.CountryCode);
            contractContact.Address.PostalOrZipCode.ShouldEqual(domainContact.PostalOrZipCode);
            contractContact.Address.AddressType.ShouldEqual(Core.Api.Contracts.Address.AddressTypes.Residential);
            contractContact.CompanyOrOrganization.ShouldEqual(domainContact.CompanyOrOrganization);
            contractContact.Email.ShouldEqual(domainContact.Email);
            contractContact.FirstName.ShouldEqual(domainContact.FirstName);
            contractContact.MiddleNameOrInitial.ShouldEqual(domainContact.MiddleName);
            contractContact.LastNameOrSurname.ShouldEqual(domainContact.LastName);
            contractContact.FaxNumber.ShouldEqual(domainContact.FaxNumber);
            contractContact.PhoneNumbers.Home.ShouldEqual(domainContact.HomePhone);
            contractContact.PhoneNumbers.Mobile.ShouldEqual(domainContact.MobilePhone);
            contractContact.PhoneNumbers.Work.ShouldEqual(domainContact.WorkPhone);
            contractContact.Types.FirstOrDefault(x => x.Name == DC.ContactTypeConst.BILLING && x.IsPrimary).ShouldNotBeNull();
            contractContact.Types.FirstOrDefault(x => x.Name == DC.ContactTypeConst.SHIPPING && x.IsPrimary).ShouldNotBeNull();
        }

        [Test]
        public void Should_map_non_primary_contact_types_to_contract()
        {
            var domainContact = new CustomerContact
            {
                AccountId = 1100,
                Address1 = "1835 Kramer Lane",
                CityOrTown = "Austin",
                StateOrProvince = "TX",
                CountryCode = "US",
                PostalOrZipCode = "78758",
                AddressType = "Residential",
                Email = "joeblow@volusion.com",
                FirstName = "AAA",
                LastName = "CCC",
                HomePhone = "512-555-0000",
                IsBilling = true,
                IsPrimaryBilling = false,
                IsShipping = true,
                IsPrimaryShipping = false
            };

            var contractContact = Mapper.Map<CustomerContact, DC.CustomerContact>(domainContact);
            contractContact.Types.Count.ShouldEqual(2);
            contractContact.Types.FirstOrDefault(x => x.Name == DC.ContactTypeConst.BILLING && !x.IsPrimary).ShouldNotBeNull();
            contractContact.Types.FirstOrDefault(x => x.Name == DC.ContactTypeConst.SHIPPING && !x.IsPrimary).ShouldNotBeNull();
        }
    }
}
