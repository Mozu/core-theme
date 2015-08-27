using AutoMapper;
using Mozu.SiteBuilder.Mvc.Models.Mapping;
using Mozu.SiteBuilder.UX.Admin.Api.ModelMapping;
using Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping;
using NUnit.Framework;
using CustomerMapping = Mozu.SiteBuilder.UX.Admin.Api.ModelMapping.CustomerMapping;
using GeneralSettingsMapping = Mozu.SiteBuilder.Mvc.Models.ModelMapping.GeneralSettingsMapping;
//using OrderMapping = Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping.OrderMapping;
using ProductMapping = Mozu.SiteBuilder.UX.Admin.Api.ModelMapping.ProductMapping;

namespace Mozu.SiteBuilder.IntegrationTests
{
    [SetUpFixture]
    public class MappingTestFixture
    {
        public MappingTestFixture()
        {
            //AutoMapper.Mapper.AddProfile<CartMapping>();
            Mapper.AddProfile<GeneralSettingsMapping>();
            Mapper.AddProfile<ProductMapping>();
            Mapper.AddProfile<DiscountMapping>();
            Mapper.AddProfile<CustomerMapping>();
            Mapper.AddProfile<CategoryMapping>();
            Mapper.AddProfile<FileManagementModelMapping>();
            Mapper.AddProfile<GeneralSettingsMapping>();
            Mapper.AddProfile<UX.Admin.Api.ModelMapping.GeneralSettingsMapping>();
            Mapper.AddProfile<UserMapping>();
            Mapper.AddProfile<AttributeMapping>();
            
            Mapper.AddProfile<TaxMapping>();
            Mapper.AddProfile<UX.Areas.StoreFront.ModelMapping.CustomerMapping>();
//            Mapper.AddProfile<OrderMapping>();
            Mapper.AddProfile<UX.Areas.StoreFront.ModelMapping.ProductMapping>();
            Mapper.AddProfile<CmsPagesMapping>();
            Mapper.AddProfile<NavigationMapping>();
        }
    }

    [TestFixture]
    public class AssertMappings
    {
        [Test, Explicit("This test is used for troubleshooting mapping profiles.")]
        public void Mappings_should_be_valid()
        {
            Mapper.AddProfile<UX.Admin.Api.ModelMapping.OrderMapping>();
            Mapper.AssertConfigurationIsValid(new UX.Admin.Api.ModelMapping.OrderMapping().ProfileName);
        }
    }
}