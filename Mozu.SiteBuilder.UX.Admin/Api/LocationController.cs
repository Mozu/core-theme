using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc.Extensions;
using DC = Mozu.Location.Contracts;
using Mozu.Location.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using AutoMapper;
using System.Net.Http;
using System.Net;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/location", SuppressDescriptorGeneration = true)]
    public class LocationController : BaseController
    {
        private ILocationAdminWebApiClient _locationWebApiClient;
        private ILocationTypeWebApiClient _locationTypeWebApiClient;

        /// <summary>
        /// Constructor.
        /// </summary>
        public LocationController(ILocationAdminWebApiClient locationWebApiClient, ILocationTypeWebApiClient locationTypeWebApiClient)
        {
            _locationWebApiClient = locationWebApiClient;
            _locationTypeWebApiClient = locationTypeWebApiClient;
        }


        [HttpGetRoute(UriTemplate = "list")]
        public async Task<HttpResponseMessage> GetLocations()
        {
            var locations = (await _locationWebApiClient.GetLocations()).ReadAsSync();

            return this.Request.CreateResponse(HttpStatusCode.OK, List2(locations.Items, (int)locations.TotalCount), LowerCaseJsonMediaTypeFormatter.Default);
        }


        [HttpPostRoute(UriTemplate = "create")]
        public async Task<HttpResponseMessage> AddLocationType(DC.Location l)
        {
            var resp = (await _locationWebApiClient.AddLocation(l)).ReadAsSync();
            return this.Request.CreateResponse(HttpStatusCode.OK, Single2(resp), LowerCaseJsonMediaTypeFormatter.Default);
        }


        [HttpPostRoute(UriTemplate = "edit")]
        public async Task<HttpResponseMessage> EditLocationType(DC.Location l)
        {
            var resp = (await _locationWebApiClient.UpdateLocation(l.Code, l)).ReadAsSync();
            return this.Request.CreateResponse(HttpStatusCode.OK, Single2(resp), LowerCaseJsonMediaTypeFormatter.Default);
        }
    }
}
