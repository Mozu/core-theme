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
using Mozu.SiteBuilder.UX.Models.Settings;
using Mozu.SiteBuilder.Mvc.Settings;
using System.Net.Sockets;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.SiteSettings.General.Contracts;
using Mozu.Core;
using Mozu.Core.Settings;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Client;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/ipblocking", SuppressDescriptorGeneration = true)]
    public class IpBlockingController : BaseController
    {
        private readonly ITenantsWebApiClient _tenantsWebApiClient;
        private readonly IGeneralSettingsWebApiClient _siteSettingsApiClient;
        private readonly IApiContext _apiContext;

        public IpBlockingController(Mozu.Tenant.Contracts.Clients.ITenantsWebApiClient tenantsWebApiClient, IGeneralSettingsWebApiClient siteSettingsApiClient, IApiContext apiContext)
        {
            _tenantsWebApiClient = tenantsWebApiClient;
            _siteSettingsApiClient = siteSettingsApiClient;
            _apiContext = apiContext;
        }

        //
        // GET: /IpBlocking/

        [HttpGetRoute(UriTemplate = "read")]
        public async Task<IpBlockingSettings> getIPBlockingData()
        {
            var resp = (await _siteSettingsApiClient.GetIPBlockSettings()).ReadAsSync();
            var model = resp != null ? Mapper.Map<IpBlockingSettings>(resp) : new IpBlockingSettings();

            model.IpAddress = GetIPAddress(Request);

            return model;
        }

        [HttpPostRoute(UriTemplate = "update")]
        public async Task<IPBlockSettings> updateIPBlockingData(List<IpBlockingSettings> data)
        {
            
            var model = new IPBlockSettings();
            model.Enabled = data[0].Enabled;

            var resp = (await _siteSettingsApiClient.UpdateIPBlockSettings(model)).ReadAsSync();

            return resp;
        }

        [HttpGetRoute(UriTemplate = "export")]
        public async Task<HttpResponseMessage> exportIpAddresses()
        {
            HttpResponseMessage response = new HttpResponseMessage();
 
            var file = (await _siteSettingsApiClient.ExportIpBlocks()).ResponseMessage.Content;

            response.Content = file;

            return response;
        }

        [HttpPostRoute(UriTemplate = "import")]
        public async Task<HttpResponseMessage> importIpAddresses()
        {
            var file = await Request.Content.ReadAsStreamAsync();
            var serviceResponse = (await _siteSettingsApiClient.ImportIpBlocks(file)).ResponseMessage;
            var response = new HttpResponseMessage();

            if (serviceResponse.IsSuccessStatusCode)
            {
                response.StatusCode = HttpStatusCode.OK;
            }
            else
            {
                response.StatusCode = HttpStatusCode.Conflict;
            }

            response.Content = serviceResponse.Content;

            return response;
        }

        private static string GetIPAddress(HttpRequestMessage request)
        {
            string ipstring = "Ip Address could not be determined";

            if (request.Properties.ContainsKey("MS_HttpContext"))
            {
                var ctx = request.Properties["MS_HttpContext"] as HttpContextWrapper;

                if (ctx != null)
                {
                    var ipStr = ctx.Request.Headers["X-Forwarded-For"] ?? ctx.Request.UserHostAddress;
                    IPAddress ipaddress;
                    if (IPAddress.TryParse(ipStr, out ipaddress))
                    {
                        ipstring = ipStr;
                    }
                }
            }

            return ipstring;
        }
    }
}