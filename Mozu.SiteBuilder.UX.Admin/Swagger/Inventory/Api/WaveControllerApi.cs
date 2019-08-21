using System;
using System.Collections.Generic;
using RestSharp;
using Mozu.Swagger.Client;
using Mozu.Inventory.Contracts.Model;

namespace Mozu.Inventory.Contracts.Api
{
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public interface IWaveControllerApi
    {
        /// <summary>
        ///  Close Pick Wave (Complete)
        /// </summary>
        /// <param name="body">Request to complete a wave</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="waveId">Wave Identifier</param>
        /// <returns>CreateWaveResponse</returns>
        CreateWaveResponse ClosePickWave (WaveCompletion body, int? xVolTenant, int? waveId);
        /// <summary>
        ///  Create Pick Wave
        /// </summary>
        /// <param name="body">Request to create a new pick wave(s)</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>CreateWaveResponse</returns>
        CreateWaveResponse CreatePickWave (CreateWaveRequest body, int? xVolTenant);
        /// <summary>
        ///  Get Open Pick Waves
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="locationId">Location Identifier</param>
        /// <returns>List&lt;Wave&gt;</returns>
        List<Wave> GetOpenPickWaves (int? xVolTenant, int? locationId);
        /// <summary>
        ///  Get Wave Details
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="waveId">Wave Identifier</param>
        /// <returns>Wave</returns>
        Wave GetWaveDetails (int? xVolTenant, int? waveId);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class WaveControllerApi : IWaveControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="WaveControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public WaveControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="WaveControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public WaveControllerApi(string basePath)
        {
            this.ApiClient = new ApiClient(basePath);
        }
    
        /// <summary>
        /// Sets the base path of the API client.
        /// </summary>
        /// <param name="basePath">The base path</param>
        /// <value>The base path</value>
        public void SetBasePath(string basePath)
        {
            this.ApiClient.BasePath = basePath;
        }
    
        /// <summary>
        /// Gets the base path of the API client.
        /// </summary>
        /// <param name="basePath">The base path</param>
        /// <value>The base path</value>
        public string GetBasePath(string basePath)
        {
            return this.ApiClient.BasePath;
        }
    
        /// <summary>
        /// Gets or sets the API client.
        /// </summary>
        /// <value>An instance of the ApiClient</value>
        public ApiClient ApiClient {get; set;}
    
        /// <summary>
        ///  Close Pick Wave (Complete)
        /// </summary>
        /// <param name="body">Request to complete a wave</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="waveId">Wave Identifier</param>
        /// <returns>CreateWaveResponse</returns>
        public CreateWaveResponse ClosePickWave (WaveCompletion body, int? xVolTenant, int? waveId)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling ClosePickWave");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling ClosePickWave");
            // verify the required parameter 'waveId' is set
            if (waveId == null) throw new ApiException(400, "Missing required parameter 'waveId' when calling ClosePickWave");
    
            var path = "/v1/wave/{wave_id}/close/";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "wave_id" + "}", ApiClient.ParameterToString(waveId));
    
            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;
    
                         if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter

            // authentication setting, if any
            string[] authSettings = new string[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling ClosePickWave: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling ClosePickWave: " + response.ErrorMessage, response.ErrorMessage);
    
            return (CreateWaveResponse) ApiClient.Deserialize(response.Content, typeof(CreateWaveResponse), response.Headers);
        }
    
        /// <summary>
        ///  Create Pick Wave
        /// </summary>
        /// <param name="body">Request to create a new pick wave(s)</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>CreateWaveResponse</returns>
        public CreateWaveResponse CreatePickWave (CreateWaveRequest body, int? xVolTenant)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling CreatePickWave");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling CreatePickWave");
    
            var path = "/v1/wave/";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;
    
                         if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter

            // authentication setting, if any
            string[] authSettings = new string[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling CreatePickWave: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling CreatePickWave: " + response.ErrorMessage, response.ErrorMessage);
    
            return (CreateWaveResponse) ApiClient.Deserialize(response.Content, typeof(CreateWaveResponse), response.Headers);
        }
    
        /// <summary>
        ///  Get Open Pick Waves
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="locationId">Location Identifier</param>
        /// <returns>List&lt;Wave&gt;</returns>
        public List<Wave> GetOpenPickWaves (int? xVolTenant, int? locationId)
        {
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling GetOpenPickWaves");
            // verify the required parameter 'locationId' is set
            if (locationId == null) throw new ApiException(400, "Missing required parameter 'locationId' when calling GetOpenPickWaves");
    
            var path = "/v1/wave/open/{location_id}/";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "location_id" + "}", ApiClient.ParameterToString(locationId));
    
            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;
    
                         if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter

            // authentication setting, if any
            string[] authSettings = new string[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetOpenPickWaves: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetOpenPickWaves: " + response.ErrorMessage, response.ErrorMessage);
    
            return (List<Wave>) ApiClient.Deserialize(response.Content, typeof(List<Wave>), response.Headers);
        }
    
        /// <summary>
        ///  Get Wave Details
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="waveId">Wave Identifier</param>
        /// <returns>Wave</returns>
        public Wave GetWaveDetails (int? xVolTenant, int? waveId)
        {
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling GetWaveDetails");
            // verify the required parameter 'waveId' is set
            if (waveId == null) throw new ApiException(400, "Missing required parameter 'waveId' when calling GetWaveDetails");
    
            var path = "/v1/wave/{wave_id}/";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "wave_id" + "}", ApiClient.ParameterToString(waveId));
    
            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;
    
                         if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter

            // authentication setting, if any
            string[] authSettings = new string[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetWaveDetails: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetWaveDetails: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Wave) ApiClient.Deserialize(response.Content, typeof(Wave), response.Headers);
        }
    
    }
}
