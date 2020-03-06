using AutoMapper;
using Mozu.Core.Api.Routing;
using Mozu.ShippingAdmin.Contracts.Carriers;
using Mozu.ShippingAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Core.Api.Client.Exceptions;
using Mozu.Core.Exceptions;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/carriers/credentials", SuppressDescriptorGeneration = true)]
    public class CarrierCredentialsController : BaseController
    {
        private readonly ICarrierCredentialWebApiClient _carrierCredentialWebApiClient;

        public CarrierCredentialsController(ICarrierCredentialWebApiClient carrierCredentialWebApiClient)
        {
            _carrierCredentialWebApiClient = carrierCredentialWebApiClient;
        }
        [HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<List<CarrierCredentialSet>>> GetCarrierCredentials(string locationGroupCode = null, int? siteId = null, string locationCode = null)
        {

            var carrierCredentials = (await _carrierCredentialWebApiClient.GetCarrierCredentials(startIndex: 0,
                 pageSize: 900)).ReadAsSync();
            var getCarrierCreditalData = carrierCredentials.Items.Where(a => a.SiteId == siteId && a.LocationCode == locationCode && a.LocationGroupCode == locationGroupCode).Select(a => a.CredentialSet).ToList();



            return List2(getCarrierCreditalData);
        }

        [HttpPostRoute(UriTemplate = "update")]
        public async Task<Response<CarrierCredential>> UpdateCarrierCredential([FromBody]CarrierCredential carrierCredential)
        {
            var itemOut = (await _carrierCredentialWebApiClient.UpdateCarrierCredential(carrierCredential.CarrierId, carrierCredential, carrierCredential.SiteId, carrierCredential.LocationGroupCode, carrierCredential.LocationCode)).ReadAsSync();
            return Single2(itemOut);
        }

        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<CarrierCredential>> CreateCarrierCredential([FromBody]CarrierCredential carrierCredential)
        {
            var itemOut = (await _carrierCredentialWebApiClient.CreateCarrierCredential(carrierCredential.CarrierId, carrierCredential)).ReadAsSync();
            return Single2(itemOut);
        }

        // credset
        // code == null
        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<CarrierCredential>> DeleteCarrierCredential([FromBody]CarrierCredential carrierCredential)
        {
            var result = await _carrierCredentialWebApiClient.DeleteCarrierCredential(carrierCredential.CarrierId, carrierCredential.SiteId, carrierCredential.LocationGroupCode, carrierCredential.LocationCode);

            if (!result.ResponseMessage.IsSuccessStatusCode)
            {
                //Not sure if this is good...
                throw result.ReadException();
            }

            return Single2(carrierCredential);
        }

        [HttpPostRoute(UriTemplate = "save/carrierCredential")]
        public async Task<Response<CarrierCredential>> SaveCarrierCredential([FromBody]CarrierCredential carrierCredential)
        {
            CarrierCredential respCarrierCreds = null;
            var response = await _carrierCredentialWebApiClient.GetCarrierCredential(carrierCredential.CarrierId, carrierCredential.SiteId, carrierCredential.LocationGroupCode, carrierCredential.LocationCode);
            if (response.HasException)
            {
                bool throwException = true;
                var remoteException = response.ReadException();
                if (remoteException is ApiWebClientException apiWebClientException)
                {
                    if (apiWebClientException.ApplicationError.HttpStatusCodeToReturn == HttpStatusCode.NotFound)
                    {
                        throwException = false;
                    }

                }
                if (throwException)
                {
                    throw remoteException;
                }
            }
            else
            {
                respCarrierCreds = response.ReadAsSync();
            }


            if (respCarrierCreds != null)
            {
                if (carrierCredential.CredentialSet == null || carrierCredential.CredentialSet.Code == null || carrierCredential.CredentialSet.Code == "0")
                {
                    var deleteResult = (await DeleteCarrierCredential(carrierCredential));
                    return deleteResult;
                }

                var updateResult = (await UpdateCarrierCredential(carrierCredential));
                return updateResult;
            }

            var createResult = (await CreateCarrierCredential(carrierCredential));
            return createResult;
        }

        [HttpPostRoute(UriTemplate = "save")]
        public async Task<Response<CarrierCredential>> SaveCarrierCredentials([FromBody]List<CarrierCredential> carrierCredentials)
        {
            try
            {
                var saveTaks = carrierCredentials.Select(carrier => SaveCarrierCredential(carrier));
                await Task.WhenAll(saveTaks);
            }
            catch (Exception e)
            {
                return Message3<CarrierCredential>(false, e.Message);
            }

            return Message3<CarrierCredential>(false, "Save Success");
        }
    }
}