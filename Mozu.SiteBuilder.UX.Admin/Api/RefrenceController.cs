using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.Reference.Contracts;
using Mozu.Reference.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Tax;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
     [ServiceContract]
    public class RefrenceController : BaseController
    {
         private readonly IReferenceDataWebApiClient _referenceDataWebApi;

         public RefrenceController(Mozu.Reference.Contracts.Clients.IReferenceDataWebApiClient  referenceDataWebApi)
         {
             _referenceDataWebApi = referenceDataWebApi;
            
         }


         [WebGet(UriTemplate = "states/list?country={country}")]
         public async Task<Response<List<FieldData>>> GetTaxRates([FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter, string country = "us")
         {
             country = string.IsNullOrEmpty(country) ? "us" : country;
             var res = (await _referenceDataWebApi.GetAddressSchema(country)).ReadAsSync();
             var data = res.Fields.First( x => x.Label == "State").Data;
             return List2(data);
         }
    }
}
