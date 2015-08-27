using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.Core.Extensions;
using Mozu.Core.Api.Client;
using Mozu.Tenant.Contracts.Clients;
using DC = Mozu.CommerceRuntime.Contracts.Wishlists;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/wishlist", SuppressDescriptorGeneration = true)]
    public class WishlistController : BaseController
    {
        private const string DEFAULT_WISHLIST_NAME = "my_wishlist";
        private IWishlistWebApiClient _wishlistWebApiClient;
        private readonly ITenantsWebApiClient _tenantsWebApiClient;
        private readonly IApiContext _apiContext;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public WishlistController(IWishlistWebApiClient wishlistWebApiClient, ITenantsWebApiClient tenantsWebApiClient, IApiContext apiContext)
        {
            _wishlistWebApiClient = wishlistWebApiClient;
            _tenantsWebApiClient = tenantsWebApiClient.CloneWithoutUserClaims();
            _apiContext = apiContext;
        }

        [HttpGetRoute(UriTemplate = "items")]
        public async Task<Response<List<DC.Wishlist>>> ListItems([FromUri]int customerAccountId, [FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            var tenant = (await _tenantsWebApiClient.GetTenantInternal(_apiContext.TenantId)).ReadAsSync();
            var tasks = tenant.Sites.Select(site => GetWishlistBySite(customerAccountId, site.Id));
            var taskResults = (await Task.WhenAll(tasks));
            var wishes = taskResults.Where(x => ! x.HasException).Select(x => x.ReadAsSync()).ToList();
            return List2(wishes);
        }

        private Task<ServiceClientResponse<DC.Wishlist>> GetWishlistBySite(int customerAccountId, int siteId)
        {
            var siteWishListClient = _wishlistWebApiClient.CloneWithApiContext(x => x.SiteId = siteId);
            return siteWishListClient.GetWishlistByName(customerAccountId, DEFAULT_WISHLIST_NAME);
        }

    }
}
