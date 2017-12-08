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
            Mapper.Reset();
            Mapper.Initialize(cfg =>
            { //AutoMapper.Mapper.AddProfile<CartMapping>();
                cfg.AddProfile<GeneralSettingsMapping>();
                cfg.AddProfile<ProductMapping>();
                cfg.AddProfile<DiscountMapping>();
                cfg.AddProfile<CustomerMapping>();
                cfg.AddProfile<CategoryMapping>();
                cfg.AddProfile<FileManagementModelMapping>();
                cfg.AddProfile<GeneralSettingsMapping>();
                cfg.AddProfile<UX.Admin.Api.ModelMapping.GeneralSettingsMapping>();
                cfg.AddProfile<UserMapping>();
                cfg.AddProfile<AttributeMapping>();

                cfg.AddProfile<TaxMapping>();
                cfg.AddProfile<UX.Areas.StoreFront.ModelMapping.CustomerMapping>();
                cfg.AddProfile<UX.Admin.Api.ModelMapping.OrderMapping>();
                cfg.AddProfile<UX.Areas.StoreFront.ModelMapping.ProductMapping>();
                cfg.AddProfile<CmsPagesMapping>();
                cfg.AddProfile<NavigationMapping>();

            });
           
        }
    }

    [TestFixture]
    public class AssertMappings
    {
        [Test, Explicit("This test is used for troubleshooting mapping profiles.")]
        public void Mappings_should_be_valid()
        {
            Mapper.Reset();
            Mapper.Initialize(cfg =>
            {
                cfg.AddProfile<UX.Admin.Api.ModelMapping.OrderMapping>();
                
            });
            Mapper.AssertConfigurationIsValid();
        }
    }
}