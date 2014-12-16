using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Dependencies;

using System.Web.Routing;
using Autofac;
using Autofac.Core.Lifetime;
using Mozu.Core.Api.Client;
using Mozu.Core.Extensions;
using Mozu.ShippingRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Controllers;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Areas.Misc.Controllers;

namespace Mozu.SiteBuilder.UX.Controllers
{
    [RefreshStoreFrontUserAuthTicketFilter]
    [RequiresSiteContextRedirectFilter]
    public class BaseApiController : ApiControllerBase
    {


        public async Task<List<KeyValuePair<string, string>>> GetShippableCountries()
        {
            var shippingWebApiClient = this.Request.Resolve<IShippingWebApiClient>().CloneWithoutUserClaims();

            var result = (await (await shippingWebApiClient.GetShippableCountries().ConfigureAwait(false)).ReadAsAsync().ConfigureAwait(false)).Items;

            var res = result.Select(x => new KeyValuePair<string, string>(x.Name, x.Code)).ToList();
            if (res.Count == 0)
            {
                res.Add(new KeyValuePair<string, string>("us", "us"));
            }
            return res;
        }


        public async Task<List<KeyValuePair<string, string>>> GetBillingCountries()
        {
            var refClient = this.Request.Resolve<Mozu.Reference.Contracts.Clients.IReferenceDataWebApiClient >().CloneWithoutUserClaims();

            var result = (await refClient.GetCountries()).ReadAsSync().Items;

            var res = result.Select(x => new KeyValuePair<string, string>(x.Name, x.Code)).ToList();
            if (res.Count == 0)
            {
                res.Add(new KeyValuePair<string, string>("us", "us"));
            }
            return res;
        }

        public async Task<List<KeyValuePair<string, string>>> GetUSBillingStates()
        {
            var refClient = this.Request.Resolve<Mozu.Reference.Contracts.Clients.IReferenceDataWebApiClient>().CloneWithoutUserClaims();

            var response = (await refClient.GetCountriesWithStates()).ReadAsSync();
            var states = response.Items.Where(c => c.Code.EqualsIgnoreCase("US"))
                .SelectMany(c => c.States)
                .OrderBy(s => s.Name)
                .Select(s => new KeyValuePair<string, string>(s.Code, s.Name)).ToList();

            return states;
        }

        public async Task<List<KeyValuePair<string, string>>> GetUSShippingStates()
        {
            var shippingWebApiClient = this.Request.Resolve<IShippingWebApiClient>();

            var result = (await shippingWebApiClient.GetShippableStates()).ReadAsSync();
            var states = result.Where(c => c.Code.EqualsIgnoreCase("US"))
                .SelectMany(c => c.States)
                .OrderBy(s => s.Name)
                .Select(s => new KeyValuePair<string, string>(s.Code, s.Name)).ToList();
            return states;
        }
    }
}
