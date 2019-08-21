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
    public interface IOrderItemControllerApi
    {
        /// <summary>
        ///  Get Order Item Information
        /// </summary>
        /// <param name="body">Request to retrieve order item information</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>List&lt;OrderItemInformation&gt;</returns>
        List<OrderItemInformation> GetOrderItemInformation (OrderItemInformationRequest body, int? xVolTenant);
        /// <summary>
        ///  Get Order Item Log
        /// </summary>
        /// <param name="body">Request to retrieve order item log(s)</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>List&lt;OrderItemLogResponse&gt;</returns>
        List<OrderItemLogResponse> GetOrderItemLog (OrderItemLogRequest body, int? xVolTenant);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class OrderItemControllerApi : IOrderItemControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="OrderItemControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public OrderItemControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="OrderItemControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public OrderItemControllerApi(string basePath)
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
        ///  Get Order Item Information
        /// </summary>
        /// <param name="body">Request to retrieve order item information</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>List&lt;OrderItemInformation&gt;</returns>
        public List<OrderItemInformation> GetOrderItemInformation (OrderItemInformationRequest body, int? xVolTenant)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling GetOrderItemInformation");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling GetOrderItemInformation");
    
            var path = "/v5/inventory/getOrderItemInformation/";
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetOrderItemInformation: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetOrderItemInformation: " + response.ErrorMessage, response.ErrorMessage);
    
            return (List<OrderItemInformation>) ApiClient.Deserialize(response.Content, typeof(List<OrderItemInformation>), response.Headers);
        }
    
        /// <summary>
        ///  Get Order Item Log
        /// </summary>
        /// <param name="body">Request to retrieve order item log(s)</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>List&lt;OrderItemLogResponse&gt;</returns>
        public List<OrderItemLogResponse> GetOrderItemLog (OrderItemLogRequest body, int? xVolTenant)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling GetOrderItemLog");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling GetOrderItemLog");
    
            var path = "/v5/inventory/getOrderItemLog/";
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetOrderItemLog: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetOrderItemLog: " + response.ErrorMessage, response.ErrorMessage);
    
            return (List<OrderItemLogResponse>) ApiClient.Deserialize(response.Content, typeof(List<OrderItemLogResponse>), response.Headers);
        }
    
    }
}
