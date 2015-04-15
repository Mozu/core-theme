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

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/ipblocking", SuppressDescriptorGeneration = true)]
    public class IpBlockingController : BaseController
    {
        private readonly ITenantsWebApiClient _tenantsWebApiClient;

        public IpBlockingController(Mozu.Tenant.Contracts.Clients.ITenantsWebApiClient tenantsWebApiClient)
        {
            _tenantsWebApiClient = tenantsWebApiClient;
        }

        //
        // GET: /IpBlocking/

        [HttpGetRoute(UriTemplate = "read")]
        public async Task<IpBlocking> getIPBlockingData()
        {
            var model = new IpBlocking();

            model.IsEnabled = true;
            model.IpAddress = GetIPAddress(Request);
            // need task to retrieve data
            return model;
        }

        [HttpPostRoute(UriTemplate = "update")]
        public async Task<List<IpBlocking>> updateIPBlockingData(List<IpBlocking> data)
        {
            var model = data[0];
            // need task to retrieve data  
            return new List<IpBlocking>();
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
                    if (IPAddress.TryParse(ipStr, out ipaddress) && ipaddress.AddressFamily != AddressFamily.InterNetworkV6)
                    {
                        ipstring = ipStr;
                    }

                }

            }

            return ipstring;
        }
    }
}