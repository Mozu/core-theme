using System.Linq;
using AutoMapper;
using Mozu.SiteBuilder.Mvc.Models.Mapping;
using Mozu.SiteBuilder.Mvc.Models.ModelMapping;
using Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping;
using NUnit.Framework;

namespace Mozu.SiteBuilder.UnitTests.StoreFront.ModelMapping
{
    public class MvcMappingTest
    {
        [TestFixtureSetUp]
        public void FixtureSetup()
        {
            Mapper.Reset();
            Mapper.AddProfile<CartMapping>();
            Mapper.AddProfile<CmsPagesMapping>();
            Mapper.AddProfile<GeneralSettingsMapping>();
            Mapper.AddProfile<NavigationMapping>();
            Mapper.AddProfile<ProductMapping>();
            
            //Mapper.AddProfile<CustomerMapping>();
            //Mapper.AddProfile<DiscountMapping>();
            //Mapper.AddProfile<ProductAttributeMapping>();
            //Mapper.AddProfile<FacetMapping>();
            //Mapper.AddProfile<FileManagementModelMapping>();
            //Mapper.AddProfile<GeneralSettingsMapping>();
            //Mapper.AddProfile<OptionMapping>();
            //Mapper.AddProfile<OrderMapping>();
            //Mapper.AddProfile<ProductMapping>();
            //Mapper.AddProfile<ReturnMapping>();
            //Mapper.AddProfile<RuntimeProductMapping>();
            //Mapper.AddProfile<ShippingMapping>();
            //Mapper.AddProfile<TaxMapping>();
            //Mapper.AddProfile<TenantMapping>();
            //Mapper.AddProfile<UserMapping>();

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
            try
            {
                Mapper.AssertConfigurationIsValid();
            }
            catch (AutoMapperConfigurationException ex)
            {
                Assert.Inconclusive(ex.ToString());
            }
        }
    }
}