using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.Core.Api.Routing;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.PriceLists;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    /// <summary>
    /// Controller for runtime PriceLists.
    /// </summary>
    [WebApi("app/priceListRuntime", SuppressDescriptorGeneration = true)]
    public class PriceListRuntimeController : BaseController
    {
        private readonly IPriceListRuntimeWebApiClient _priceListRuntimeWebClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public PriceListRuntimeController(IPriceListRuntimeWebApiClient priceListRuntimeWebClient)
        {
            _priceListRuntimeWebClient = priceListRuntimeWebClient;
        }
        /// <summary>
        /// Get a list of PriceLists.
        /// </summary>
        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<RuntimePriceList>>> ListPriceLists()
        {
            var priceLists = (await _priceListRuntimeWebClient.GetPriceLists()).ReadAsSync();

            var result = Mapper.Map<List<RuntimePriceList>>(priceLists);

            return List2(result, (int?) priceLists.Count);
        }
    }
}