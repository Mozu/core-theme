using System.Collections.Specialized;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using NUnit.Framework;
using DC = Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.UX.Admin.Helpers.ProductHelpers;
using Should;

namespace Mozu.SiteBuilder.UnitTests.Admin.Helpers.PriceListHelpers
{
    [TestFixture]
    public class ProductFilterExtensionsTest
    {

        [TestCase("null filter", null, "")]
        [TestCase("empty filter", "", "")]
        [TestCase("one product", "PRODUCT-AA", "(productCode in [\"PRODUCT-AA\"])")]
        [TestCase("multiple products", "PRODUCT-AA,PRODUCT-BB", "(productCode in [\"PRODUCT-AA\",\"PRODUCT-BB\"])")]
        public void Should_create_ProductCode_IN_filter(string testCase, string inputProductCodes, string expectedResult)
        {
            //GIVEN -------------------------------------------------------------
            var filterCollection = new FilterCollection
            {
                new FilterCollectionItem
                {
                    property = "productCode",
                    value = inputProductCodes
                }
            };
            filterCollection.QueryString = new NameValueCollection
            {
                {"prodcuCode", ""}
            }; 

            //SUT = ProductFilterExtension;
            //WHEN -------------------------------------------------------------
            var SUT_result = filterCollection.ToFilterString(false);

            //THEN -------------------------------------------------------------
            SUT_result.ShouldEqual(expectedResult, testCase);

        }
    }
}
