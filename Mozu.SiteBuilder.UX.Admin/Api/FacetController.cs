using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Core.Api.Client;
//using Volusion.ProductAdmin.Contracts;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Routing;
using CLIENT=Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Category;
using Category = Mozu.SiteBuilder.UX.Admin.Api.Models.Category.Category;
using DC = Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Facets;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/facet", SuppressDescriptorGeneration = true)]
    public class FacetController : BaseController
    {
        private readonly CLIENT.IFacetWebApiClient _facetWebApiClient;



        public FacetController(CLIENT.IFacetWebApiClient facetWebApiClient)
        {
            _facetWebApiClient = facetWebApiClient;

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
            var facets = AutoMapper.Mapper.Map<List<DC.Facet>>(set.Configured.Where(x => x.CategoryId == set.CategoryId).ToList() );
            var inheritedFacets = AutoMapper.Mapper.Map<List<DC.Facet>>(set.Configured.Where(x => x.CategoryId != set.CategoryId).ToList());
            facets.ForEach(f => f.Order = facets.IndexOf(f) + 1);
            var serverFacets = ((await _facetWebApiClient.GetFacetCategoryList(set.CategoryId)).ReadAsSync().Configured ?? new List<DC.Facet>()).Where(x => x.CategoryId == set.CategoryId).ToList();

            var newFacets = facets.Where(x => !x.FacetId.HasValue).Select(x => _facetWebApiClient.AddFacet(x)).ToList();
            var deleteFacets = serverFacets.Where(x => !facets.Any(y => x.FacetId == y.FacetId)).Select(x=>_facetWebApiClient.DeleteFacetById( x.FacetId )).ToList();

            facets.AddRange(inheritedFacets);
            var updateFacets = facets.Where(x => x.FacetId.HasValue).Select(x => _facetWebApiClient.UpdateFacet(x, x.FacetId)).ToList();
            

            if (newFacets.Count > 0)
            {
                await  Task.WhenAll(newFacets);
            }

            if (updateFacets.Count > 0)
            {
                await Task.WhenAll(updateFacets);
            }

            if (deleteFacets.Count > 0)
            {
                await  Task.WhenAll(deleteFacets);
            }


            var res = (await _facetWebApiClient.GetFacetCategoryList(set.CategoryId)).ReadAsSync();


            var ret = AutoMapper.Mapper.Map<FacetSet>(res);



            return List2(ret);

        }

    }
}
