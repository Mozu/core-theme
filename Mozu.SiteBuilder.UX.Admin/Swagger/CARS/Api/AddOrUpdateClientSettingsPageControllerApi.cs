using System;
using System.Collections.Generic;
using RestSharp;
using Mozu.Swagger.Client;
using Mozu.CARS.Contracts.Model;

namespace Mozu.CARS.Contracts.Api
{
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public interface IAddOrUpdateClientSettingsPageControllerApi
    {
        /// <summary>
        /// addOrUpdateClientSettings 
        /// </summary>
        /// <param name="locationCode"></param>
        /// <param name="settings"></param>
        /// <param name="tenantID"></param>
        /// <returns>AjaxResponse</returns>
        AjaxResponse AddOrUpdateClientSettingsUsingPOST (string locationCode, string settings, int? tenantID);
        /// <summary>
        /// addOrUpdateClientSettingsView 
        /// </summary>
        /// <returns>string</returns>
        string AddOrUpdateClientSettingsViewUsingGET ();
        /// <summary>
        /// getClientSettings 
        /// </summary>
        /// <param name="locationCode"></param>
        /// <param name="settings"></param>
        /// <param name="tenantID"></param>
        /// <returns>Dictionary&lt;string, Dictionary&lt;string, string&gt;&gt;</returns>
        Dictionary<string, Dictionary<string, string>> GetClientSettingsUsingGET (string locationCode, string settings, int? tenantID);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class AddOrUpdateClientSettingsPageControllerApi : IAddOrUpdateClientSettingsPageControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AddOrUpdateClientSettingsPageControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public AddOrUpdateClientSettingsPageControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="AddOrUpdateClientSettingsPageControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public AddOrUpdateClientSettingsPageControllerApi(String basePath)
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
        /// addOrUpdateClientSettings 
        /// </summary>
        /// <param name="locationCode"></param>
        /// <param name="settings"></param>
        /// <param name="tenantID"></param>
        /// <returns>AjaxResponse</returns>
        public AjaxResponse AddOrUpdateClientSettingsUsingPOST (string locationCode, string settings, int? tenantID)
        {
    
            var path = "/addOrUpdateClientSettings";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (locationCode != null) queryParams.Add("locationCode", ApiClient.ParameterToString(locationCode)); // query parameter
 if (settings != null) queryParams.Add("settings", ApiClient.ParameterToString(settings)); // query parameter
 if (tenantID != null) queryParams.Add("tenantID", ApiClient.ParameterToString(tenantID)); // query parameter
                                        
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling AddOrUpdateClientSettingsUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling AddOrUpdateClientSettingsUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (AjaxResponse) ApiClient.Deserialize(response.Content, typeof(AjaxResponse), response.Headers);
        }
    
        /// <summary>
        /// addOrUpdateClientSettingsView 
        /// </summary>
        /// <returns>string</returns>
        public string AddOrUpdateClientSettingsViewUsingGET ()
        {
    
            var path = "/addOrUpdateClientSettings";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                                                    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling AddOrUpdateClientSettingsViewUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling AddOrUpdateClientSettingsViewUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
        /// <summary>
        /// getClientSettings 
        /// </summary>
        /// <param name="locationCode"></param>
        /// <param name="settings"></param>
        /// <param name="tenantID"></param>
        /// <returns>Dictionary&lt;string, Dictionary&lt;string, string&gt;&gt;</returns>
        public Dictionary<string, Dictionary<string, string>> GetClientSettingsUsingGET (string locationCode, string settings, int? tenantID)
        {
    
            var path = "/clientSettings";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (locationCode != null) queryParams.Add("locationCode", ApiClient.ParameterToString(locationCode)); // query parameter
 if (settings != null) queryParams.Add("settings", ApiClient.ParameterToString(settings)); // query parameter
 if (tenantID != null) queryParams.Add("tenantID", ApiClient.ParameterToString(tenantID)); // query parameter
                                        
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetClientSettingsUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetClientSettingsUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Dictionary<string, Dictionary<string, string>>) ApiClient.Deserialize(response.Content, typeof(Dictionary<string, Dictionary<string, string>>), response.Headers);
        }
    
    }
}
