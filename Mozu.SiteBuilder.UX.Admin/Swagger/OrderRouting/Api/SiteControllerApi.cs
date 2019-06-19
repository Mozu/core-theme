using System;
using System.Collections.Generic;
using RestSharp;
using IO.Swagger.Client;
using IO.Swagger.Model;

namespace IO.Swagger.Api
{
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public interface ISiteControllerApi
    {
        /// <summary>
        /// createSite 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>Site</returns>
        Site CreateSiteUsingPOST (CreateSiteRequest body);
        /// <summary>
        /// createSite 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>Site</returns>
        Site CreateSiteUsingPOST1 (CreateSiteRequest body);
        /// <summary>
        /// deleteTenantData 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>Site</returns>
        Site DeleteTenantDataUsingDELETE (DeleteSiteRequest body);
        /// <summary>
        /// deleteTenantData 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>Site</returns>
        Site DeleteTenantDataUsingDELETE1 (DeleteSiteRequest body);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class SiteControllerApi : ISiteControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="SiteControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public SiteControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="SiteControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public SiteControllerApi(String basePath)
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
        /// createSite 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>Site</returns>
        public Site CreateSiteUsingPOST (CreateSiteRequest body)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling CreateSiteUsingPOST");
    
            var path = "/api/v1/site";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                                                postBody = ApiClient.Serialize(body); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling CreateSiteUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling CreateSiteUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Site) ApiClient.Deserialize(response.Content, typeof(Site), response.Headers);
        }
    
        /// <summary>
        /// createSite 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>Site</returns>
        public Site CreateSiteUsingPOST1 (CreateSiteRequest body)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling CreateSiteUsingPOST1");
    
            var path = "/api/v1/site/";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                                                postBody = ApiClient.Serialize(body); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling CreateSiteUsingPOST1: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling CreateSiteUsingPOST1: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Site) ApiClient.Deserialize(response.Content, typeof(Site), response.Headers);
        }
    
        /// <summary>
        /// deleteTenantData 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>Site</returns>
        public Site DeleteTenantDataUsingDELETE (DeleteSiteRequest body)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling DeleteTenantDataUsingDELETE");
    
            var path = "/api/v1/site";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                                                postBody = ApiClient.Serialize(body); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.DELETE, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteTenantDataUsingDELETE: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteTenantDataUsingDELETE: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Site) ApiClient.Deserialize(response.Content, typeof(Site), response.Headers);
        }
    
        /// <summary>
        /// deleteTenantData 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>Site</returns>
        public Site DeleteTenantDataUsingDELETE1 (DeleteSiteRequest body)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling DeleteTenantDataUsingDELETE1");
    
            var path = "/api/v1/site/";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                                                postBody = ApiClient.Serialize(body); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.DELETE, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteTenantDataUsingDELETE1: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteTenantDataUsingDELETE1: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Site) ApiClient.Deserialize(response.Content, typeof(Site), response.Headers);
        }
    
    }
}
