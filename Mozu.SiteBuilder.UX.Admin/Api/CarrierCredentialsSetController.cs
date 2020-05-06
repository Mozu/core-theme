using AutoMapper;
using Mozu.Core.Api.Routing;
using Mozu.ShippingAdmin.Contracts.Carriers;
using Mozu.ShippingAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Helpers.SearchCarrierCredentialsSetHelpers;
using Mozu.SiteSettings.Shipping.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
 using DC = Mozu.ShippingAdmin.Contracts.Carriers;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/carriers/credentialsset", SuppressDescriptorGeneration = true)]
    public class CarrierCredentialsSetController : BaseController
    {
        private readonly ICarrierCredentialSetWebApiClient _carrierCredentialSetWebApiClient;

        /// <summary>
        /// Constructor.
        /// </summary>
        public CarrierCredentialsSetController(ICarrierCredentialSetWebApiClient carrierCredentialSetWebApiClient)
        {
            _carrierCredentialSetWebApiClient = carrierCredentialSetWebApiClient;
        }

        /// <summary>
        /// Returns the active Carrier Account 
        /// </summary>
        /// <returns></returns>
        [HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<List<CarrierCredentialSet>>> GetCarrierSettings([FromUri] PagingParamaters pagingParams,
            [FromUri] FilterCollection extFilter)
        {
            string filter = null;
            if (extFilter.Count > 0)
            {
                filter = extFilter.ToFilterCarrierString();
            }

            var sort = pagingParams.sort.ToSortString();
            var startIndex = pagingParams?.startIndex;
            var pageSize = pagingParams?.pageSize;
            var returnSettings = (await _carrierCredentialSetWebApiClient.GetCarrierCredentialSets
                (startIndex: startIndex,
                 pageSize: pageSize,
                 sortBy: sort,
                 filter: filter)).ReadAsSync();
            var settings = Mapper.Map<List<CarrierCredentialSet>>(returnSettings.Items);
            return List2(settings, returnSettings.TotalCount);
        }

        [HttpPostRoute(UriTemplate = "update")]
        public async Task<Response<CarrierCredentialSet>> UpdateCarrierSettings([FromBody]CarrierCredentialSet carrierCredentialSet)
        {
            var itemOut = (await _carrierCredentialSetWebApiClient.UpdateCarrierCredentialSet(carrierCredentialSet.CarrierId, carrierCredentialSet.Code, carrierCredentialSet)).ReadAsSync();
            return Single2(itemOut);
        }

        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<CarrierCredentialSet>> CreateCarrierSettings([FromBody]CarrierCredentialSet carrierCredentialset)
        {
            var itemOut = (await _carrierCredentialSetWebApiClient.CreateCarrierCredentialSet(carrierCredentialset.CarrierId, carrierCredentialset)).ReadAsSync();
            return Single2(itemOut);
        }

        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<StreamContent>> DeleteCarrierSettings(List<CarrierCredentialSet> carrierCredential)
        {
            var itemOut = (await _carrierCredentialSetWebApiClient.DeleteCarrierCredentialSet(carrierCredential.Select(a=>a.CarrierId).First(), carrierCredential.Select(a => a.Code).First())).ReadAsSync();
            return Single2(itemOut);
        }

        [HttpGetRoute(UriTemplate = "List")]
        public async Task<Response<List<CarrierCredentialSet>>> GetCarrierDropdownList([FromUri]PagingParamaters pagingParams,string query=null, string CarrierId = null)
        {
            string filter = null;

            DC.CarrierCredentialSetCollection carrierConfigurationCollection;
            if (!String.IsNullOrEmpty(pagingParams.id))
            {
                if (pagingParams.id != "0")
                {
                    var congig = (await _carrierCredentialSetWebApiClient.GetCarrierCredentialSet(CarrierId, pagingParams.id)).ReadAsSync();
                    carrierConfigurationCollection = new DC.CarrierCredentialSetCollection { Items = new List<DC.CarrierCredentialSet> { congig }, TotalCount = 1 };
                }
                else
                {
                    var defaultCarrierCredentails = getDefaultCarrierCredentails(CarrierId);
                    carrierConfigurationCollection = new DC.CarrierCredentialSetCollection { Items = new List<DC.CarrierCredentialSet> { defaultCarrierCredentails }, TotalCount = 1 };
                }

            }
            else

            {
                filter = CarrierCredentialsSetFilterBuilder.ToFilterCarriers(CarrierId, query);
                var startIndex = pagingParams?.startIndex;
                var pageSize = pagingParams?.pageSize;
               
                 carrierConfigurationCollection = (await _carrierCredentialSetWebApiClient.GetCarrierCredentialSets(startIndex: startIndex,
                       pageSize: pageSize, filter: filter)).ReadAsSync();
                var defaultCarrierCredentails = getDefaultCarrierCredentails(CarrierId);

                carrierConfigurationCollection.Items.Insert(0, defaultCarrierCredentails);
            }

           

            return List2(carrierConfigurationCollection.Items, carrierConfigurationCollection.TotalCount);
        }

        private CarrierCredentialSet getDefaultCarrierCredentails(string carrierId)
        {
            return new CarrierCredentialSet
            {
                Name = "No Carrier Credentials Selected",
                CarrierId = carrierId,
                Code = "0",
                Values = null,
            };
        }
    }


    
}


