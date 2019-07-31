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
    public interface IAddOrUpdateCredentialPageControllerApi
    {
        /// <summary>
        /// addOrUpdateCredential 
        /// </summary>
        /// <param name="carrier"></param>
        /// <param name="credentials"></param>
        /// <param name="locationCode"></param>
        /// <param name="siteID"></param>
        /// <param name="tenantID"></param>
        /// <returns>AjaxResponse</returns>
        AjaxResponse AddOrUpdateCredentialUsingPOST1 (string carrier, string credentials, string locationCode, int? siteID, int? tenantID);
        /// <summary>
        /// addOrUpdateCredentialView 
        /// </summary>
        /// <returns>string</returns>
        string AddOrUpdateCredentialViewUsingGET ();
        /// <summary>
        /// credentialUpload 
        /// </summary>
        /// <param name="file"></param>
        /// <returns>AjaxResponse</returns>
        AjaxResponse CredentialUploadUsingPOST (System.IO.Stream file);
        /// <summary>
        /// getCredentialValues 
        /// </summary>
        /// <param name="carrier"></param>
        /// <param name="credentials"></param>
        /// <param name="locationCode"></param>
        /// <param name="siteID"></param>
        /// <param name="tenantID"></param>
        /// <returns>Dictionary&lt;string, Dictionary&lt;string, string&gt;&gt;</returns>
        Dictionary<string, Dictionary<string, string>> GetCredentialValuesUsingGET (string carrier, string credentials, string locationCode, int? siteID, int? tenantID);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class AddOrUpdateCredentialPageControllerApi : IAddOrUpdateCredentialPageControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AddOrUpdateCredentialPageControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public AddOrUpdateCredentialPageControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="AddOrUpdateCredentialPageControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public AddOrUpdateCredentialPageControllerApi(String basePath)
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
        /// addOrUpdateCredential 
        /// </summary>
        /// <param name="carrier"></param>
        /// <param name="credentials"></param>
        /// <param name="locationCode"></param>
        /// <param name="siteID"></param>
        /// <param name="tenantID"></param>
        /// <returns>AjaxResponse</returns>
        public AjaxResponse AddOrUpdateCredentialUsingPOST1 (string carrier, string credentials, string locationCode, int? siteID, int? tenantID)
        {
    
            var path = "/addOrUpdateCredential";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (carrier != null) queryParams.Add("carrier", ApiClient.ParameterToString(carrier)); // query parameter
 if (credentials != null) queryParams.Add("credentials", ApiClient.ParameterToString(credentials)); // query parameter
 if (locationCode != null) queryParams.Add("locationCode", ApiClient.ParameterToString(locationCode)); // query parameter
 if (siteID != null) queryParams.Add("siteID", ApiClient.ParameterToString(siteID)); // query parameter
 if (tenantID != null) queryParams.Add("tenantID", ApiClient.ParameterToString(tenantID)); // query parameter
                                        
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling AddOrUpdateCredentialUsingPOST1: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling AddOrUpdateCredentialUsingPOST1: " + response.ErrorMessage, response.ErrorMessage);
    
            return (AjaxResponse) ApiClient.Deserialize(response.Content, typeof(AjaxResponse), response.Headers);
        }
    
        /// <summary>
        /// addOrUpdateCredentialView 
        /// </summary>
        /// <returns>string</returns>
        public string AddOrUpdateCredentialViewUsingGET ()
        {
    
            var path = "/addOrUpdateCredential";
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
                throw new ApiException ((int)response.StatusCode, "Error calling AddOrUpdateCredentialViewUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling AddOrUpdateCredentialViewUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
        /// <summary>
        /// credentialUpload 
        /// </summary>
        /// <param name="file"></param>
        /// <returns>AjaxResponse</returns>
        public AjaxResponse CredentialUploadUsingPOST (System.IO.Stream file)
        {
            // verify the required parameter 'file' is set
            if (file == null) throw new ApiException(400, "Missing required parameter 'file' when calling CredentialUploadUsingPOST");
    
            var path = "/addOrUpdateCredential/upload";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                                    if (file != null) fileParams.Add("file", ApiClient.ParameterToFile("file", file));
                
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling CredentialUploadUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling CredentialUploadUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (AjaxResponse) ApiClient.Deserialize(response.Content, typeof(AjaxResponse), response.Headers);
        }
    
        /// <summary>
        /// getCredentialValues 
        /// </summary>
        /// <param name="carrier"></param>
        /// <param name="credentials"></param>
        /// <param name="locationCode"></param>
        /// <param name="siteID"></param>
        /// <param name="tenantID"></param>
        /// <returns>Dictionary&lt;string, Dictionary&lt;string, string&gt;&gt;</returns>
        public Dictionary<string, Dictionary<string, string>> GetCredentialValuesUsingGET (string carrier, string credentials, string locationCode, int? siteID, int? tenantID)
        {
    
            var path = "/credentialValues";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (carrier != null) queryParams.Add("carrier", ApiClient.ParameterToString(carrier)); // query parameter
 if (credentials != null) queryParams.Add("credentials", ApiClient.ParameterToString(credentials)); // query parameter
 if (locationCode != null) queryParams.Add("locationCode", ApiClient.ParameterToString(locationCode)); // query parameter
 if (siteID != null) queryParams.Add("siteID", ApiClient.ParameterToString(siteID)); // query parameter
 if (tenantID != null) queryParams.Add("tenantID", ApiClient.ParameterToString(tenantID)); // query parameter
                                        
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetCredentialValuesUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetCredentialValuesUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Dictionary<string, Dictionary<string, string>>) ApiClient.Deserialize(response.Content, typeof(Dictionary<string, Dictionary<string, string>>), response.Headers);
        }
    
    }
}
