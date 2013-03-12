using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Mozu.ProductAdmin.Contracts.Clients;
using System.ServiceModel.Web;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using System.Net.Http;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Tax;
using AutoMapper;
using DC = Mozu.ProductAdmin.Contracts;
using System.ServiceModel;
using Mozu.SiteBuilder.UX.Admin.Helpers;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class TaxController : BaseController
    {
        ITaxRateWebApiClient _taxClient;
        private readonly CollectionTaskUnMapper<TaxRate, DC.TaxRate> _taxMapper = new CollectionTaskUnMapper<TaxRate, DC.TaxRate>();

        public TaxController(ITaxRateWebApiClient taxClient)
        {
            _taxClient = taxClient;
        }

        [WebInvoke(UriTemplate = "create")]
        public async Task<Response<List<TaxRate>>> Create(List<TaxRate> taxRates)
        {
            IEnumerable<TaxRate> results = await _taxMapper.PerformAction(taxRates, t => _taxClient.AddRate(t));

            return List2(results.ToList());
        }

        [WebInvoke(UriTemplate = "edit")]
        public async Task<Response<List<TaxRate>>> Edit(List<TaxRate> taxRates)
        {
            IEnumerable<TaxRate> results = await _taxMapper.PerformAction(taxRates, t => _taxClient.UpdateRate(t, t.CountryCode, t.StateCode));

            return List2(results.ToList());
        }

        [WebInvoke(Method = "POST", UriTemplate = "delete")]
        public async Task<Response<TaxRate>> Delete(List<TaxRate> vms)
        {
            IEnumerable<TaxRate> results = await _taxMapper.PerformAction(vms, t => _taxClient.DeleteRate(t.CountryCode, t.StateCode));

            return SuccessWithTotal2<TaxRate>(results.Count());
        }

        [WebGet(UriTemplate = "list")]
        public async Task<Response<List<TaxRate>>> GetTaxRates([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            var res = await _taxClient.GetRates(pagingParams.startIndex, pagingParams.pageSize);
            var ret = res.ReadAsSync();
            var taxRates = Mapper.Map<List<TaxRate>>(ret.Items);

            return List2(taxRates, (int) ret.TotalCount);
        }
    }
}