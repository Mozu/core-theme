using System;
using System.Collections.Generic;
using RestSharp;
using Mozu.Fulfiller.Contracts.Model;
using Mozu.Swagger.Client;

namespace Mozu.Fulfiller.Contracts.Api
{
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public interface IPickWaveControllerApi
    {
        /// <summary>
        /// closePickWave 
        /// </summary>
        /// <param name="pickWaveNumber">pickWaveNumber</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfPickWave</returns>
        ResourceOfPickWave ClosePickWaveUsingPUT (int? pickWaveNumber, int? xVolTenant, int? xVolSite);
        /// <summary>
        /// createPickWave 
        /// </summary>
        /// <param name="body">createPickWaveDto</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfPickWave</returns>
        ResourceOfPickWave CreatePickWaveUsingPOST (CreatePickWave body, int? xVolTenant, int? xVolSite);
        /// <summary>
        /// getOpenPickWaves 
        /// </summary>
        /// <param name="locationCode">locationCode</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourcesOfPickWave</returns>
        ResourcesOfPickWave GetOpenPickWavesUsingGET (string locationCode, int? xVolTenant, int? xVolSite);
        /// <summary>
        /// getPickWave 
        /// </summary>
        /// <param name="pickWaveNumber">pickWaveNumber</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfPickWave</returns>
        ResourceOfPickWave GetPickWaveUsingGET (int? pickWaveNumber, int? xVolTenant, int? xVolSite);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class PickWaveControllerApi : IPickWaveControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PickWaveControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public PickWaveControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="PickWaveControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public PickWaveControllerApi(String basePath)
        {
            this.ApiClient = new ApiClient(basePath);
        }
    
        /// <summary>
        /// Sets the base path of the API client.
        /// </summary>
        /// <param name="basePath">The base path</param>
        /// <value>The base path</value>
        public void SetBasePath(String basePath)
        {
            this.ApiClient.BasePath = basePath;
        }
    
        /// <summary>
        /// Gets the base path of the API client.
        /// </summary>
        /// <param name="basePath">The base path</param>
        /// <value>The base path</value>
        public String GetBasePath(String basePath)
        {
            return this.ApiClient.BasePath;
        }
    
        /// <summary>
        /// Gets or sets the API client.
        /// </summary>
        /// <value>An instance of the ApiClient</value>
        public ApiClient ApiClient {get; set;}
    
        /// <summary>
        /// closePickWave 
        /// </summary>
        /// <param name="pickWaveNumber">pickWaveNumber</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfPickWave</returns>
        public ResourceOfPickWave ClosePickWaveUsingPUT (int? pickWaveNumber, int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'pickWaveNumber' is set
            if (pickWaveNumber == null) throw new ApiException(400, "Missing required parameter 'pickWaveNumber' when calling ClosePickWaveUsingPUT");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling ClosePickWaveUsingPUT");
    
            var path = "/pickWaves/{pickWaveNumber}/closed";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "pickWaveNumber" + "}", ApiClient.ParameterToString(pickWaveNumber));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                            
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.PUT, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling ClosePickWaveUsingPUT: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling ClosePickWaveUsingPUT: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ResourceOfPickWave) ApiClient.Deserialize(response.Content, typeof(ResourceOfPickWave), response.Headers);
        }
    
        /// <summary>
        /// createPickWave 
        /// </summary>
        /// <param name="body">createPickWaveDto</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfPickWave</returns>
        public ResourceOfPickWave CreatePickWaveUsingPOST (CreatePickWave body, int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling CreatePickWaveUsingPOST");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling CreatePickWaveUsingPOST");
    
            var path = "/pickWaves";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling CreatePickWaveUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling CreatePickWaveUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ResourceOfPickWave) ApiClient.Deserialize(response.Content, typeof(ResourceOfPickWave), response.Headers);
        }
    
        /// <summary>
        /// getOpenPickWaves 
        /// </summary>
        /// <param name="locationCode">locationCode</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourcesOfPickWave</returns>
        public ResourcesOfPickWave GetOpenPickWavesUsingGET (string locationCode, int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'locationCode' is set
            if (locationCode == null) throw new ApiException(400, "Missing required parameter 'locationCode' when calling GetOpenPickWavesUsingGET");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling GetOpenPickWavesUsingGET");
    
            var path = "/pickWaves/open/{locationCode}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "locationCode" + "}", ApiClient.ParameterToString(locationCode));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                            
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetOpenPickWavesUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetOpenPickWavesUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ResourcesOfPickWave) ApiClient.Deserialize(response.Content, typeof(ResourcesOfPickWave), response.Headers);
        }
    
        /// <summary>
        /// getPickWave 
        /// </summary>
        /// <param name="pickWaveNumber">pickWaveNumber</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfPickWave</returns>
        public ResourceOfPickWave GetPickWaveUsingGET (int? pickWaveNumber, int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'pickWaveNumber' is set
            if (pickWaveNumber == null) throw new ApiException(400, "Missing required parameter 'pickWaveNumber' when calling GetPickWaveUsingGET");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling GetPickWaveUsingGET");
    
            var path = "/pickWaves/{pickWaveNumber}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "pickWaveNumber" + "}", ApiClient.ParameterToString(pickWaveNumber));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                            
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetPickWaveUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetPickWaveUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ResourceOfPickWave) ApiClient.Deserialize(response.Content, typeof(ResourceOfPickWave), response.Headers);
        }
    
    }
}
