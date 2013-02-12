using NUnit.Framework;
using Mozu.SiteBuilder.Mvc.Models.Mapping;
using Mozu.SiteBuilder.UX.Admin.Api.ModelMapping;
using GeneralSettingsMapping = Mozu.SiteBuilder.Mvc.Models.ModelMapping.GeneralSettingsMapping;

namespace Mozu.SiteBuilder.IntegrationTests
{
    [SetUpFixture]
    public class MappingTestFixture
    {
        public MappingTestFixture()
        {
            AutoMapper.Mapper.AddProfile<CartMapping>();
            AutoMapper.Mapper.AddProfile<GeneralSettingsMapping>();
            AutoMapper.Mapper.AddProfile<ProductMapping>();
            AutoMapper.Mapper.AddProfile<DiscountMapping>();
            AutoMapper.Mapper.AddProfile<CustomerMapping>();
            AutoMapper.Mapper.AddProfile<SettingsMapping>();
            AutoMapper.Mapper.AddProfile<CategoryMapping>();
            AutoMapper.Mapper.AddProfile<FileManagementModelMapping>();
            AutoMapper.Mapper.AddProfile<GeneralSettingsMapping>();
            AutoMapper.Mapper.AddProfile<UX.Admin.Api.ModelMapping.GeneralSettingsMapping>();
            AutoMapper.Mapper.AddProfile<UX.Admin.Api.ModelMapping.NavigationMapping>();
            AutoMapper.Mapper.AddProfile<UX.Admin.Api.ModelMapping.UserMapping>();
            AutoMapper.Mapper.AddProfile<NavigationMapping>();
            AutoMapper.Mapper.AddProfile<OptionMapping>();
            AutoMapper.Mapper.AddProfile<TaxMapping>();
            AutoMapper.Mapper.AddProfile<UX.Areas.StoreFront.ModelMapping.CustomerMapping>();
            AutoMapper.Mapper.AddProfile<UX.Areas.StoreFront.ModelMapping.OrderMapping>();
            AutoMapper.Mapper.AddProfile<UX.Areas.StoreFront.ModelMapping.ProductMapping>();
            AutoMapper.Mapper.AddProfile<UX.Areas.StoreFront.ModelMapping.CmsPagesMapping>();
        }
    }

    [TestFixture]
    public class AssertMappings
    {
        [Test, Explicit("This test is used for troubleshooting mapping profiles.")]
        public void Mappings_should_be_valid()
        {
            AutoMapper.Mapper.AddProfile<UX.Admin.Api.ModelMapping.UserMapping>();
            AutoMapper.Mapper.AssertConfigurationIsValid(new UX.Admin.Api.ModelMapping.UserMapping().ProfileName);
        }
    }
}