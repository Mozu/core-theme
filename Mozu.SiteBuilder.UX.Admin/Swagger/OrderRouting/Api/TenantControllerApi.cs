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
    public interface ITenantControllerApi
    {
        /// <summary>
        /// cloneTenantData 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>Tenant</returns>
        Tenant CloneTenantDataUsingPOST (CloneTenantRequest body);
        /// <summary>
        /// cloneTenantData 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>Tenant</returns>
        Tenant CloneTenantDataUsingPOST1 (CloneTenantRequest body);
        /// <summary>
        /// createTenant 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>Tenant</returns>
        Tenant CreateTenantUsingPOST (CreateTenantRequest body);
        /// <summary>
        /// createTenant 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>Tenant</returns>
        Tenant CreateTenantUsingPOST1 (CreateTenantRequest body);
        /// <summary>
        /// deleteTenantData 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>Tenant</returns>
        Tenant DeleteTenantDataUsingDELETE2 (DeleteTenantRequest body);
        /// <summary>
        /// deleteTenantData 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>Tenant</returns>
        Tenant DeleteTenantDataUsingDELETE3 (DeleteTenantRequest body);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class TenantControllerApi : ITenantControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="TenantControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public TenantControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="TenantControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public TenantControllerApi(String basePath)
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
        /// cloneTenantData 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>Tenant</returns>
        public Tenant CloneTenantDataUsingPOST (CloneTenantRequest body)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling CloneTenantDataUsingPOST");
    
            var path = "/api/v1/tenant/clone";
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
                throw new ApiException ((int)response.StatusCode, "Error calling CloneTenantDataUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling CloneTenantDataUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Tenant) ApiClient.Deserialize(response.Content, typeof(Tenant), response.Headers);
        }
    
        /// <summary>
        /// cloneTenantData 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>Tenant</returns>
        public Tenant CloneTenantDataUsingPOST1 (CloneTenantRequest body)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling CloneTenantDataUsingPOST1");
    
            var path = "/api/v1/tenant/clone/";
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
                throw new ApiException ((int)response.StatusCode, "Error calling CloneTenantDataUsingPOST1: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling CloneTenantDataUsingPOST1: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Tenant) ApiClient.Deserialize(response.Content, typeof(Tenant), response.Headers);
        }
    
        /// <summary>
        /// createTenant 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>Tenant</returns>
        public Tenant CreateTenantUsingPOST (CreateTenantRequest body)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling CreateTenantUsingPOST");
    
            var path = "/api/v1/tenant";
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
                throw new ApiException ((int)response.StatusCode, "Error calling CreateTenantUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling CreateTenantUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Tenant) ApiClient.Deserialize(response.Content, typeof(Tenant), response.Headers);
        }
    
        /// <summary>
        /// createTenant 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>Tenant</returns>
        public Tenant CreateTenantUsingPOST1 (CreateTenantRequest body)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling CreateTenantUsingPOST1");
    
            var path = "/api/v1/tenant/";
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
                throw new ApiException ((int)response.StatusCode, "Error calling CreateTenantUsingPOST1: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling CreateTenantUsingPOST1: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Tenant) ApiClient.Deserialize(response.Content, typeof(Tenant), response.Headers);
        }
    
        /// <summary>
        /// deleteTenantData 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>Tenant</returns>
        public Tenant DeleteTenantDataUsingDELETE2 (DeleteTenantRequest body)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling DeleteTenantDataUsingDELETE2");
    
            var path = "/api/v1/tenant";
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
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteTenantDataUsingDELETE2: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteTenantDataUsingDELETE2: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Tenant) ApiClient.Deserialize(response.Content, typeof(Tenant), response.Headers);
        }
    
        /// <summary>
        /// deleteTenantData 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>Tenant</returns>
        public Tenant DeleteTenantDataUsingDELETE3 (DeleteTenantRequest body)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling DeleteTenantDataUsingDELETE3");
    
            var path = "/api/v1/tenant/";
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
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteTenantDataUsingDELETE3: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteTenantDataUsingDELETE3: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Tenant) ApiClient.Deserialize(response.Content, typeof(Tenant), response.Headers);
        }
    
    }
}
