using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using AutoMapper;
using Mozu.Core.Api.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.ModelMapping;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;
using D = Mozu.ProductAdmin.Contracts;
using NUnit.Framework;

namespace Mozu.SiteBuilder.UnitTests.Admin.Api.ModelMapping.Perf
{
    //[TestFixture]
    public class AutomapperMapFromPerfTest
    {
        #region setup & teardown

        [TearDown]
        public void TearDown()
        {
            Mapper.Reset();
        }

        [SetUp]
        public void SetUp()
        {
            Mapper.AddProfile<AttributeMapping>();
            Mapper.AddProfile<CapabilityMapping>();
            Mapper.AddProfile<CategoryMapping>();
            Mapper.AddProfile<CheckoutMapping>();
            Mapper.AddProfile<ContactMapping>();
            Mapper.AddProfile<CreditMapping>();
            Mapper.AddProfile<CustomerMapping>();
            Mapper.AddProfile<DiscountMapping>();
            Mapper.AddProfile<ExtensibleAttributeMapping>();
            Mapper.AddProfile<FacetMapping>();
            Mapper.AddProfile<FileManagementModelMapping>();
            Mapper.AddProfile<GeneralSettingsMapping>();
            
            Mapper.AddProfile<OrderMapping>();
            Mapper.AddProfile<ProductMapping>();
            Mapper.AddProfile<OldReturnMapping>();
            Mapper.AddProfile<RuntimeProductMapping>();
            Mapper.AddProfile<ShippingMapping>();
            Mapper.AddProfile<TaxMapping>();
            Mapper.AddProfile<TenantMapping>();
            Mapper.AddProfile<UserMapping>();

        }

        #endregion setup

        [Test, Ignore]
        public void MapFrom_With_Complex_Object_Perf_Test()
        {
            //arrange
            var domainProduct = PerfUtil.CreateDomainProduct();

            //act
            var st = PerfUtil.ExecuteTimeMapping(domainProduct);

            //anaylyze
            PerfUtil.WriteSummary(PerfUtil.MaxTimes, st);

        }
    }
}