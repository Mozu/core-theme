using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Mozu.Core.Api.Routing;
using Mozu.ProductAdmin.Contracts.Clients;
using System.ServiceModel.Web;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using System.Net.Http;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Tax;
using AutoMapper;
using Mozu.SiteSettings.General.Contracts.Clients;
using DC = Mozu.SiteSettings.General.Contracts;
using System.ServiceModel;
using Mozu.SiteBuilder.UX.Admin.Helpers;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/tax", SuppressDescriptorGeneration = true)]
    public class TaxController : BaseController
    {
        
        private readonly IGeneralSettingsWebApiClient _generalSettingsWebApiClient;
        private readonly CollectionTaskUnMapper<TaxRate, DC.TaxableTerritory> _taxMapper = new CollectionTaskUnMapper<TaxRate, DC.TaxableTerritory>();

        public TaxController(Mozu.SiteSettings.General.Contracts.Clients.IGeneralSettingsWebApiClient  generalSettingsWebApiClient)
        {
            
            _generalSettingsWebApiClient = generalSettingsWebApiClient;
        }

		[HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<TaxRate>>> Create(List<TaxRate> taxRates)
        {

            IEnumerable<TaxRate> results = await _taxMapper.PerformAction(taxRates, t => _generalSettingsWebApiClient.AddTaxableTerritory( t));

            return List2(results.ToList());
        }

		[HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<List<TaxRate>>> Edit(List<TaxRate> taxRates)
        {
            var dcTaxes = Mapper.Map<List<DC.TaxableTerritory>>(taxRates);
            var retDcTaxes = (await _generalSettingsWebApiClient.UpdateTaxableTerritories(dcTaxes)).ReadAsSync();
            var retTaxes = Mapper.Map<List<TaxRate>>(retDcTaxes);


            return List2(retTaxes);
        }

		[HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<TaxRate>> Delete(List<TaxRate> vms)
        {
            IEnumerable<TaxRate> results = await _taxMapper.PerformAction(vms, t => _generalSettingsWebApiClient.RemoveTaxableTerritory(t.CountryCode, t.StateOrProvinceCode));

            return SuccessWithTotal2<TaxRate>(results.Count());
        }

		[HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<TaxRate>>> GetTaxRates([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            var res = (await _generalSettingsWebApiClient.GetTaxableTerritories());
            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                var taxRates = Mapper.Map<List<TaxRate>>(res.ReadAsSync ());

                return List2(taxRates);
            }
            return EmptyList2 < TaxRate>();

        }
    }
}