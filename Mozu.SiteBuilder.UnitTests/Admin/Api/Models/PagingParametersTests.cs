using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.ModelMapping;
using NUnit.Framework;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Helpers.DiscountHelpers;

namespace Mozu.SiteBuilder.UnitTests.Admin.Api.Models
{
    [Category("QueryString")]
    [TestFixture]
    public class PagingParametersTests
    {
        [TestCase("asc", "name", "ASC", "content.name asc")]
        [TestCase("unmapped field", "startdate", "ASC", "startdate asc")]
        [TestCase("desc", "name", "DESC", "content.name desc")]
        [TestCase("lowercase desc results in asc", "name", "desc", "content.name asc")]
        public void Given_A_Single_Sort_Item_Then_ToSort_Should_Convert_To_Api_Syntax(string scenario, string sortField, string sortDir, string expectedApiSort)
        {
            //arrange
            var conv = new DiscountSortFormatter();
            var sut = new PagingParamaters
            {
                sort = new SortingCollection {new SortingCollectionItem() {property = sortField, direction = sortDir}}
            };

            //act
            var actual = sut.ToSort(conv);

            //assert
            Assert.That(actual, Is.EqualTo(expectedApiSort), scenario);
        }

    }
}
