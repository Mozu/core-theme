using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Routing;
using CLIENT=Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Category;
using Category = Mozu.SiteBuilder.UX.Admin.Api.Models.Category.Category;
using DC = Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Facets;
using Mozu.SiteBuilder.UX.Admin.Helpers.FacetHelpers;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/facet", SuppressDescriptorGeneration = true)]
    public class FacetController : BaseController
    {
        private readonly CLIENT.IFacetWebApiClient _facetWebApiClient;
        private readonly IInheritedFacetHelper _inheritedFacetHelper;


        public FacetController(CLIENT.IFacetWebApiClient facetWebApiClient, IInheritedFacetHelper inheritedFacetHelper)
        {
            _facetWebApiClient = facetWebApiClient;
            _inheritedFacetHelper = inheritedFacetHelper;
        }

        [HttpGetRoute(UriTemplate = "set/read?id={id}")]
        public async Task<Response<List<FacetSet>>> GetFacetSet(int id)
        {
            var res = (await _facetWebApiClient.GetFacetCategoryList(id)).ReadAsSync();


            var ret = AutoMapper.Mapper.Map<FacetSet>(res);

            ret.Configured = ret.Configured.OrderBy(f => f.Order).ToList();

            ret.CategoryId = id;
            return List2(ret);

        }

		[HttpPostRoute(UriTemplate = "set/edit")]
        public async Task<Response<List<FacetSet>>> UpdateFacetSet(FacetSet set )
        {
            var currentCategoryFacets = Mapper.Map<List<DC.Facet>>(set.Configured.Where(x => x.CategoryId == set.CategoryId).ToList());
		    var facets = currentCategoryFacets.Where(x => x.OverrideFacetId == null).ToList();
            facets.ForEach(f => f.Order = facets.IndexOf(f) + 1);

            //client facets
            var inheritedClientFacets = Mapper.Map<List<DC.Facet>>(set.Configured.Where(x => x.CategoryId != set.CategoryId && x.OverrideFacetId == null).ToList());
		    var overridenClientFacets = currentCategoryFacets.Where(x => x.OverrideFacetId != null).ToList();
            
            //server facets
            var configuredServerFacets = (await _facetWebApiClient.GetFacetCategoryList(set.CategoryId)).ReadAsSync().Configured ?? new List<DC.Facet>();
            var serverFacets = configuredServerFacets.Where(x => x.CategoryId == set.CategoryId && x.OverrideFacetId == null);
            var inheritedServerFacet = configuredServerFacets.Where(x => x.CategoryId != set.CategoryId && x.OverrideFacetId == null).ToList();
            var overridenServerFacet = configuredServerFacets.Where(x => x.OverrideFacetId != null).ToList();

            await AddFacets(set, facets, inheritedClientFacets, inheritedServerFacet);
            await UpdateFacets(facets, overridenClientFacets, overridenServerFacet, inheritedServerFacet);
            await DeleteFacets(serverFacets, facets, overridenClientFacets, inheritedServerFacet);

		    var res = (await _facetWebApiClient.GetFacetCategoryList(set.CategoryId)).ReadAsSync();
            var ret = Mapper.Map<FacetSet>(res);
            return List2(ret);
        }

        private async Task UpdateFacets(List<DC.Facet> facets, List<DC.Facet> overridenFacets, List<DC.Facet> overridenServerFacet, List<DC.Facet> inheritedServerFacet)
        {
            var facetsToUpdate = facets.Where(x => x.FacetId.HasValue).ToList();
            facetsToUpdate.AddRange(_inheritedFacetHelper.GetOverridenFacetsToUpdate(overridenFacets, overridenServerFacet,
                inheritedServerFacet));
            var updateFacetCalls = facetsToUpdate.Select(x => _facetWebApiClient.UpdateFacet(x, x.FacetId)).ToList();
            if (updateFacetCalls.Count > 0)
            {
                await Task.WhenAll(updateFacetCalls);
            }
        }

        private async Task AddFacets(FacetSet set, List<DC.Facet> facets, List<DC.Facet> inheritedFacets, List<DC.Facet> inheritedServerFacet)
        {
            var facetsToAdd = facets.Where(x => !x.FacetId.HasValue).ToList();
            facetsToAdd.AddRange(_inheritedFacetHelper.GetOverridenFacetsToAdd(inheritedFacets, inheritedServerFacet,
                set.CategoryId));
            var newFacetCalls = facetsToAdd.Select(x => _facetWebApiClient.AddFacet(x)).ToList();
            if (newFacetCalls.Count > 0)
            {
                await Task.WhenAll(newFacetCalls);
            }
        }

        private async Task DeleteFacets(IEnumerable<DC.Facet> serverFacets, List<DC.Facet> facets, List<DC.Facet> overridenFacets, List<DC.Facet> inheritedServerFacet)
        {
            var facetsToDelete = serverFacets.Where(x => facets.All(y => x.FacetId != y.FacetId)).ToList();
            facetsToDelete.AddRange(_inheritedFacetHelper.GetOverridenFacetsToDelete(overridenFacets, inheritedServerFacet));
            var deleteFacetCalls = facetsToDelete.Select(x => _facetWebApiClient.DeleteFacetById(x.FacetId)).ToList();
            if (deleteFacetCalls.Count > 0)
            {
                await Task.WhenAll(deleteFacetCalls);
            }
        }

    }
}
