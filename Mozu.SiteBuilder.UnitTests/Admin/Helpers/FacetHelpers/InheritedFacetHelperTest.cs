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

        [TestCase("happy")]
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






        private static DC.Facet CreateFacet(int facetId, bool isHidden=true, int rangeQueryCount=0, int rangeQueryModifier=0)
        {
            var facet = new DC.Facet
            {
                CategoryId = 3,
                FacetId = facetId,
                IsHidden = isHidden,
                FacetType = (rangeQueryCount == 0 ? "Values" : "RangeQuery")
            };
            if (rangeQueryCount == 0)
            {
                return facet;
            }
            facet.RangeQueries = new List<DC.FacetRangeQuery>();

            for (var i = 0; i < rangeQueryCount; i++)
            {
                facet.RangeQueries.Add(new DC.FacetRangeQuery
                    {
                        RangeValueStart = i*10 + rangeQueryModifier,
                        RangeValueEnd = i*10 + 9 + rangeQueryModifier
                    });
            }
            return facet;
        }
    }
}
