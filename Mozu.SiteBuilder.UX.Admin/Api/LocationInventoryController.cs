using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Core.Api.Routing;
using Mozu.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using DC = Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.UX.Admin.Helpers.LocationHelpers;
using System;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    /// <summary>
    /// Controller for products.
	/// </summary>
	[WebApi("app/locationinventory", SuppressDescriptorGeneration = true)]
    public class LocationInventoryController : BaseController
    {
        private readonly CollectionTaskUnMapper<Product, DC.Product> _productMapper = new CollectionTaskUnMapper<Product, DC.Product>();

        private readonly ILocationInventoryWebApiClient _locationInventoryClient;
        private readonly IProductWebApiClient _productClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public LocationInventoryController(ILocationInventoryWebApiClient locationInventoryClient, IProductWebApiClient productInventoryClient)
        {
            _locationInventoryClient = locationInventoryClient;
            _productClient = productInventoryClient;
        }

		[HttpGetRoute(UriTemplate = "list")]
        public async Task<HttpResponseMessage> List([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            LocationInventoryCollection inventories = null;
            if (extFilter.ContainsProperty("locationcode"))
            {
                string locationCode = extFilter.PopValue<string>("locationcode");
                string filterString = extFilter.ToFilterString();
                inventories = (await _locationInventoryClient.GetLocationInventories(locationCode: locationCode, startIndex: pagingParams.startIndex, pageSize: pagingParams.pageSize, filter: filterString)).ReadAsSync();
            }
            else if (extFilter.ContainsProperty("productcode"))
            {
                string productCode = extFilter.PopValue<string>("productcode");
                string filterString = extFilter.ToFilterString();
                inventories = (await _productClient.GetLocationInventories(productCode: productCode, startIndex: pagingParams.startIndex, pageSize: pagingParams.pageSize, filter: filterString)).ReadAsSync();
            }
            else
            {
                return this.Request.CreateResponse(HttpStatusCode.OK, FailureList2<LocationInventory>("You must specify a locationcode or productcode filter."), LowerCaseJsonMediaTypeFormatter.Default);
            }

            return this.Request.CreateResponse(HttpStatusCode.OK, List2<LocationInventory>(inventories.Items, (int)inventories.TotalCount), LowerCaseJsonMediaTypeFormatter.Default);
        }
    }
}
