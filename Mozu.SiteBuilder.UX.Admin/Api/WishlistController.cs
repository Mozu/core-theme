using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.Core.Extensions;
using Mozu.Core.Api.Client;
using DC = Mozu.CommerceRuntime.Contracts.Wishlists;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/wishlist", SuppressDescriptorGeneration = true)]
    public class WishlistController : BaseController
    {
        private const string DEFAULT_WISHLIST_NAME = "my_wishlist";
        private IWishlistWebApiClient _wishlistWebApiClient;
    
        /// <summary>
        /// Public constructor.
        /// </summary>
        public WishlistController(IWishlistWebApiClient wishlistWebApiClient)
        {
            _wishlistWebApiClient = wishlistWebApiClient;
        }

        [HttpGetRoute(UriTemplate = "items")]
        public async Task<Response<List<DC.Wishlist>>> ListItems([FromUri]int customerAccountId, [FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            string filter = String.Format("CustomerAccountId eq {0} and Name eq \"{1}\"", customerAccountId, DEFAULT_WISHLIST_NAME);
            var wishlist = (await _wishlistWebApiClient.GetWishlists(0, 1, null, filter)).ReadAsSync().Items.FirstOrDefault();

            return List2(wishlist);
        }
    }
}
