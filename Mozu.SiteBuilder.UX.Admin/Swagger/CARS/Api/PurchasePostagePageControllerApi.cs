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
    public interface IPurchasePostagePageControllerApi
    {
        /// <summary>
        /// purchasePostage 
        /// </summary>
        /// <param name="amount"></param>
        /// <param name="carrier"></param>
        /// <param name="locationCode"></param>
        /// <param name="siteID"></param>
        /// <param name="tenantID"></param>
        /// <returns>AjaxResponse</returns>
        AjaxResponse PurchasePostageUsingPOST1 (decimal amount, string carrier, string locationCode, int? siteID, int? tenantID);
        /// <summary>
        /// purchasePostageView 
        /// </summary>
        /// <param name="amount"></param>
        /// <param name="carrier"></param>
        /// <param name="locationCode"></param>
        /// <param name="siteID"></param>
        /// <param name="tenantID"></param>
        /// <returns>string</returns>
        string PurchasePostageViewUsingGET (decimal amount, string carrier, string locationCode, int? siteID, int? tenantID);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class PurchasePostagePageControllerApi : IPurchasePostagePageControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PurchasePostagePageControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public PurchasePostagePageControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="PurchasePostagePageControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public PurchasePostagePageControllerApi(String basePath)
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
        /// purchasePostage 
        /// </summary>
        /// <param name="amount"></param>
        /// <param name="carrier"></param>
        /// <param name="locationCode"></param>
        /// <param name="siteID"></param>
        /// <param name="tenantID"></param>
        /// <returns>AjaxResponse</returns>
        public AjaxResponse PurchasePostageUsingPOST1 (decimal amount, string carrier, string locationCode, int? siteID, int? tenantID)
        {
    
            var path = "/purchasePostage";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (amount != null) queryParams.Add("amount", ApiClient.ParameterToString(amount)); // query parameter
 if (carrier != null) queryParams.Add("carrier", ApiClient.ParameterToString(carrier)); // query parameter
 if (locationCode != null) queryParams.Add("locationCode", ApiClient.ParameterToString(locationCode)); // query parameter
 if (siteID != null) queryParams.Add("siteID", ApiClient.ParameterToString(siteID)); // query parameter
 if (tenantID != null) queryParams.Add("tenantID", ApiClient.ParameterToString(tenantID)); // query parameter
                                        
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling PurchasePostageUsingPOST1: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling PurchasePostageUsingPOST1: " + response.ErrorMessage, response.ErrorMessage);
    
            return (AjaxResponse) ApiClient.Deserialize(response.Content, typeof(AjaxResponse), response.Headers);
        }
    
        /// <summary>
        /// purchasePostageView 
        /// </summary>
        /// <param name="amount"></param>
        /// <param name="carrier"></param>
        /// <param name="locationCode"></param>
        /// <param name="siteID"></param>
        /// <param name="tenantID"></param>
        /// <returns>string</returns>
        public string PurchasePostageViewUsingGET (decimal amount, string carrier, string locationCode, int? siteID, int? tenantID)
        {
    
            var path = "/purchasePostage";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (amount != null) queryParams.Add("amount", ApiClient.ParameterToString(amount)); // query parameter
 if (carrier != null) queryParams.Add("carrier", ApiClient.ParameterToString(carrier)); // query parameter
 if (locationCode != null) queryParams.Add("locationCode", ApiClient.ParameterToString(locationCode)); // query parameter
 if (siteID != null) queryParams.Add("siteID", ApiClient.ParameterToString(siteID)); // query parameter
 if (tenantID != null) queryParams.Add("tenantID", ApiClient.ParameterToString(tenantID)); // query parameter
                                        
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling PurchasePostageViewUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling PurchasePostageViewUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
    }
}
