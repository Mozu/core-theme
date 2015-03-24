using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using Mozu.Core.Exceptions;
using Newtonsoft.Json;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Routing;
using Mozu.Location.Contracts.Clients;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;
using Mozu.SiteBuilder.UX.Admin.Helpers.LocationInventoryHelpers;
using DC = Mozu.ProductAdmin.Contracts;
using DCloc = Mozu.Location.Contracts;
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
        private readonly IProductAvailableInventoryHelper _productAvailableInventoryHelper;
        private readonly ILocationSettingsWebApiClient _locationSettingsWebApiClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public LocationInventoryController(ILocationInventoryWebApiClient locationInventoryClient, IProductWebApiClient productInventoryClient, 
            ILocationAdminWebApiClient locationWebApiClient, ILocationSettingsWebApiClient locationSettingsWebApiClient, IProductAvailableInventoryHelper productAvailableInventoryHelper)
        {
            _locationInventoryClient = locationInventoryClient;
            _productClient = productInventoryClient;
            _locationWebApiClient = locationWebApiClient;
            _locationSettingsWebApiClient = locationSettingsWebApiClient;
            _productAvailableInventoryHelper = productAvailableInventoryHelper;
        }

        /// <summary>
        /// Monkey patch LocationName into LocationInventory (the by-product lookup needs it).
        /// </summary>
        public class SuperchargedLocationInventory : DC.LocationInventory
        {
            [JsonProperty(PropertyName = "locationName")]
            public string LocationName { get; set; }

            public SuperchargedLocationInventory(DC.LocationInventory locbase, string locationName)
            {
                // use some automapper magic.
                Mapper.DynamicMap<DC.LocationInventory, SuperchargedLocationInventory>(locbase, this);
                this.LocationName = locationName;
            }
        }

		[HttpGetRoute(UriTemplate = "list")]
        public async Task<HttpResponseMessage> List([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            DC.LocationInventoryCollection inventories = null;
            if (extFilter.ContainsProperty("locationcode") && extFilter.ContainsProperty("productcode"))
            {
                var inventoryResp = await _locationInventoryClient.GetLocationInventory(extFilter.PopValue<string>("locationcode"), extFilter.PopValue<string>("productcode"));

                // handle 404 by returning an empty list
                if (inventoryResp.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
                    return this.Request.CreateResponse(HttpStatusCode.OK, EmptyList2<DC.LocationInventory>());

                return this.Request.CreateResponse(HttpStatusCode.OK, List2<DC.LocationInventory>(inventoryResp.ReadAsSync()));
            }
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
                string locationFilter = String.Join(" or ", locationCodes.Select(lc => "code eq \"" + lc + "\""));
                locationFilter += " and (isDisabled eq true or isDisabled ne true)";
                var locations = (await _locationWebApiClient.GetLocations(filter: locationFilter)).ReadAsSync().Items;
                inventories.Items =
                    (from i in inventories.Items
                     let loc = locations.First(l => l.Code.Equals(i.LocationCode, StringComparison.OrdinalIgnoreCase))
                     select new SuperchargedLocationInventory(i, loc.Name)
                    ).ToList<DC.LocationInventory>();
            }
            else
            {
                return this.Request.CreateResponse(HttpStatusCode.NotImplemented, FailureList2<DC.LocationInventory>("You must specify a locationcode or productcode filter."));
            }

            return this.Request.CreateResponse(HttpStatusCode.OK, List2<DC.LocationInventory>(inventories.Items, (int)inventories.TotalCount));
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

            return this.Request.CreateResponse(HttpStatusCode.OK, List2(returnedInventories));
        }

        [HttpPostRoute(UriTemplate = "edit")]
        public async Task<HttpResponseMessage> Edit(List<DC.LocationInventory> locationInventories)
        {
            var tasks = new List<Task<ServiceClientResponse<List<DC.LocationInventory>>>>();

            locationInventories.GroupBy(li => li.LocationCode).Each(locationCodeGroup =>
            {
                var adjustments = 
                    (from li in locationCodeGroup
                     select new DC.LocationInventoryAdjustment { 
                         LocationCode = li.LocationCode, 
                         ProductCode = li.ProductCode, 
                         Type = DC.LocationInventoryAdjustment.TypeConst.Absolute, 
                         Value = li.StockOnHand.GetValueOrDefault(0) 
                     }).ToList();
                tasks.Add( _locationInventoryClient.UpdateLocationInventory( adjustments, locationCodeGroup.Key ) );
            });

            await Task.WhenAll(tasks);

            var returnedInventories = tasks.SelectMany(t => t.Result.ReadAsSync()).ToList();

            return this.Request.CreateResponse(HttpStatusCode.OK, List2(returnedInventories));
        }

        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<List<DC.LocationInventory>>> Delete(List<DC.LocationInventory> locationInventories)
        {
            var tasks = locationInventories.Select(li => _locationInventoryClient.DeleteLocationInventory(li.LocationCode, li.ProductCode) );
        
            await Task.WhenAll(tasks);

            return SuccessWithTotal2<List<DC.LocationInventory>>(locationInventories.Count);
        }

        /// <summary>
        /// For a single productCode, merge the LocationInventory list returned by ProductAdmin with the Location information returned by Location.
        /// </summary>
        [HttpGetRoute(UriTemplate = "forproduct")]
        public async Task<Response<List<LocationWithInventory>>> GetLocationsForProduct([FromUri]PagingParamaters pagingParams,
            [FromUri]FilterCollection extFilter, string productCode = null, string variationProductCode = null)
        {
            productCode = productCode ?? extFilter.PopValue<string>("productcode");
            if (String.IsNullOrEmpty(productCode)) {
                throw new HttpResponseException( this.Request.CreateErrorResponse(HttpStatusCode.NotFound, "Missing product code."));
            }

            var product = (await _productClient.GetProduct(productCode)).ReadAsSync();
            if (product == null)
                throw new VaeItemNotFoundException(string.Format("Could not find product code {0}", productCode));

            if (product.FulfillmentTypesSupported.Contains("Digital"))
            {
                return CreateVirtualDigitalLocationWithInventory(product);
            }

            DC.ProductVariation variation = null;
            if (!String.IsNullOrEmpty(variationProductCode)) {
                // we can't look up a variation by its variation product code. we need the variation KEY. Which is used by nobody else ever.
                // so fuck it, let's just get all the variations and filter for the one we want.
                var allTheVariations = (await _productClient.GetProductVariations(productCode)).ReadAsSync().Items;
                variation = allTheVariations.First(v => v.VariationProductCode == variationProductCode);
            }

            if (variation != null && (variation.FulfillmentTypesSupported == null || variation.FulfillmentTypesSupported.Length == 0))
            {
                variation.FulfillmentTypesSupported = product.FulfillmentTypesSupported;
            }

            List<LocationWithInventory> result = product.InventoryInfo.ManageStock.GetValueOrDefault(false) && 
                //todo:not this.
                product.ProductUsage != "Bundle"
                ? await GetManagedInventory(pagingParams, extFilter, product, variation)
                : await GetUnmanagedInventory(product, variation);

            var siteShippingLocationCode = await GetDefaultDirectShipLocation();

            // filter out directship options that are not from our site's DS location.
            result =
                result.Where(lwi => lwi.Fulfillment.Code != "DS" || lwi.LocationCode == siteShippingLocationCode)
                    .ToList();
            return List2(result);
            
        }

        private Response<List<LocationWithInventory>> CreateVirtualDigitalLocationWithInventory(DC.Product product)
        {
            return List2(new List<LocationWithInventory>
            {
                new LocationWithInventory
                {
                    Fulfillment = FulfillmentTypeConstants.DigitalFulfillmentType,
                    Location = new DCloc.Location
                    {
                        Code = "Digital",
                        LocationTypes = new List<DCloc.LocationType>{ new DCloc.LocationType{Code = "DS", Name = "Digital"}},
                        FulfillmentTypes =
                            new List<DCloc.FulfillmentType> {FulfillmentTypeConstants.DigitalFulfillmentType}
                            
                                
                    },
                    ProductCode = product.ProductCode,
                    ProductName = product.Content.ProductName,
                    LocationCode = "Digital",
                    StockAvailable = 0
                }
            });
        }

        private async Task<List<LocationWithInventory>> GetManagedInventory(PagingParamaters pagingParams, FilterCollection extFilter, DC.Product product, DC.ProductVariation variation)
        {
            string prodOrVariantCode = variation != null ? variation.VariationProductCode : product.ProductCode;
            
            var filterString = extFilter.ToFilterString();
            var inventories =
                (await
                    _productClient.GetLocationInventories(productCode: prodOrVariantCode, startIndex: pagingParams.startIndex,
                        pageSize: pagingParams.pageSize, sortBy: null, filter: filterString)).ReadAsSync();

            var locationLookupTasks =
                inventories.Items.Select(i => i.LocationCode)
                    .Distinct()
                    .Select(lc => _locationWebApiClient.GetLocation(lc))
                    .ToList();
            await Task.WhenAll(locationLookupTasks);
            var locations = locationLookupTasks.Select(t => t.Result.ReadAsSync()).ToList();

            return  _productAvailableInventoryHelper.GetShipAndPickupLocationsWithInventory(inventories, locations, product, variation);
        }
        
        private async Task<List<LocationWithInventory>> GetUnmanagedInventory(DC.Product product, DC.ProductVariation variation)
        {
            var locations = (await _locationWebApiClient.GetLocations()).ReadAsSync();
            return _productAvailableInventoryHelper.GetAllShipAndPickupLocationsForUnmanagedProducts(locations.Items, product, variation);
        }

        private async Task<string> GetDefaultDirectShipLocation()
        {
            var locSettingsRes = (await _locationSettingsWebApiClient.GetLocationUsages()).ReadAsSync();
            var siteShippingLocationCode =
                locSettingsRes.Items.Where(x => x.LocationUsageTypeCode == "DS")
                    .Select(x => x.LocationCodes != null && x.LocationCodes.Count > 0 ? x.LocationCodes.First() : null)
                    .FirstOrDefault();
            return siteShippingLocationCode;
        }


        /// <summary>
        /// For a single productCode, Merge the LocationInventory list returned by ProductAdmin with the Location information returned by Location and filter for locations that support in-store pickup.
        /// </summary>
        [HttpGetRoute(UriTemplate = "pickup")]
        public async Task<Response<List<LocationWithInventory>>> GetLocationsForPickup([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter, string productCode = null)
        {
            var locationsWithInventoryResponse = await GetLocationsForProduct(pagingParams, extFilter, productCode);
            var locationsWithInventory = locationsWithInventoryResponse.Items;

            // filter for location type pickup
            return List2(locationsWithInventory.Where(lwi => lwi.Location.FulfillmentTypes.Any(ft => ft.Code == "SP")).ToList());
        }
    }

    /// <summary>
    /// Mozu.Location does not have a constant for these, so this is temporary.
    /// </summary>
    public class FulfillmentTypeConstants
    {
        public static readonly string DirectShipCode = "DS";
        public static readonly string InStorePickupCode = "SP";
        public static readonly string DigitalCode = "DG";

        public static readonly DCloc.FulfillmentType DirectShip = new DCloc.FulfillmentType { Code = DirectShipCode, Name = "Direct Ship" };
        public static readonly DCloc.FulfillmentType InStorePickup = new DCloc.FulfillmentType { Code = InStorePickupCode, Name = "In Store Pickup" };
        public static readonly DCloc.FulfillmentType DigitalFulfillmentType = new DCloc.FulfillmentType { Code = DigitalCode, Name = "Digital" };
    }
}
