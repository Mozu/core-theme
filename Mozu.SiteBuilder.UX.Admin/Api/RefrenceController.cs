using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Core.Api.Routing;
using Mozu.Core.Extensions;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.Reference.Contracts;
using Mozu.Reference.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Tax;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/reference", SuppressDescriptorGeneration = true)]
    public class ReferenceController : BaseController
    {
         private readonly IReferenceDataWebApiClient _referenceDataWebApi;

         public ReferenceController(Mozu.Reference.Contracts.Clients.IReferenceDataWebApiClient referenceDataWebApi)
         {
             _referenceDataWebApi = referenceDataWebApi;
            
         }


		 [HttpGetRoute(UriTemplate = "states/list")]
         public async Task<Response<List<FieldData>>> GetStates([FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter, string country = "us")
         {
             country = string.IsNullOrEmpty(country) ? "us" : country;
             var res = (await _referenceDataWebApi.GetAddressSchema(country)).ReadAsSync();
             var data = res.Fields.First( x => x.Label == "State").Data;
             return List2(data);
         }

         [HttpGetRoute(UriTemplate = "countries/list")]
         public async Task<HttpResponseMessage> GetCountries([FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter)
         {
           
             var res = (await _referenceDataWebApi.GetCountries()).ReadAsSync();
          
             return this.Request.CreateResponse(HttpStatusCode.OK, List2(res.Items, (int)res.TotalCount));
           
         }

           [HttpGetRoute(UriTemplate = "locales/list")]
         public async Task<HttpResponseMessage> GetLocales([FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter)
         {
           
             var res = (await _referenceDataWebApi.GetContentLocales()).ReadAsSync();
          
             return this.Request.CreateResponse(HttpStatusCode.OK, List2(res.Items, (int)res.TotalCount));
           
         }
           [HttpGetRoute(UriTemplate = "currencies/list")]
           public async Task<HttpResponseMessage> GetCurrencies([FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter)
           {

               var res = (await _referenceDataWebApi.GetCurrencies()).ReadAsSync();

               return this.Request.CreateResponse(HttpStatusCode.OK, List2(res.Items, (int)res.TotalCount));

           }

        [HttpGetRoute(UriTemplate = "states2/list")]
        public async Task<HttpResponseMessage> GetStates2([FromUri] PagingParamaters pagingParams,
            [FromUri] FilterCollection extFilter, string country = "us")
        {
            var response = (await _referenceDataWebApi.GetCountriesWithStates()).ReadAsSync();

            var result = response.Items.Where(c => c.Code.EqualsIgnoreCase(country)).SelectMany(c => c.States).ToList();

            return this.Request.CreateResponse(HttpStatusCode.OK, List2(SortStates(result), (int) result.Count()));
        }


        List<State> SortStates(List<State> states)
        {
            var result = new List<State>();

            var armedForcesStates = states.Where(s => 
                !string.IsNullOrWhiteSpace(s.Tags) && 
                s.Tags.ToUpper().Contains("ISARMEDFORCES")).OrderBy(s => s.Name).ToList();
            
            result.AddRange(armedForcesStates);


            var otherStates = states.Where(s => 
                string.IsNullOrWhiteSpace(s.Tags) ||
                !s.Tags.ToUpper().Contains("ISARMEDFORCES")).OrderBy(s => s.Name).ToList();

            result.AddRange(otherStates);
            return result;
        }
    }
}
