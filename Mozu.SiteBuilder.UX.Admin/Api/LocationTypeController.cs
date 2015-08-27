using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.Location.Contracts.Clients;
using DC = Mozu.Location.Contracts;
using System.Net.Http;
using System.Net;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;

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

        [HttpGetRoute(UriTemplate = "list")]
        public async Task<HttpResponseMessage> GetLocationTypes()
        {
            var resp = (await _locationTypeWebApiClient.GetLocationTypes()).ReadAsSync();

            return this.Request.CreateResponse(HttpStatusCode.OK, List2(resp));
        }

        [HttpPostRoute(UriTemplate = "create")]
        public async Task<HttpResponseMessage> AddLocationType(DC.LocationType lt)
        {
            var resp = (await _locationTypeWebApiClient.AddLocationType(lt)).ReadAsSync();

            return this.Request.CreateResponse(HttpStatusCode.OK, Single2(resp));
        }

        [HttpPostRoute(UriTemplate = "edit")]
        public async Task<HttpResponseMessage> EditLocationType(DC.LocationType lt)
        {
            var resp = (await _locationTypeWebApiClient.UpdateLocationType(lt.Code, lt)).ReadAsSync();
            return this.Request.CreateResponse(HttpStatusCode.OK, Single2(resp));
        }
    }
}
