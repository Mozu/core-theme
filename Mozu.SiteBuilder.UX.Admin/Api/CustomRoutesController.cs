using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using AutoMapper;
using FiftyOne.Foundation.Mobile.Detection.Matchers;
using Mozu.Core.Api.Routing;
using Mozu.Core.Extensions;
using Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Mozu.Tenant.Contracts.Clients;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using FluentValidation;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/customroutes", SuppressDescriptorGeneration = true)]
    public class CustomRoutesController : BaseController
    {
        readonly IGeneralSettingsWebApiClient _genSettingsClient;
        readonly IValidator<CustomRouteSettings> _routeValidator;

        public CustomRoutesController(IGeneralSettingsWebApiClient genSettingsClient, IValidator<CustomRouteSettings> routeValidator)
        {
            _genSettingsClient = genSettingsClient;
            _routeValidator = routeValidator;
        }

        [HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<CustomRouteSettings>> Get()
        {
            var routes = (await _genSettingsClient.GetCustomRouteSettings().ConfigureAwait(false)).ReadAsSync();
            return Single2(routes);
        }

        [HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<CustomRouteSettings>> Edit(CustomRouteSettings settings)
        {
            await _routeValidator.ValidateAndThrowAsync(settings);
            var updated = (await _genSettingsClient.UpdateCustomRouteSettings(settings).ConfigureAwait(false)).ReadAsSync();
            return Single2(updated);
        }

        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<HttpResponseMessage> Delete()
        {
            var deleted = (await _genSettingsClient.DeleteCustomRouteSettings().ConfigureAwait(false)).ReadAsSync();
            return Request.CreateResponse(HttpStatusCode.NoContent);
        }
    }
}
