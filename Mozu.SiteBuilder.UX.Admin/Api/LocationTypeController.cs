using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.Location.Contracts.Clients;
using DC = Mozu.Location.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/locationtype", SuppressDescriptorGeneration = true)]
    public class LocationTypeController : BaseController
    {
        private ILocationTypeWebApiClient _locationTypeWebApiClient;

        /// <summary>
        /// Constructor.
        /// </summary>
        public LocationTypeController(ILocationTypeWebApiClient locationTypeWebApiClient)
        {
            _locationTypeWebApiClient = locationTypeWebApiClient;
        }

        [HttpPostRoute(UriTemplate = "list")]
        public async Task<Response<List<DC.LocationType>>> GetLocationTypes()
        {
            var resp = (await _locationTypeWebApiClient.GetLocationTypes()).ReadAsSync();
            return List2(resp);
        }


        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<DC.LocationType>> AddLocationType(DC.LocationType lt)
        {
            var resp = (await _locationTypeWebApiClient.AddLocationType(lt)).ReadAsSync();
            return Single2(resp);
        }
    }
}
