using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Helpers.LocationHelpers;
using NUnit.Framework;


namespace Mozu.SiteBuilder.UnitTests.Admin.Helpers.LocationHelpers
{
    [TestFixture]
    public class LocationHelperTest
    {

        [TestCase("1 keyword", "one")]
        [TestCase("2 keywords", "one two")]
        public void It_Should_Support_Multiple_Keywords(string scenario, string keywordValue)
        {
            var locationFilter = new FilterCollection(new List<FilterCollectionItem>()
            {
                new FilterCollectionItem()
                {
                    field = "all",
                    property = "all",
                    value = keywordValue
                }
            });

            
            var actual=locationFilter.ToFilterString();

            Assert.That(
                actual.StartsWith("(name cont \"" + keywordValue + "\"", StringComparison.InvariantCultureIgnoreCase),
                scenario);
        }

        
    }
}
