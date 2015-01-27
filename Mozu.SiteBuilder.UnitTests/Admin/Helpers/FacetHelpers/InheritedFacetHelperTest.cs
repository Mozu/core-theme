using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NSubstitute;
using NUnit.Framework;
using Mozu.SiteBuilder.UX.Admin.Helpers.FacetHelpers;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UnitTests.Admin.Helpers.FacetHelpers
{
    [TestFixture]
    public class InheritedFacetHelperTest
    {
        private const int _currentCategoryId = 9;

        [TestCase("happy path")]
        public void It_Should_Add_New_When_Client_Inherited_Facet_Is_Hidden(string scenario)
        {
            var inheritedClient = new List<DC.Facet>
            {
                CreateFacet(1, isHidden:true),
                CreateFacet(2, isHidden:false)
            };
            var inheritedServer = new List<DC.Facet>{
                CreateFacet(1, isHidden:false),
                CreateFacet(2, isHidden:false)
            };
            var sut = new InheritedFacetHelper();

            var actual = sut.GetOverridenFacetsToAdd(inheritedClient, inheritedServer, _currentCategoryId);
            
            Assert.That(actual.Count, Is.EqualTo(1), "should only return 1");
            Assert.That(actual.First().CategoryId == _currentCategoryId);
        }
        
        [Test]
        public void It_Should_Add_New_When_Client_Inherited_Facet_RangeQuery_Is_Modified()
        {
            //arrange
            var inheritedClient = new List<DC.Facet>
            {
                CreateFacet(facetId:1, isHidden:false, rangeQueryCount:3), //diff range count
                CreateFacet(facetId:2, isHidden:false, rangeQueryCount:5, rangeQueryModifier:10), //diff range values
                CreateFacet(facetId:3, isHidden:false, rangeQueryCount:5) //same
            };
            var inheritedServer = new List<DC.Facet>{
                CreateFacet(facetId:1, isHidden:false, rangeQueryCount:5),
                CreateFacet(facetId:2, isHidden:false, rangeQueryCount:5),
                CreateFacet(facetId:3, isHidden:false, rangeQueryCount:5)
            };
            var sut = new InheritedFacetHelper();

            //act
            var actual = sut.GetOverridenFacetsToAdd(inheritedClient, inheritedServer, _currentCategoryId);
            actual = actual.OrderBy(x => x.FacetId).ToList(); //sort to verify

            //assert
            Assert.That(actual.Count, Is.EqualTo(2), "should return 2, but returned " + actual.Count);
            Assert.That(actual.First().CategoryId == _currentCategoryId);
            Assert.That(actual.First().RangeQueries.Count == 3);
            Assert.That(actual[1].RangeQueries[0].RangeValueStart, Is.EqualTo(10));
        }
        
        [Test]
        public void It_Should_Update_Facet_Overrides_When_Different_From_Current_And_Inherited()
        {
            //arrange
            var overridenClient = new List<DC.Facet>
            {
                CreateFacet(facetId:11, isHidden:false, rangeQueryCount:3, overrideFacetId:1, categoryId:_currentCategoryId), //diff range count
                CreateFacet(facetId:12, isHidden:false, rangeQueryCount:5, rangeQueryModifier:10, overrideFacetId:2, categoryId:_currentCategoryId), //diff range values
                CreateFacet(facetId:13, isHidden:true, rangeQueryCount:5, overrideFacetId:3, categoryId:_currentCategoryId), //same as override
                CreateFacet(facetId:14, isHidden:false, rangeQueryCount:5, overrideFacetId:4, categoryId:_currentCategoryId), //same as inherited
                CreateFacet(facetId:15, isHidden:false, rangeQueryCount:0, overrideFacetId:5, categoryId:_currentCategoryId)  //same as inherite with values
            };
            var overridenServer = new List<DC.Facet>{
                CreateFacet(facetId:11, isHidden:false, rangeQueryCount:5, overrideFacetId:1, categoryId:_currentCategoryId),
                CreateFacet(facetId:12, isHidden:false, rangeQueryCount:5, overrideFacetId:2, categoryId:_currentCategoryId),
                CreateFacet(facetId:13, isHidden:true, rangeQueryCount:5, overrideFacetId:3, categoryId:_currentCategoryId),
                CreateFacet(facetId:14, isHidden:true, rangeQueryCount:5, overrideFacetId:4, categoryId:_currentCategoryId),
                CreateFacet(facetId:15, isHidden:true, rangeQueryCount:0, overrideFacetId:5, categoryId:_currentCategoryId)
            };

            var inheritedServer = new List<DC.Facet>{
                CreateFacet(facetId:1, isHidden:false, rangeQueryCount:5),
                CreateFacet(facetId:2, isHidden:false, rangeQueryCount:5),
                CreateFacet(facetId:3, isHidden:false, rangeQueryCount:5),
                CreateFacet(facetId:4, isHidden:false, rangeQueryCount:5),
                CreateFacet(facetId:5, isHidden:false, rangeQueryCount:0)
            };
            var sut = new InheritedFacetHelper();

            //act
            var actual = sut.GetOverridenFacetsToUpdate(overridenClient, overridenServer, inheritedServer);

            //assert
            Assert.That(actual.Count, Is.EqualTo(2), "should return 2, but returned " + actual.Count);
            Assert.That(actual.First().CategoryId == _currentCategoryId, "cat matches");
            Assert.That(actual.FirstOrDefault(x => x.FacetId == 11).RangeQueries.Count == 3, "range query count");
            Assert.That(actual.FirstOrDefault(x => x.FacetId == 12).RangeQueries[0].RangeValueStart, Is.EqualTo(10), "range query values");
        }

        [Test]
        public void It_Should_Delete_Facet_Overrides_When_Same_As_Inherited()
        {
            //arrange
            var overridenClient = new List<DC.Facet>
            {
                CreateFacet(facetId:11, isHidden:false, rangeQueryCount:3, overrideFacetId:1, categoryId:_currentCategoryId), //diff range count
                CreateFacet(facetId:12, isHidden:false, rangeQueryCount:5, rangeQueryModifier:10, overrideFacetId:2, categoryId:_currentCategoryId), //diff range values
                CreateFacet(facetId:13, isHidden:true, rangeQueryCount:5, overrideFacetId:3, categoryId:_currentCategoryId), //same as override
                CreateFacet(facetId:14, isHidden:false, rangeQueryCount:5, overrideFacetId:4, categoryId:_currentCategoryId), //same as inherited
                CreateFacet(facetId:15, isHidden:false, rangeQueryCount:0, overrideFacetId:5, categoryId:_currentCategoryId)  //same as inherited with values
            };

            var inheritedServer = new List<DC.Facet>{
                CreateFacet(facetId:1, isHidden:false, rangeQueryCount:5),
                CreateFacet(facetId:2, isHidden:false, rangeQueryCount:5),
                CreateFacet(facetId:3, isHidden:false, rangeQueryCount:5),
                CreateFacet(facetId:4, isHidden:false, rangeQueryCount:5),
                CreateFacet(facetId:5, isHidden:false, rangeQueryCount:0)
            };
            var sut = new InheritedFacetHelper();

            //act
            var actual = sut.GetOverridenFacetsToDelete(overridenClient, inheritedServer);

            //assert
            Assert.That(actual.Count, Is.EqualTo(2), "should return 2, but returned " + actual.Count);
            Assert.That(actual.First().CategoryId == _currentCategoryId, "cat matches");
            Assert.That(actual.FirstOrDefault(x => x.FacetId == 14), Is.Not.Null, "same as inherited");
            Assert.That(actual.FirstOrDefault(x => x.FacetId == 15), Is.Not.Null, "same as inherited with values");
        }




        private static DC.Facet CreateFacet(int facetId, bool isHidden=true, int rangeQueryCount=0, int rangeQueryModifier=0, int? overrideFacetId = null, int categoryId=3)
        {
            var facet = new DC.Facet
            {
                CategoryId = categoryId,
                FacetId = facetId,
                IsHidden = isHidden,
                FacetType = (rangeQueryCount == 0 ? "Values" : "RangeQuery"),
                OverrideFacetId = overrideFacetId
            };
            if (rangeQueryCount == 0)
            {
                return facet;
            }
            facet.RangeQueries = CreateRangeQueries(rangeQueryCount, rangeQueryModifier);
            return facet;
        }

        private static List<DC.FacetRangeQuery> CreateRangeQueries(int rangeQueryCount, int rangeQueryModifier)
        {
            var rangeQueries = new List<DC.FacetRangeQuery>();

            for (var i = 0; i < rangeQueryCount; i++)
            {
                rangeQueries.Add(new DC.FacetRangeQuery
                {
                    RangeValueStart = i*10 + rangeQueryModifier,
                    RangeValueEnd = i*10 + 9 + rangeQueryModifier
                });
            }
            return rangeQueries;
        }
    }
}
