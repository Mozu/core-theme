using System.Linq;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.ModelMapping;
using NUnit.Framework;

namespace Mozu.SiteBuilder.UnitTests.Admin.Api.ModelMapping
{
    [Category("Mapping")]
    public class AdminMappingTest
    {

        [TestFixtureSetUp]
        public void FixtureSetup()
        {
            Mapper.AddProfile<AttributeMapping>();
            Mapper.AddProfile<CapabilityMapping>();
            Mapper.AddProfile<CategoryMapping>();
            Mapper.AddProfile<CheckoutMapping>();
            Mapper.AddProfile<ContactMapping>();
            Mapper.AddProfile<CustomerContactMapping>();
            Mapper.AddProfile<CreditMapping>();
            Mapper.AddProfile<CustomerMapping>();
            Mapper.AddProfile<DiscountMapping>();
            Mapper.AddProfile<ProductAttributeMapping>();
            Mapper.AddProfile<FacetMapping>();
            Mapper.AddProfile<FileManagementModelMapping>();
            Mapper.AddProfile<GeneralSettingsMapping>();
            
            Mapper.AddProfile<OrderMapping>();
            Mapper.AddProfile<ProductMapping>();
            Mapper.AddProfile<ReturnMapping>();
            Mapper.AddProfile<RuntimeProductMapping>();
            Mapper.AddProfile<ShippingMapping>();
            Mapper.AddProfile<TaxMapping>();
            Mapper.AddProfile<TenantMapping>();
            Mapper.AddProfile<UserMapping>();
            Mapper.AddProfile<LocalizationMapping>();

            //replace with?
            //List<Type> types = _containerFactory.AssembliesToScan.SelectMany(assy => assy.GetTypes())
            //    .Where(x => x.IsSubclassOf(typeof(Profile))).ToList();

            //types.Each(t =>
            //{
            //    var profile = (Profile)Activator.CreateInstance(t);
            //    Mapper.AddProfile(profile);
            //});

        }

        [TestFixtureTearDown]
        public void FixtureTearDown()
        {
            Mapper.Reset();
        }

        [Test]
        public void AdminMappings_should_be_valid()
        {
            Mapper.AssertConfigurationIsValid();
        }
    }
}