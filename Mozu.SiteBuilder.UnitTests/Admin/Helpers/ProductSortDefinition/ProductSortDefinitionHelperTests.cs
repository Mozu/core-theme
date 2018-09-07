using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.ModelMapping;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductSortDefinitions;
using NUnit.Framework;
using Mozu.SiteBuilder.UX.Admin.Helpers.ProductSortDefinitionHelpers;
using SB = Mozu.SiteBuilder.UX.Admin.Api.Models.ProductSortDefinitions;
using UX = Mozu.SiteBuilder.UX.Admin.Api.Models;

using Should;

namespace Mozu.SiteBuilder.UnitTests.Admin.Helpers.ProductSortDefinition
{
    public class ProductSortDefinitionProductSortDefinitionHelperTestsMappingTests
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

        #region Validation

        [Test, ExpectedException]
        public void Should_fail_validation_pinned_above_10()
        {
            //GIVEN - pinned product above 10
            var inputFromUi = GetBasicSortDefinition("Invalid pin");

            inputFromUi.Products.Add(new ProductSortPosition
            {
                IsPinned = true,
                ProductCode = "invalid-pin",
                Position = 44
            });

            //WHEN - Validate
            ProductSortDefinitionHelper.ValidateSortDefinition(inputFromUi);

            //THEN 
            //Should have failed validation
            Assert.Fail("Validation didn't catch invalid pin");
        }

        [Test, ExpectedException]
        public void Should_fail_validation_for_boosted_more_than_50()
        {

            //GIVEN - pinned product above 10
            var inputFromUi = GetBasicSortDefinition("Invalid pin");

            for (var position = 0; position < 52; position++)
            {
                inputFromUi.Products.Add(new ProductSortPosition
                {
                    IsRanked = true,
                    ProductCode = $"product-{position}",
                    Position = position
                });
            }

            //WHEN - Validate
            ProductSortDefinitionHelper.ValidateSortDefinition(inputFromUi);

            //THEN 
            //Should have failed validation
            Assert.Fail("Validation didn't catch too many boosted");
        }

        [Test, ExpectedException]
        public void Should_fail_validation_for_boosted_higher_than_50()
        {

            //GIVEN - pinned product above 10
            var inputFromUi = GetBasicSortDefinition("Invalid boost");

            inputFromUi.Products.Add(new ProductSortPosition
                {
                    IsRanked= true,
                    ProductCode = $"product-55",
                    Position = 55
                });

            //WHEN - Validate
            ProductSortDefinitionHelper.ValidateSortDefinition(inputFromUi);

            //THEN 
            //Should have failed validation
            Assert.Fail("Validation didn't catch invalid boost");
        }

        #endregion Validation

        #region Convert from UI to domain contract

        [Test]
        public void Should_map_from_contract_to_domain()
        {
            //GIVEN 
            var productSortDefinition = GetTwoBoostedOneBuried();

            //WHEN converting to runtime contract
            var runtimeContract = ProductSortDefinitionHelper.MapFrontEndToRuntime(productSortDefinition);

            //THEN
            // Runtime runtime contract should be populated
            runtimeContract.Boosted.Count.ShouldEqual(2);
            runtimeContract.Buried.Count.ShouldEqual(1);
            runtimeContract.Boosted.Count(z => z.ProductCode == "AAA").ShouldEqual(1);
            runtimeContract.Boosted.Count(z => z.ProductCode == "BBB").ShouldEqual(1);
            runtimeContract.Buried.Count(z => z.ProductCode == "ZZZ").ShouldEqual(1);
        }

        [Test]
        public void Should_map_from_solr_results_to_domain()
        {
            //GIVEN 
            var inputFromUi = GetBasicSortDefinition("Invalid pin");
            
            inputFromUi.Products.Add(new ProductSortPosition
            {
                IsRanked = true,
                ProductCode = "AAA",
                Position = 3
            });
            inputFromUi.Products.Add(new ProductSortPosition
            {
                IsRanked = true,
                ProductCode = "BBB",
                Position = 2
            });

            var solrResults = GetSolrPreviewResponse(inputFromUi);
            solrResults.Add(new Mozu.ProductRuntime.Contracts.Product { ProductCode = "JJJ"});
            solrResults.Add(new Mozu.ProductRuntime.Contracts.Product { ProductCode = "KKK"});
            
            //WHEN converting to runtime contract
            var sortedResults = ProductSortDefinitionHelper.MapRuntimeToFrontEnd(solrResults, inputFromUi);

            //THEN
            // Runtime runtime contract should be populated
            sortedResults.FirstOrDefault(z => z.ProductCode == "AAA")?.Position.ShouldEqual(3);
            sortedResults.FirstOrDefault(z => z.ProductCode == "BBB")?.Position.ShouldEqual(2);
            sortedResults.Count().ShouldEqual(solrResults.Count());

        }

        #endregion Convert from UI to domain contract

        #region Helpers

        private static SB.ProductSortDefinition GetBasicSortDefinition(string name)
        {
            return new SB.ProductSortDefinition
            {
                Id = 1,
                CategoryId = 99,
                Name = name,
                StartDate = DateTime.UtcNow.AddMinutes(-10),
                EndDate = DateTime.UtcNow.AddYears(1),
                SortExpressions = MultipleSortingCollection,
                Products = new List<ProductSortPosition>()
            };
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

        private static SB.ProductSortDefinition GetTwoBoostedOneBuried()
        {
            SB.ProductSortDefinition productSortDefinition = GetBasicSortDefinition("test");

            productSortDefinition.Products = new List<ProductSortPosition>
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
            return productSortDefinition;
        }

        private static List<Mozu.ProductRuntime.Contracts.Product> GetSolrPreviewResponse(SB.ProductSortDefinition inputProducts)
        {
            var solrResults = inputProducts
                .Products
                .Select(z => new Mozu.ProductRuntime.Contracts.Product
                {
                    ProductCode = z.ProductCode,
                });

            return solrResults.ToList();
        }

        #endregion Helpers

    }
}
