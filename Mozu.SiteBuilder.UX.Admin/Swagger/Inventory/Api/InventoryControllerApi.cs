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
    public interface IInventoryControllerApi
    {
        /// <summary>
        ///  Aggregates Inventory
        /// </summary>
        /// <param name="body">Request to aggregate inventory</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="xVolSite">Site ID</param>
        /// <returns>List&lt;AggregateResponse&gt;</returns>
        List<AggregateResponse> Aggregate (AggregateRequest body, int? xVolTenant, int? xVolSite);
        /// <summary>
        ///  Get inventory from specified location
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="type">Type of request enum</param>
        /// <param name="xVolSite">Site ID</param>
        /// <param name="items">List of Items to search on</param>
        /// <param name="requestLocation">Location for Request</param>
        /// <param name="locationWhitelist">List of location codes that are allowed to be included in results</param>
        /// <param name="locationBlacklist">List of location codes that are NOT allowed to be included in results</param>
        /// <param name="limit">The maximum number of results to return, defaults to 100 for most</param>
        /// <param name="ignoreSafetyStock">Whether to ignore the safety stock buffer put in place</param>
        /// <param name="includeNegativeInventory">Whether to allow items with negative inventory in the results</param>
        /// <param name="shippingLocation">Whether to limit results to locations that are shipping enabled</param>
        /// <param name="transferEnabled">Filter results by locations that have transfer enabled (true) or don&#x27;t (false)</param>
        /// <param name="pickup">Filter results by locations that are pickup-enabled (true) or not (false)</param>
        /// <param name="includeInAggregate">Filter results by locations that have aggregate export enabled (true) or don&#x27;t (false)</param>
        /// <param name="includeAttributes">Flag to include attributes or not</param>
        /// <returns>List&lt;InventoryResponse&gt;</returns>
        List<InventoryResponse> GetInventory (int? xVolTenant, string type, int? xVolSite, List<ItemQuantity> items, RequestLocation requestLocation, List<string> locationWhitelist, List<string> locationBlacklist, int? limit, bool? ignoreSafetyStock, bool? includeNegativeInventory, bool? shippingLocation, bool? transferEnabled, bool? pickup, bool? includeInAggregate, bool? includeAttributes);
        /// <summary>
        ///  Queries for specified inventory at given location
        /// </summary>
        /// <param name="body">Request to get inventory</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="xVolSite">Site ID</param>
        /// <returns>List&lt;InventoryResponse&gt;</returns>
        List<InventoryResponse> PostQueryInventory (InventoryRequest body, int? xVolTenant, int? xVolSite);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class InventoryControllerApi : IInventoryControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="InventoryControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public InventoryControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="InventoryControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public InventoryControllerApi(string basePath)
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
        ///  Aggregates Inventory
        /// </summary>
        /// <param name="body">Request to aggregate inventory</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="xVolSite">Site ID</param>
        /// <returns>List&lt;AggregateResponse&gt;</returns>
        public List<AggregateResponse> Aggregate (AggregateRequest body, int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling Aggregate");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling Aggregate");
    
            var path = "/v5/inventory/aggregate/";
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
                throw new ApiException ((int)response.StatusCode, "Error calling Aggregate: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling Aggregate: " + response.ErrorMessage, response.ErrorMessage);
    
            return (List<AggregateResponse>) ApiClient.Deserialize(response.Content, typeof(List<AggregateResponse>), response.Headers);
        }
    
        /// <summary>
        ///  Get inventory from specified location
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="type">Type of request enum</param>
        /// <param name="xVolSite">Site ID</param>
        /// <param name="items">List of Items to search on</param>
        /// <param name="requestLocation">Location for Request</param>
        /// <param name="locationWhitelist">List of location codes that are allowed to be included in results</param>
        /// <param name="locationBlacklist">List of location codes that are NOT allowed to be included in results</param>
        /// <param name="limit">The maximum number of results to return, defaults to 100 for most</param>
        /// <param name="ignoreSafetyStock">Whether to ignore the safety stock buffer put in place</param>
        /// <param name="includeNegativeInventory">Whether to allow items with negative inventory in the results</param>
        /// <param name="shippingLocation">Whether to limit results to locations that are shipping enabled</param>
        /// <param name="transferEnabled">Filter results by locations that have transfer enabled (true) or don&#x27;t (false)</param>
        /// <param name="pickup">Filter results by locations that are pickup-enabled (true) or not (false)</param>
        /// <param name="includeInAggregate">Filter results by locations that have aggregate export enabled (true) or don&#x27;t (false)</param>
        /// <param name="includeAttributes">Flag to include attributes or not</param>
        /// <returns>List&lt;InventoryResponse&gt;</returns>
        public List<InventoryResponse> GetInventory (int? xVolTenant, string type, int? xVolSite, List<ItemQuantity> items, RequestLocation requestLocation, List<string> locationWhitelist, List<string> locationBlacklist, int? limit, bool? ignoreSafetyStock, bool? includeNegativeInventory, bool? shippingLocation, bool? transferEnabled, bool? pickup, bool? includeInAggregate, bool? includeAttributes)
        {
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling GetInventory");
            // verify the required parameter 'type' is set
            if (type == null) throw new ApiException(400, "Missing required parameter 'type' when calling GetInventory");
    
            var path = "/v5/inventory/";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;
    
             if (type != null) queryParams.Add("type", ApiClient.ParameterToString(type)); // query parameter
 if (items != null) queryParams.Add("items", ApiClient.ParameterToString(items)); // query parameter
 if (requestLocation != null) queryParams.Add("requestLocation", ApiClient.ParameterToString(requestLocation)); // query parameter
 if (locationWhitelist != null) queryParams.Add("locationWhitelist", ApiClient.ParameterToString(locationWhitelist)); // query parameter
 if (locationBlacklist != null) queryParams.Add("locationBlacklist", ApiClient.ParameterToString(locationBlacklist)); // query parameter
 if (limit != null) queryParams.Add("limit", ApiClient.ParameterToString(limit)); // query parameter
 if (ignoreSafetyStock != null) queryParams.Add("ignoreSafetyStock", ApiClient.ParameterToString(ignoreSafetyStock)); // query parameter
 if (includeNegativeInventory != null) queryParams.Add("includeNegativeInventory", ApiClient.ParameterToString(includeNegativeInventory)); // query parameter
 if (shippingLocation != null) queryParams.Add("shippingLocation", ApiClient.ParameterToString(shippingLocation)); // query parameter
 if (transferEnabled != null) queryParams.Add("transferEnabled", ApiClient.ParameterToString(transferEnabled)); // query parameter
 if (pickup != null) queryParams.Add("pickup", ApiClient.ParameterToString(pickup)); // query parameter
 if (includeInAggregate != null) queryParams.Add("includeInAggregate", ApiClient.ParameterToString(includeInAggregate)); // query parameter
 if (includeAttributes != null) queryParams.Add("includeAttributes", ApiClient.ParameterToString(includeAttributes)); // query parameter
             if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
 if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter

            // authentication setting, if any
            string[] authSettings = new string[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetInventory: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetInventory: " + response.ErrorMessage, response.ErrorMessage);
    
            return (List<InventoryResponse>) ApiClient.Deserialize(response.Content, typeof(List<InventoryResponse>), response.Headers);
        }
    
        /// <summary>
        ///  Queries for specified inventory at given location
        /// </summary>
        /// <param name="body">Request to get inventory</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="xVolSite">Site ID</param>
        /// <returns>List&lt;InventoryResponse&gt;</returns>
        public List<InventoryResponse> PostQueryInventory (InventoryRequest body, int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling PostQueryInventory");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling PostQueryInventory");
    
            var path = "/v5/inventory/";
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
                throw new ApiException ((int)response.StatusCode, "Error calling PostQueryInventory: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling PostQueryInventory: " + response.ErrorMessage, response.ErrorMessage);
    
            return (List<InventoryResponse>) ApiClient.Deserialize(response.Content, typeof(List<InventoryResponse>), response.Headers);
        }
    
    }
}
