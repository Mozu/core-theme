using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Mozu.ProductAdmin.Contracts.Clients;
using System.ServiceModel.Web;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using System.Net.Http;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Tax;
using AutoMapper;
using DC = Mozu.ProductAdmin.Contracts;
using System.ServiceModel;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    //todo  make async

    [ServiceContract]
    public class TaxController : BaseController
    {
        ITaxRateWebApiClient _taxClient;

        public TaxController(ITaxRateWebApiClient taxClient)
        {
            _taxClient = taxClient;
        }

        [WebInvoke(UriTemplate = "/create")]
        public Task<Response<List<TaxRate>>> Create(List<TaxRate> vms)
        {
            var retList = (from vm in vms select Mapper.Map<DC.TaxRate >(vm) into dm let ret = _taxClient.AddRate (dm).Result.ReadAsSync() select ret ?? dm into ret select Mapper.Map<TaxRate >(ret)).ToList();

            return List(retList);
        }

        [WebInvoke(UriTemplate = "/edit")]
        public Task<Response<List<TaxRate>>> Edit(List<TaxRate> vms)
        {
            var retList = (from vm in vms select Mapper.Map<DC.TaxRate>(vm) into dm select _taxClient.UpdateRate (dm, dm.CountryCode , dm.StateCode ).Result.ReadAsSync() into ret select Mapper.Map<TaxRate >(ret)).ToList();

            return List(retList);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/delete")]
        public Task<Response<TaxRate>> Delete(List<TaxRate> vms)
        {
            foreach (var vm in vms)
            {
                var res = _taxClient.DeleteRate(vm.CountryCode, vm.StateCode).Result;
                if (res.HasException)
                {
                    throw res.ReadException();
                }
            }

            return SuccessWithTotal<TaxRate>(vms.Count);
        }

        [WebGet(UriTemplate = "/list")]
        public Task<Response<List<TaxRate>>> GetTaxRates(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            var res = _taxClient.FindRates(pagingParams.startIndex, pagingParams.pageSize).Result.ReadAsSync();
            var taxRates = Mapper.Map<List<TaxRate>>(res.Items);

            return List(taxRates, (int) res.TotalCount);
        }
    }
}