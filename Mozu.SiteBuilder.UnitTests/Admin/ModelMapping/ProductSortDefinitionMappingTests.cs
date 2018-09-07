using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.ModelMapping;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductSortDefinitions;
using NUnit.Framework;
using Should;

namespace Mozu.SiteBuilder.UnitTests.Admin.ModelMapping
{
    public class ProductSortDefinitionMappingTests
    {
        [TestFixtureSetUp]
        public void FixtureSetup()
        {
            Mapper.Reset();

            Mapper.Initialize(cfg =>
            {
                cfg.AddProfile<ProductSortDefinitionMapping>();
            });
        }

        [TestFixtureTearDown]
        public void FixtureTearDown()
        {
            Mapper.Reset();
        }

        [Test]
        public void ProductSortDefinition_Mappings_Should_Be_Valid()
        {
            Mapper.AssertConfigurationIsValid();
        }

        [Test]
        public void Should_Map_Between_Contract_And_Domain()
        {
            //GIVEN 
            var productSortDefinition = GetBasicTwoBoostedOneBuried();


            //When converting to admin contract
            var adminContract = Mapper.Map<ProductAdmin.Contracts.ProductSortDefinition>(productSortDefinition);

            //THEN
            // Admin contract should be populated
            adminContract.Boosted.Count.ShouldEqual(2);
            adminContract.Buried.Count.ShouldEqual(1);
            adminContract.Boosted.Count(o => o.ProductCode == "AAA").ShouldEqual(1);
            adminContract.Boosted.Count(o => o.ProductCode == "BBB").ShouldEqual(1);
            adminContract.Buried.Count(o => o.ProductCode == "ZZZ").ShouldEqual(1);
            adminContract.SortExpressions.Count.ShouldEqual(2);

            var mappedDomain = Mapper.Map<ProductSortDefinition>(adminContract);

            mappedDomain.Products.Count.ShouldEqual(3);
            mappedDomain.SortExpressions.Count.ShouldEqual(2);
        }

        private static ProductSortDefinition GetBasicTwoBoostedOneBuried()
        {
            var productList = new List<ProductSortPosition>
            {
                new ProductSortPosition
                {
                    ProductCode = "AAA",
                    Position = 1,
                    IsRanked = true,
                    IsBuried = false,
                    IsPinned = false,
                },
                new ProductSortPosition
                {
                    ProductCode = "BBB",
                    Position = 2,
                    IsRanked = true,
                    IsBuried = false,
                    IsPinned = false,
                },
                new ProductSortPosition
                {
                    ProductCode = "ZZZ",
                    Position = null,
                    IsRanked = false,
                    IsBuried = true,
                    IsPinned = false,
                }
            };

            var productSortDefinition = new ProductSortDefinition
            {
                Id = 1,
                Name = "Test 2 rank, 1 buried",
                StartDate = DateTime.UtcNow.AddMinutes(-10),
                EndDate = DateTime.UtcNow.AddYears(1),
                SortExpressions = MultipleSortingCollection,
                Products = productList
            };

            return productSortDefinition;
        }

        private static readonly SortingCollection MultipleSortingCollection = new SortingCollection
        {
            new SortingCollectionItem
            {
                direction = "asc",
                property = "createdate"
            },
            new SortingCollectionItem
            {
                direction = "asc",
                property = "price"
            }
        };
    }
}
