using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Core.Api.Routing;
using Mozu.Core.EnsureThat;
using Mozu.Location.Contracts.Clients;
using Mozu.Reference.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.PhysicalLocation;
using Mozu.SiteBuilder.UX.Admin.Helpers.LocationHelpers;
using DC = Mozu.Location.Contracts;
using System.Linq;
using Mozu.Core;
using Mozu.SiteBuilder.Mvc.SEO;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/location", SuppressDescriptorGeneration = true)]
    public class LocationController : BaseController
    {
        private readonly ILocationAdminWebApiClient _locationWebApiClient;
        private readonly IReferenceDataWebApiClient _referenceDataWebApi;
        private readonly ILocationGroupWebApiClient _locationGroupWebApiClient;
        private readonly ILocationGroupConfigurationWebApiClient _locationGroupConfigurationWebApiClient;
        private readonly IApiContext _apiContext;

        /// <summary>
        /// Constructor.
        /// </summary>
        public LocationController(ILocationAdminWebApiClient locationWebApiClient,
            IReferenceDataWebApiClient referenceDataWebApi,
            ILocationGroupWebApiClient locationGroupWebApiClient,
            ILocationGroupConfigurationWebApiClient locationGroupConfigurationWebApiClient,
            IApiContext apiContext)
        {
            _locationWebApiClient = locationWebApiClient;
            _referenceDataWebApi = referenceDataWebApi;
            _locationGroupWebApiClient = locationGroupWebApiClient;
            _locationGroupConfigurationWebApiClient = locationGroupConfigurationWebApiClient;
            _apiContext = apiContext;
        }

        [HttpGetRoute(UriTemplate = "{locationCode}/enable")]
        public async Task<HttpResponseMessage> Enable(string locationCode)
        {
            var location = (await _locationWebApiClient.GetLocation(locationCode)).ReadAsSync();
            location.IsDisabled = false;

            await _locationWebApiClient.UpdateLocation(locationCode, location).ConfigureAwait(false);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpGetRoute(UriTemplate = "{locationCode}/disable")]
        public async Task<HttpResponseMessage> Disable(string locationCode)
        {
            var location = (await _locationWebApiClient.GetLocation(locationCode)).ReadAsSync();
            location.IsDisabled = true;

            await _locationWebApiClient.UpdateLocation(locationCode, location).ConfigureAwait(false);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpGetRoute(UriTemplate = "physical")]
        public async Task<HttpResponseMessage> Physical([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            DC.LocationCollection locations = new DC.LocationCollection();
            DC.LocationCollection allCollections = new DC.LocationCollection();
            if (!String.IsNullOrEmpty(pagingParams.id))
            {
                var loc = (await _locationWebApiClient.GetLocation(pagingParams.id)).ReadAsSync();

                locations = new DC.LocationCollection { Items = new List<DC.Location> { loc }, TotalCount = 1 };
            }
            else
            {
                const string responseFields = "items(code,name,isDisabled,locationTypes(name, code),address)";
                string filter = extFilter.ToFilterString();
                string sort = (pagingParams != null && pagingParams.sort != null) ? pagingParams.sort.ToSortString() : null;

                pagingParams.pageSize = 200;

                do
                {
                    locations = (await _locationWebApiClient.GetLocations(startIndex: pagingParams.startIndex,
                        pageSize: pagingParams.pageSize,
                        sortBy: sort,
                        filter: filter,
                        responseFields: responseFields
                        )).ReadAsSync();

                    if (allCollections.Items == null)
                        allCollections.Items = locations.Items;
                    else
                        allCollections.Items.AddRange(locations.Items);
                    pagingParams.startIndex = pagingParams.startIndex + pagingParams.pageSize;
                } while (pagingParams.startIndex <= locations.PageCount);
            }

            // default RegularHours to an object for pass through.
            allCollections.Items.ForEach(EnsureLocationContract);

            List<Country> countries = new List<Country>();
            if (allCollections != null && allCollections.Items != null && allCollections.Items.Count > 0)
            {
                var countriesWithStates = (await this._referenceDataWebApi.GetCountriesWithStates()).ReadAsSync();
                allCollections.Items.ForEach((eachLocation) =>
                {
                    Country filteredCountry = countries.FirstOrDefault<Country>(eachCountry =>
                                                                                eachCountry.Code.Equals(eachLocation.Address.CountryCode) ||
                                                                                eachCountry.Name.Equals(eachLocation.Address.CountryCode));
                    if (filteredCountry == null)
                    {
                        filteredCountry = new Country();
                        filteredCountry.Code = eachLocation.Address.CountryCode;
                        filteredCountry.Name = eachLocation.Address.CountryCode;
                        filteredCountry.States = new List<State>();
                        countries.Add(filteredCountry);
                    }
                    var countryWithStates = countriesWithStates.Items.FirstOrDefault(eachCountry => eachCountry.Code == eachLocation.Address.CountryCode);
                    State filteredCountryState = filteredCountry.States.FirstOrDefault(eachState =>
                                                                                        eachState.Code == eachLocation.Address.StateOrProvince ||
                                                                                        eachState.Name == eachLocation.Address.StateOrProvince);
                    if (countryWithStates == null)
                    {
                        if (filteredCountryState == null)
                        {
                            filteredCountry.States.Add(new State
                            {
                                Name = eachLocation.Address.StateOrProvince,
                                Code = eachLocation.Address.StateOrProvince,
                                Locations = new List<DC.Location>() { eachLocation }
                            });
                        }
                        else
                            filteredCountryState.Locations.Add(eachLocation);
                    }
                    else
                    {

                        if (filteredCountryState == null)
                        {
                            var statesMatchingLocation = countryWithStates.States.FirstOrDefault(eachCountryWithState =>
                                                            eachCountryWithState.Name == eachLocation.Address.StateOrProvince ||
                                                            eachCountryWithState.Code == eachLocation.Address.StateOrProvince);

                            if (statesMatchingLocation == null)
                            {
                                filteredCountryState = new State
                                {
                                    Code = eachLocation.Address.StateOrProvince,
                                    Name = eachLocation.Address.StateOrProvince,
                                    Locations = new List<DC.Location>() { eachLocation }
                                };
                            }
                            else
                            {
                                filteredCountryState = new State
                                {
                                    Code = statesMatchingLocation.Code,
                                    Name = statesMatchingLocation.Name,
                                    Locations = new List<DC.Location>() { eachLocation }
                                };
                            }
                            filteredCountry.States.Add(filteredCountryState);
                        }
                        else
                            filteredCountryState.Locations.Add(eachLocation);
                    }
                });

            }

            return this.Request.CreateResponse(HttpStatusCode.OK, List2(countries, (int)countries.Count));
        }

        [HttpGetRoute(UriTemplate = "list")]
        public async Task<HttpResponseMessage> List([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            DC.LocationCollection locations;
            if (!String.IsNullOrEmpty(pagingParams.id))
            {
                var loc = (await _locationWebApiClient.GetLocation(pagingParams.id)).ReadAsSync();

                locations = new DC.LocationCollection { Items = new List<DC.Location> { loc }, TotalCount = 1 };
            }
            else
            {
                const string responseFields = "items(code,name,isDisabled,locationTypes(name, code),address,fulfillmentTypes(code, name)";
                if (!string.IsNullOrWhiteSpace(pagingParams.shipmentType)) 
                {
                    FilterCollectionItem filterCollectionItem = new FilterCollectionItem();
                    if (pagingParams.shipmentType == "STH")
                    {
                        filterCollectionItem.value = "DS";
                        filterCollectionItem.property = "fulfillmenttype";
                        extFilter.Add(filterCollectionItem);
                    }
                    if (pagingParams.shipmentType == "BOPIS")
                    {
                        filterCollectionItem.value = "SP";
                        filterCollectionItem.property = "fulfillmenttype";
                        extFilter.Add(filterCollectionItem);
                    }
                }
                if (!string.IsNullOrWhiteSpace(pagingParams.pickupCode))
                {
                    FilterCollectionItem filterCollectionItem = new FilterCollectionItem();
                    filterCollectionItem.value =  pagingParams.pickupCode;
                    filterCollectionItem.property = "codene";
                    extFilter.Add(filterCollectionItem);
                }
                string filter = extFilter.ToFilterString();
                string sort = (pagingParams != null && pagingParams.sort != null) ? pagingParams.sort.ToSortString() : null;

                locations = (await _locationWebApiClient.GetLocations(startIndex: pagingParams.startIndex,
                pageSize: pagingParams.pageSize,
                sortBy: sort,
                filter: filter,
                responseFields: responseFields
                )).ReadAsSync();
            }

            // default RegularHours to an object for pass through.
            locations.Items.ForEach(EnsureLocationContract);

            return this.Request.CreateResponse(HttpStatusCode.OK, List2(locations.Items, (int)locations.TotalCount));
        }

        [HttpPostRoute(UriTemplate = "create")]
        public async Task<HttpResponseMessage> Create(DC.Location l)
        {
            var resp = (await _locationWebApiClient.AddLocation(l)).ReadAsSync();
            EnsureLocationContract(resp);
            return this.Request.CreateResponse(HttpStatusCode.OK, Single2(resp));
        }


        [HttpPostRoute(UriTemplate = "edit")]
        public async Task<HttpResponseMessage> Edit(DC.Location loc)
        {
            Ensure.That(loc.Code, "location code").IsNotNullOrEmpty();
            var resp = (await _locationWebApiClient.UpdateLocation(loc.Code, loc)).ReadAsSync();
            EnsureLocationContract(resp);
            return this.Request.CreateResponse(HttpStatusCode.OK, Single2(resp));
        }

        [HttpGetRoute(UriTemplate = "groups/list")]
        public async Task<HttpResponseMessage> ListGroup([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            DC.LocationGroupCollection locationGroups;
            if (pagingParams.NumericId != null)
            {
                var group = (await _locationGroupWebApiClient.GetLocationGroup(pagingParams.NumericId)).ReadAsSync();

                locationGroups = new DC.LocationGroupCollection { Items = new List<DC.LocationGroup> { group }, TotalCount = 1 };
            }
            else
            {
                string filter = extFilter.ToFilterString();
                string sort = (pagingParams != null && pagingParams.sort != null) ? pagingParams.sort.ToSortString() : null;
                locationGroups = (await _locationGroupWebApiClient.GetLocationGroups(startIndex: pagingParams.startIndex,
                    pageSize: pagingParams.pageSize,
                    sortBy: sort,
                    filter: filter
                    )).ReadAsSync();
            }

            return this.Request.CreateResponse(HttpStatusCode.OK, List2(locationGroups.Items, (int)locationGroups.TotalCount));
        }

        [HttpPostRoute(UriTemplate = "groups/create")]
        public async Task<HttpResponseMessage> CreateGroup(DC.LocationGroup lg)
        {
            var resp = (await _locationGroupWebApiClient.AddLocationGroup(lg)).ReadAsSync();

            return this.Request.CreateResponse(HttpStatusCode.OK, Single2(resp));
        }


        [HttpPostRoute(UriTemplate = "groups/edit")]
        public async Task<HttpResponseMessage> EditGroup(DC.LocationGroup loc)
        {
            var resp = (await _locationGroupWebApiClient.UpdateLocationGroup(loc.LocationGroupId, loc)).ReadAsSync();

            return this.Request.CreateResponse(HttpStatusCode.OK, Single2(resp));
        }

        [HttpGetRoute(UriTemplate = "groups/get/{groupId}")]
        public async Task<Response<DC.LocationGroup>> GetGroup([FromUri]int groupId)
        {
            var resp = (await _locationGroupWebApiClient.GetLocationGroup(groupId)).ReadAsSync();
            return Single2(resp);
        }

        [HttpDeleteRoute(UriTemplate = "groups/delete/{groupId}")]
        public async Task<Response<DC.LocationGroup>> DeleteGroup([FromUri]int groupId)
        {
            var resp = (await _locationGroupWebApiClient.DeleteLocationGroup(groupId)).ReadAsSync();
            return Message3<DC.LocationGroup>(true, "Location Group Successfully Deleted");
        }

        [HttpGetRoute(UriTemplate = "group/configuration/{groupId}/{siteId}")]
        public async Task<Response<DC.LocationGroupConfiguration>> GetLocationGroupConfiguration([FromUri]int groupId, [FromUri]int siteId)
        {
            var client = _locationGroupConfigurationWebApiClient.CloneWithSiteId(siteId);
            var resp = (await client.GetLocationGroupConfiguration(groupId)).ReadAsSync();
            return Single2(resp);
        }

        [HttpPutRoute(UriTemplate = "group/configuration/{groupId}/{siteId}")]
        public async Task<Response<DC.LocationGroupConfiguration>> UpdateLocationGroupConfiguration([FromUri]int groupId, [FromUri]int siteId, DC.LocationGroupConfiguration config)
        {
            var client = _locationGroupConfigurationWebApiClient.CloneWithSiteId(siteId);
            var resp = (await client.SetLocationGroupConfiguration(groupId, config)).ReadAsSync();
            return Single2(resp);
        }

        /// <summary>
        /// Ensures that RegularHours is initialized with a default value on the location.
        /// This allows the json serializer to output the right json structure.
        /// </summary>
        /// <param name="loc"></param>
        private void EnsureLocationContract(DC.Location loc)
        {
            if (loc.RegularHours == null)
            {
                loc.RegularHours = new DC.RegularHours
                {
                    Monday = new DC.Hours(),
                    Tuesday = new DC.Hours(),
                    Wednesday = new DC.Hours(),
                    Thursday = new DC.Hours(),
                    Friday = new DC.Hours(),
                    Saturday = new DC.Hours(),
                    Sunday = new DC.Hours()
                };
            }
        }
    }
}
