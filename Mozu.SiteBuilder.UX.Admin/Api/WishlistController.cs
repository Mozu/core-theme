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
using Mozu.Core.Exceptions;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using Mozu.Tenant.Contracts.Clients;
using DC = Mozu.CommerceRuntime.Contracts.Wishlists;
using Mozu.SiteBuilder.UX.Admin.Helpers.WishlistHelpers;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Products;
using OrderItem = Mozu.CommerceRuntime.Contracts.Orders.OrderItem;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/wishlist", SuppressDescriptorGeneration = true)]
    public class WishlistController : BaseController
    {
        private const string DEFAULT_WISHLIST_NAME = "my_wishlist";
        private IWishlistWebApiClient _wishlistWebApiClient;
        private readonly ITenantsWebApiClient _tenantsWebApiClient;
        private readonly IOrderWebApiClient _orderWebApiClient;
        private readonly IApiContext _apiContext;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public WishlistController(IWishlistWebApiClient wishlistWebApiClient, ITenantsWebApiClient tenantsWebApiClient, IApiContext apiContext, IOrderWebApiClient orderWebApiClient)
        {
            _wishlistWebApiClient = wishlistWebApiClient;
            _tenantsWebApiClient = tenantsWebApiClient.CloneWithoutUserClaims();
            _orderWebApiClient = orderWebApiClient;
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

        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<DC.Wishlist>>> List([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {

            int? startIndex = pagingParams?.startIndex;
            int? pageSize = pagingParams?.pageSize ?? 10;
            string sort = pagingParams?.sort?.ToSortString();
            var filter = extFilter.ToFilterString();
            var q = extFilter.ToQString();
            int? qLimit = q == null ? (int?)null : 26;

            var wishlists = (await _wishlistWebApiClient.CloneWithApiContext(x => x.SiteId = null).GetWishlists(startIndex: startIndex, pageSize: pageSize, sortBy: sort, filter: filter, q: q, qLimit: qLimit)).ReadAsSync();

            return List2(Mapper.Map<List<DC.Wishlist>>(wishlists.Items), (int)wishlists.TotalCount);
        }

        [HttpPutRoute(UriTemplate = "update")]
        public async Task<Response<DC.Wishlist>> UpdateWishlist(DC.Wishlist wishlist)
        {
            var wishlistWebApiClient = _wishlistWebApiClient.CloneWithApiContext(x => x.SiteId = null);

            var resp = (await wishlistWebApiClient.UpdateWishlist(wishlist.Id, wishlist)).ReadAsSync();

            var ret = Mapper.Map<DC.Wishlist>(resp);
            return Single2(ret);
        }

        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<DC.Wishlist>> CreateWishlist(int siteId, DC.Wishlist wishlist)
        {
            var wishlistWebApiClient = _wishlistWebApiClient.CloneWithApiContext(x => x.SiteId = siteId);

            var resp = (await wishlistWebApiClient.CreateWishlist(wishlist)).ReadAsSync();

            var ret = Mapper.Map<DC.Wishlist>(resp);
            return Single2(ret);
        }

        [HttpDeleteRoute(UriTemplate = "{wishlistId}")]
        public async Task<Response<DC.Wishlist>> DeleteWishlist(string wishlistId)
        {
            var wishlistWebApiClient = _wishlistWebApiClient.CloneWithApiContext(x => x.SiteId = null);

            var resp = (await wishlistWebApiClient.DeleteWishlist(wishlistId)).ReadAsSync();

            var ret = Mapper.Map<DC.Wishlist>(resp);
            return Single2(ret);
        }

        [HttpGetRoute(UriTemplate = "{wishlistId}")]
        public async Task<Response<DC.Wishlist>>getWishlist(string wishlistId)
        {
            var wishlistWebApiClient = _wishlistWebApiClient.CloneWithApiContext(x => x.SiteId = null);

            var resp = (await wishlistWebApiClient.GetWishlist(wishlistId)).ReadAsSync();

            var ret = Mapper.Map<DC.Wishlist>(resp);
            return Single2(ret);
        }

		[HttpPostRoute(UriTemplate = "order")]
        public async Task<Response<List<Order>>> WishlistToOrder(WishlistIdArgs args)
        {
            if (args.SiteId == 0) 
                throw new VaeValidationConflictException("Siteid is required");

            var siteWishListClient = _wishlistWebApiClient.CloneWithApiContext(x => x.SiteId = args.SiteId);
            var wishList = (await siteWishListClient.GetWishlist(args.WishlistId)).ReadAsAsync().Result;

            var order = new CommerceRuntime.Contracts.Orders.Order
            {
                UserId = wishList.UserId,
                CustomerAccountId = wishList.CustomerAccountId,
                Items = wishList.Items.Select(x=> new CommerceRuntime.Contracts.Orders.OrderItem
                {
                    Product = new Product { ProductCode = x.Product.ProductCode, VariationProductCode = x.Product.VariationProductCode, BundledProducts = x.Product.BundledProducts, Options = x.Product.Options },
                    Quantity = x.Quantity,
                    Data = x.Data,
                    FulfillmentMethod = x.Product.FulfillmentTypesSupported.Contains("Digital") ? "Digital" : "Ship"
                }).ToList()
            };

 
            var orderWebApiClient = _orderWebApiClient.CloneWithApiContext(ctx => ctx.SiteId = wishList.SiteId);

            var createdOrder = (await orderWebApiClient.CreateOrder(order)).ReadAsAsync().Result;
            var single = createdOrder.Map<Order>();
            return List2<Order>(single);
        }
		
        private Task<ServiceClientResponse<DC.Wishlist>> GetWishlistBySite(int customerAccountId, int siteId, string wishlistName = DEFAULT_WISHLIST_NAME)
        {
            var siteWishListClient = _wishlistWebApiClient.CloneWithApiContext(x => x.SiteId = siteId);
            return siteWishListClient.GetWishlistByName(customerAccountId, wishlistName);
        }


        public class WishlistIdArgs
        {
            public string WishlistId { get; set; }
            public int SiteId { get; set; }
        }

    }
}
