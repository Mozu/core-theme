using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Facets;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.FacetHelpers
{
    public class FacetUpdater : IFacetUpdater
    {
        private readonly IFacetWebApiClient _facetWebApiClient;

        public FacetUpdater(IFacetWebApiClient facetWebApiClient)
        {
            _facetWebApiClient = facetWebApiClient;
        }

        public async Task<FacetSet> UpdateFacetSet(FacetSet set)
        {
            var facets = AutoMapper.Mapper.Map<List<ProductAdmin.Contracts.Facet>>(set.Configured.Where(x => x.CategoryId == set.CategoryId).ToList());
            var inheritedFacets = AutoMapper.Mapper.Map<List<ProductAdmin.Contracts.Facet>>(set.Configured.Where(x => x.CategoryId != set.CategoryId).ToList());

            facets.ForEach(f => f.Order = facets.IndexOf(f) + 1);
            var serverFacetSet = (await _facetWebApiClient.GetFacetCategoryList(set.CategoryId)).ReadAsSync().Configured;
            var serverFacets = (serverFacetSet != null) ? serverFacetSet.Where(x => x.CategoryId == set.CategoryId).ToList() : new List<ProductAdmin.Contracts.Facet>();
            var inheritedServerFacets = (serverFacetSet != null) ? serverFacetSet.Where(x => x.CategoryId != set.CategoryId).ToList() : new List<ProductAdmin.Contracts.Facet>();

            var newFacets = facets.Where(x => !x.FacetId.HasValue).Select(x => _facetWebApiClient.AddFacet(x)).ToList();
            var updateFacets = facets.Where(x => x.FacetId.HasValue).Select(x => _facetWebApiClient.UpdateFacet(x, x.FacetId)).ToList();
            var deleteFacets = serverFacets.Where(x => !facets.Any(y => x.FacetId == y.FacetId)).Select(x => _facetWebApiClient.DeleteFacetById(x.FacetId)).ToList();

            if (newFacets.Count > 0)
            {
                await Task.WhenAll(newFacets);
            }

            if (updateFacets.Count > 0)
            {
                await Task.WhenAll(updateFacets);
            }

            if (deleteFacets.Count > 0)
            {
                await Task.WhenAll(deleteFacets);
            }


            var res = (await _facetWebApiClient.GetFacetCategoryList(set.CategoryId)).ReadAsSync();


            return AutoMapper.Mapper.Map<FacetSet>(res);
        }
    }
}