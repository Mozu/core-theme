using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Routing;
using Mozu.Location.Contracts.Clients;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using Mozu.SiteBuilder.UX.Admin.Helpers.LocationInventoryHelpers;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    /// <summary>
    /// Controller for products.
	/// </summary>
	[WebApi("app/locationinventory", SuppressDescriptorGeneration = true)]
    public class LocationInventoryController : BaseController
    {
        private readonly ILocationInventoryWebApiClient _locationInventoryClient;
        private readonly IProductWebApiClient _productClient;
        private readonly ILocationAdminWebApiClient _locationWebApiClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public LocationInventoryController(ILocationInventoryWebApiClient locationInventoryClient, IProductWebApiClient productInventoryClient, ILocationAdminWebApiClient locationWebApiClient)
        {
            _locationInventoryClient = locationInventoryClient;
            _productClient = productInventoryClient;
            _locationWebApiClient = locationWebApiClient;
        }

        /// <summary>
        /// Monkey patch LocationName into LocationInventory (the by-product lookup needs it).
        /// </summary>
        public class SuperchargedLocationInventory : DC.LocationInventory
        {
            public string LocationName { get; set; }
            public SuperchargedLocationInventory(DC.LocationInventory locbase, string locationName)
            {
                // use some automapper magic.
                Mapper.DynamicMap<DC.LocationInventory, SuperchargedLocationInventory>(locbase, this);
                this.LocationName = LocationName;
            }
        }

		[HttpGetRoute(UriTemplate = "list")]
        public async Task<HttpResponseMessage> List([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            DC.LocationInventoryCollection inventories = null;
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

                // now do a lookup of the location names for all the location codes.
                var locationCodes = inventories.Items.Select(i => i.LocationCode).Distinct();
                string locationFilter = String.Join(" or ", locationCodes.Select(lc => "locationcode eq " + lc));
                var locations = (await _locationWebApiClient.GetLocations(filter: locationFilter)).ReadAsSync().Items;
                inventories.Items =
                    (from i in inventories.Items
                     let loc = locations.First(l => l.Code == i.LocationCode)
                     select new SuperchargedLocationInventory(i, loc.Name)
                    ).ToList<DC.LocationInventory>();
            }
            else
            {
                return this.Request.CreateResponse(HttpStatusCode.NotImplemented, FailureList2<DC.LocationInventory>("You must specify a locationcode or productcode filter."), LowerCaseJsonMediaTypeFormatter.Default);
            }

            return this.Request.CreateResponse(HttpStatusCode.OK, List2<DC.LocationInventory>(inventories.Items, (int)inventories.TotalCount), LowerCaseJsonMediaTypeFormatter.Default);
        }

        [HttpPostRoute(UriTemplate = "create")]
        public async Task<HttpResponseMessage> Create(List<DC.LocationInventory> locationInventories)
        {
            var tasks = new List<Task<ServiceClientResponse<List<DC.LocationInventory>>>>();
            locationInventories.GroupBy(li => li.LocationCode).Each(locationCodeGroup => {
                tasks.Add( _locationInventoryClient.AddLocationInventory( locationCodeGroup.ToList(), locationCodeGroup.Key ) );
            });

            await Task.WhenAll(tasks);

            var returnedInventories = tasks.SelectMany(t => t.Result.ReadAsSync()).ToList();

            return this.Request.CreateResponse(HttpStatusCode.OK, List2(returnedInventories), LowerCaseJsonMediaTypeFormatter.Default);
        }

    }
}
