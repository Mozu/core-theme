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
    public interface IModifyInventoryControllerApi
    {
        /// <summary>
        ///  Adjust Inventory
        /// </summary>
        /// <param name="body">Request to adjust inventory</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>int?</returns>
        int? Adjust (AdjustRequest body, int? xVolTenant);
        /// <summary>
        ///  Delete Inventory
        /// </summary>
        /// <param name="body">Request to delete item(s)</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="xVolSite">Site ID</param>
        /// <returns>DeleteItemResponse</returns>
        DeleteItemResponse Delete (DeleteItemRequest body, int? xVolTenant, int? xVolSite);
        /// <summary>
        ///  Refresh Inventory
        /// </summary>
        /// <param name="body">Request to refresh inventory</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>int?</returns>
        int? Refresh (RefreshRequest body, int? xVolTenant);
        /// <summary>
        ///  Adjust Inventory - synchronous
        /// </summary>
        /// <param name="body">Request to adjust inventory</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>List&lt;InventoryResponse&gt;</returns>
        List<InventoryResponse> SyncAdjust (AdjustRequest body, int? xVolTenant);
        /// <summary>
        ///  Refresh Inventory - synchronous
        /// </summary>
        /// <param name="body">Request to refresh inventory</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>List&lt;InventoryResponse&gt;</returns>
        List<InventoryResponse> SyncRefresh (RefreshRequest body, int? xVolTenant);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class ModifyInventoryControllerApi : IModifyInventoryControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ModifyInventoryControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public ModifyInventoryControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="ModifyInventoryControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public ModifyInventoryControllerApi(string basePath)
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
        ///  Adjust Inventory
        /// </summary>
        /// <param name="body">Request to adjust inventory</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>int?</returns>
        public int? Adjust (AdjustRequest body, int? xVolTenant)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling Adjust");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling Adjust");
    
            var path = "/v5/inventory/adjust/";
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
                throw new ApiException ((int)response.StatusCode, "Error calling Adjust: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling Adjust: " + response.ErrorMessage, response.ErrorMessage);
    
            return (int?) ApiClient.Deserialize(response.Content, typeof(int?), response.Headers);
        }
    
        /// <summary>
        ///  Delete Inventory
        /// </summary>
        /// <param name="body">Request to delete item(s)</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="xVolSite">Site ID</param>
        /// <returns>DeleteItemResponse</returns>
        public DeleteItemResponse Delete (DeleteItemRequest body, int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling Delete");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling Delete");
    
            var path = "/v5/inventory/delete/";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;
    
                         if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
 if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter

            // authentication setting, if any
            string[] authSettings = new string[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling Delete: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling Delete: " + response.ErrorMessage, response.ErrorMessage);
    
            return (DeleteItemResponse) ApiClient.Deserialize(response.Content, typeof(DeleteItemResponse), response.Headers);
        }
    
        /// <summary>
        ///  Refresh Inventory
        /// </summary>
        /// <param name="body">Request to refresh inventory</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>int?</returns>
        public int? Refresh (RefreshRequest body, int? xVolTenant)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling Refresh");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling Refresh");
    
            var path = "/v5/inventory/refresh/";
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
                throw new ApiException ((int)response.StatusCode, "Error calling Refresh: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling Refresh: " + response.ErrorMessage, response.ErrorMessage);
    
            return (int?) ApiClient.Deserialize(response.Content, typeof(int?), response.Headers);
        }
    
        /// <summary>
        ///  Adjust Inventory - synchronous
        /// </summary>
        /// <param name="body">Request to adjust inventory</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>List&lt;InventoryResponse&gt;</returns>
        public List<InventoryResponse> SyncAdjust (AdjustRequest body, int? xVolTenant)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling SyncAdjust");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling SyncAdjust");
    
            var path = "/v5/inventory/sync-adjust/";
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
                throw new ApiException ((int)response.StatusCode, "Error calling SyncAdjust: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling SyncAdjust: " + response.ErrorMessage, response.ErrorMessage);
    
            return (List<InventoryResponse>) ApiClient.Deserialize(response.Content, typeof(List<InventoryResponse>), response.Headers);
        }
    
        /// <summary>
        ///  Refresh Inventory - synchronous
        /// </summary>
        /// <param name="body">Request to refresh inventory</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>List&lt;InventoryResponse&gt;</returns>
        public List<InventoryResponse> SyncRefresh (RefreshRequest body, int? xVolTenant)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling SyncRefresh");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling SyncRefresh");
    
            var path = "/v5/inventory/sync-refresh/";
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
                throw new ApiException ((int)response.StatusCode, "Error calling SyncRefresh: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling SyncRefresh: " + response.ErrorMessage, response.ErrorMessage);
    
            return (List<InventoryResponse>) ApiClient.Deserialize(response.Content, typeof(List<InventoryResponse>), response.Headers);
        }
    
    }
}
