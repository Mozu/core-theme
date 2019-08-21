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
    public interface IAllocationControllerApi
    {
        /// <summary>
        ///  Allocates inventory based on the given request
        /// </summary>
        /// <param name="body">Request to allocate inventory</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>JobQueueResponse</returns>
        JobQueueResponse AllocateInventory (AllocateInventoryRequest body, int? xVolTenant);
        /// <summary>
        ///  Deallocates inventory based on the given request
        /// </summary>
        /// <param name="body">Request to allocate inventory</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>BaseResponse</returns>
        BaseResponse DeallocateInventory (AllocateInventoryRequest body, int? xVolTenant);
        /// <summary>
        ///  Fulfills inventory based on the given request
        /// </summary>
        /// <param name="body">Request to allocate inventory</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>BaseResponse</returns>
        BaseResponse FulfillInventory (AllocateInventoryRequest body, int? xVolTenant);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class AllocationControllerApi : IAllocationControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AllocationControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public AllocationControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="AllocationControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public AllocationControllerApi(string basePath)
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
        ///  Allocates inventory based on the given request
        /// </summary>
        /// <param name="body">Request to allocate inventory</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>JobQueueResponse</returns>
        public JobQueueResponse AllocateInventory (AllocateInventoryRequest body, int? xVolTenant)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling AllocateInventory");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling AllocateInventory");
    
            var path = "/v5/inventory/allocate/";
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
                throw new ApiException ((int)response.StatusCode, "Error calling AllocateInventory: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling AllocateInventory: " + response.ErrorMessage, response.ErrorMessage);
    
            return (JobQueueResponse) ApiClient.Deserialize(response.Content, typeof(JobQueueResponse), response.Headers);
        }
    
        /// <summary>
        ///  Deallocates inventory based on the given request
        /// </summary>
        /// <param name="body">Request to allocate inventory</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>BaseResponse</returns>
        public BaseResponse DeallocateInventory (AllocateInventoryRequest body, int? xVolTenant)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling DeallocateInventory");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling DeallocateInventory");
    
            var path = "/v5/inventory/deallocate/";
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
                throw new ApiException ((int)response.StatusCode, "Error calling DeallocateInventory: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling DeallocateInventory: " + response.ErrorMessage, response.ErrorMessage);
    
            return (BaseResponse) ApiClient.Deserialize(response.Content, typeof(BaseResponse), response.Headers);
        }
    
        /// <summary>
        ///  Fulfills inventory based on the given request
        /// </summary>
        /// <param name="body">Request to allocate inventory</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>BaseResponse</returns>
        public BaseResponse FulfillInventory (AllocateInventoryRequest body, int? xVolTenant)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling FulfillInventory");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling FulfillInventory");
    
            var path = "/v5/inventory/fulfill/";
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
                throw new ApiException ((int)response.StatusCode, "Error calling FulfillInventory: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling FulfillInventory: " + response.ErrorMessage, response.ErrorMessage);
    
            return (BaseResponse) ApiClient.Deserialize(response.Content, typeof(BaseResponse), response.Headers);
        }
    
    }
}
