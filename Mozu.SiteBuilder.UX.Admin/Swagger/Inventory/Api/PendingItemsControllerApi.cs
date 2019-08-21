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
    public interface IPendingItemsControllerApi
    {
        /// <summary>
        ///  Delete Pending Items
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="pendingItemID">Pending Item ID</param>
        /// <returns>bool?</returns>
        bool? DeletePendingItems (int? xVolTenant, int? pendingItemID);
        /// <summary>
        ///  Get Pending Items
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="locationName">Location Name</param>
        /// <param name="locationID">Location Identifier</param>
        /// <param name="currentPage">Current display page</param>
        /// <param name="numberPerPage">Number of items shown per page</param>
        /// <param name="sortBy">Field to sort by (enum &#x3D; {&#x27;QUANTITY&#x27;, &#x27;FROM&#x27;, &#x27;TO&#x27;, &#x27;TYPE&#x27;, &#x27;ORDER_ID&#x27;, &#x27;WEIGHT&#x27;})</param>
        /// <param name="shipmentID">Shipment ID</param>
        /// <returns>GetPendingItemsResponse</returns>
        GetPendingItemsResponse GetPendingItems (int? xVolTenant, string locationName, int? locationID, int? currentPage, int? numberPerPage, string sortBy, int? shipmentID);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class PendingItemsControllerApi : IPendingItemsControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PendingItemsControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public PendingItemsControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="PendingItemsControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public PendingItemsControllerApi(string basePath)
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
        ///  Delete Pending Items
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="pendingItemID">Pending Item ID</param>
        /// <returns>bool?</returns>
        public bool? DeletePendingItems (int? xVolTenant, int? pendingItemID)
        {
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling DeletePendingItems");
            // verify the required parameter 'pendingItemID' is set
            if (pendingItemID == null) throw new ApiException(400, "Missing required parameter 'pendingItemID' when calling DeletePendingItems");
    
            var path = "/v1/pendingItem/{pendingItemID}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "pendingItemID" + "}", ApiClient.ParameterToString(pendingItemID));
    
            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;
    
                         if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter

            // authentication setting, if any
            string[] authSettings = new string[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.DELETE, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling DeletePendingItems: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling DeletePendingItems: " + response.ErrorMessage, response.ErrorMessage);
    
            return (bool?) ApiClient.Deserialize(response.Content, typeof(bool?), response.Headers);
        }
    
        /// <summary>
        ///  Get Pending Items
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="locationName">Location Name</param>
        /// <param name="locationID">Location Identifier</param>
        /// <param name="currentPage">Current display page</param>
        /// <param name="numberPerPage">Number of items shown per page</param>
        /// <param name="sortBy">Field to sort by (enum &#x3D; {&#x27;QUANTITY&#x27;, &#x27;FROM&#x27;, &#x27;TO&#x27;, &#x27;TYPE&#x27;, &#x27;ORDER_ID&#x27;, &#x27;WEIGHT&#x27;})</param>
        /// <param name="shipmentID">Shipment ID</param>
        /// <returns>GetPendingItemsResponse</returns>
        public GetPendingItemsResponse GetPendingItems (int? xVolTenant, string locationName, int? locationID, int? currentPage, int? numberPerPage, string sortBy, int? shipmentID)
        {
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling GetPendingItems");
    
            var path = "/v1/pendingItem/";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;
    
             if (locationName != null) queryParams.Add("locationName", ApiClient.ParameterToString(locationName)); // query parameter
 if (locationID != null) queryParams.Add("locationID", ApiClient.ParameterToString(locationID)); // query parameter
 if (currentPage != null) queryParams.Add("currentPage", ApiClient.ParameterToString(currentPage)); // query parameter
 if (numberPerPage != null) queryParams.Add("numberPerPage", ApiClient.ParameterToString(numberPerPage)); // query parameter
 if (sortBy != null) queryParams.Add("sortBy", ApiClient.ParameterToString(sortBy)); // query parameter
 if (shipmentID != null) queryParams.Add("shipmentID", ApiClient.ParameterToString(shipmentID)); // query parameter
             if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter

            // authentication setting, if any
            string[] authSettings = new string[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetPendingItems: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetPendingItems: " + response.ErrorMessage, response.ErrorMessage);
    
            return (GetPendingItemsResponse) ApiClient.Deserialize(response.Content, typeof(GetPendingItemsResponse), response.Headers);
        }
    
    }
}
