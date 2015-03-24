using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Core.Api.Routing;
using Mozu.Location.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Helpers.LocationHelpers;
using DC = Mozu.Location.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/location", SuppressDescriptorGeneration = true)]
    public class LocationController : BaseController
    {
        private ILocationAdminWebApiClient _locationWebApiClient;

        /// <summary>
        /// Constructor.
        /// </summary>
        public LocationController(ILocationAdminWebApiClient locationWebApiClient)
        {
            _locationWebApiClient = locationWebApiClient;
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
                string filter = extFilter.ToFilterString();
                //string sort = pagingParams.sort.ToSortString();
                locations = (await _locationWebApiClient.GetLocations(startIndex: pagingParams.startIndex, pageSize: pagingParams.pageSize, filter: filter)).ReadAsSync();
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
            
            var resp = (await _locationWebApiClient.UpdateLocation(loc.Code, loc)).ReadAsSync();
            EnsureLocationContract(resp);
            return this.Request.CreateResponse(HttpStatusCode.OK, Single2(resp));
        }

        /// <summary>
        /// Ensures that RegularHours is initialized with a default value on the location.
        /// This allows the json serializer to output the right json structure.
        /// </summary>
        /// <param name="loc"></param>
        private void EnsureLocationContract(DC.Location loc) {
            if (loc.RegularHours == null)
            {
                loc.RegularHours = new DC.RegularHours {
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
