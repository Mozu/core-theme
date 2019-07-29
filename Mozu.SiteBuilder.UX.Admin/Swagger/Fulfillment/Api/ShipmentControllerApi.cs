using System;
using System.Collections.Generic;
using RestSharp;
using Mozu.Swagger.Client;
using Mozu.Fulfiller.Contracts.Model;

namespace Mozu.Fulfiller.Contracts.Api
{
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public interface IShipmentControllerApi
    {
        /// <summary>
        /// backorderItems 
        /// </summary>
        /// <param name="body">backorderItemsRequestDto</param>
        /// <param name="xVolTenant"></param>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        ResourceOfShipment BackorderItemsUsingPOST (BackorderItemsRequest body, int? xVolTenant, int? shipmentNumber, int? xVolSite);
        /// <summary>
        /// backorderShipment 
        /// </summary>
        /// <param name="body">backorderShipmentRequestDto</param>
        /// <param name="xVolTenant"></param>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        ResourceOfShipment BackorderShipmentUsingPUT (BackorderShipmentRequest body, int? xVolTenant, int? shipmentNumber, int? xVolSite);
        /// <summary>
        /// cancelShipment 
        /// </summary>
        /// <param name="body">cancelShipment</param>
        /// <param name="xVolTenant"></param>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolSite"></param>
        /// <returns></returns>
        void CancelShipmentUsingPUT (CancelShipment body, int? xVolTenant, int? shipmentNumber, int? xVolSite);
        /// <summary>
        /// canceledItems 
        /// </summary>
        /// <param name="body">canceledItemDtos</param>
        /// <param name="xVolTenant"></param>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        ResourceOfShipment CanceledItemsUsingPOST (List<CanceledItem> body, int? xVolTenant, int? shipmentNumber, int? xVolSite);
        /// <summary>
        /// deleteShipment 
        /// </summary>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns></returns>
        void DeleteShipmentUsingDELETE (int? shipmentNumber, int? xVolTenant, int? xVolSite);
        /// <summary>
        /// execute 
        /// </summary>
        /// <param name="body">taskBody</param>
        /// <param name="xVolTenant"></param>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="taskId">taskId</param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        ResourceOfShipment ExecuteUsingPUT (Dictionary<string, Object> body, int? xVolTenant, int? shipmentNumber, string taskId, int? xVolSite);
        /// <summary>
        /// fulfillShipment 
        /// </summary>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns></returns>
        void FulfillShipmentUsingPUT (int? shipmentNumber, int? xVolTenant, int? xVolSite);
        /// <summary>
        /// getShipment 
        /// </summary>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolTenant"></param>
        /// <param name="fields">fields</param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        ResourceOfShipment GetShipmentUsingGET (int? shipmentNumber, int? xVolTenant, string fields, int? xVolSite);
        /// <summary>
        /// getShipments 
        /// </summary>
        /// <param name="xVolTenant"></param>
        /// <param name="fields"></param>
        /// <param name="filter"></param>
        /// <param name="isLate"></param>
        /// <param name="page"></param>
        /// <param name="pageSize"></param>
        /// <param name="quickSearch"></param>
        /// <param name="sort"></param>
        /// <param name="xVolSite"></param>
        /// <returns>PagedResourcesOfResourceOfShipment</returns>
        PagedResourcesOfResourceOfShipment GetShipmentsUsingGET (int? xVolTenant, string fields, string filter, bool? isLate, int? page, int? pageSize, string quickSearch, string sort, int? xVolSite);
        /// <summary>
        /// getTasks 
        /// </summary>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourcesOfTask</returns>
        ResourcesOfTask GetTasksUsingGET (int? shipmentNumber, int? xVolTenant, int? xVolSite);
        /// <summary>
        /// newShipment 
        /// </summary>
        /// <param name="body">newShipment</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        ResourceOfShipment NewShipmentUsingPOST (Shipment body, int? xVolTenant, int? xVolSite);
        /// <summary>
        /// newShipment 
        /// </summary>
        /// <param name="body">newShipment</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        ResourceOfShipment NewShipmentUsingPOST1 (Shipment body, int? xVolTenant, int? xVolSite);
        /// <summary>
        /// reassignItems 
        /// </summary>
        /// <param name="body">reassignItemDtos</param>
        /// <param name="xVolTenant"></param>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        ResourceOfShipment ReassignItemsUsingPOST (List<ReassignItem> body, int? xVolTenant, int? shipmentNumber, int? xVolSite);
        /// <summary>
        /// reassignShipment 
        /// </summary>
        /// <param name="body">reassignShipment</param>
        /// <param name="xVolTenant"></param>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        ResourceOfShipment ReassignShipmentUsingPUT (ReassignShipment body, int? xVolTenant, int? shipmentNumber, int? xVolSite);
        /// <summary>
        /// rejectShipment 
        /// </summary>
        /// <param name="body">rejectShipment</param>
        /// <param name="xVolTenant"></param>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolSite"></param>
        /// <returns></returns>
        void RejectShipmentUsingPUT (RejectShipment body, int? xVolTenant, int? shipmentNumber, int? xVolSite);
        /// <summary>
        /// replaceShipment 
        /// </summary>
        /// <param name="body">newShipment</param>
        /// <param name="xVolTenant"></param>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        ResourceOfShipment ReplaceShipmentUsingPUT (Shipment body, int? xVolTenant, int? shipmentNumber, int? xVolSite);
        /// <summary>
        /// revert 
        /// </summary>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="taskId">taskId</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        ResourceOfShipment RevertUsingPUT (int? shipmentNumber, string taskId, int? xVolTenant, int? xVolSite);
        /// <summary>
        /// skipTask 
        /// </summary>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="taskId">taskId</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        ResourceOfShipment SkipTaskUsingPUT (int? shipmentNumber, string taskId, int? xVolTenant, int? xVolSite);
        /// <summary>
        /// splitShipment 
        /// </summary>
        /// <param name="body">splitItemDtos</param>
        /// <param name="xVolTenant"></param>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        ResourceOfShipment SplitShipmentUsingPOST (List<SplitItem> body, int? xVolTenant, int? shipmentNumber, int? xVolSite);
        /// <summary>
        /// workflowDefinitionImage 
        /// </summary>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>string</returns>
        string WorkflowDefinitionImageUsingGET (int? shipmentNumber, int? xVolTenant, int? xVolSite);
        /// <summary>
        /// workflowInstanceImage 
        /// </summary>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>string</returns>
        string WorkflowInstanceImageUsingGET (int? shipmentNumber, int? xVolTenant, int? xVolSite);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class ShipmentControllerApi : IShipmentControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ShipmentControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public ShipmentControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="ShipmentControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public ShipmentControllerApi(String basePath)
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
        /// backorderItems 
        /// </summary>
        /// <param name="body">backorderItemsRequestDto</param>
        /// <param name="xVolTenant"></param>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        public ResourceOfShipment BackorderItemsUsingPOST (BackorderItemsRequest body, int? xVolTenant, int? shipmentNumber, int? xVolSite)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling BackorderItemsUsingPOST");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling BackorderItemsUsingPOST");
            // verify the required parameter 'shipmentNumber' is set
            if (shipmentNumber == null) throw new ApiException(400, "Missing required parameter 'shipmentNumber' when calling BackorderItemsUsingPOST");
    
            var path = "/shipments/{shipmentNumber}/backorderedItems";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "shipmentNumber" + "}", ApiClient.ParameterToString(shipmentNumber));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling BackorderItemsUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling BackorderItemsUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ResourceOfShipment) ApiClient.Deserialize(response.Content, typeof(ResourceOfShipment), response.Headers);
        }
    
        /// <summary>
        /// backorderShipment 
        /// </summary>
        /// <param name="body">backorderShipmentRequestDto</param>
        /// <param name="xVolTenant"></param>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        public ResourceOfShipment BackorderShipmentUsingPUT (BackorderShipmentRequest body, int? xVolTenant, int? shipmentNumber, int? xVolSite)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling BackorderShipmentUsingPUT");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling BackorderShipmentUsingPUT");
            // verify the required parameter 'shipmentNumber' is set
            if (shipmentNumber == null) throw new ApiException(400, "Missing required parameter 'shipmentNumber' when calling BackorderShipmentUsingPUT");
    
            var path = "/shipments/{shipmentNumber}/backordered";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "shipmentNumber" + "}", ApiClient.ParameterToString(shipmentNumber));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.PUT, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling BackorderShipmentUsingPUT: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling BackorderShipmentUsingPUT: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ResourceOfShipment) ApiClient.Deserialize(response.Content, typeof(ResourceOfShipment), response.Headers);
        }
    
        /// <summary>
        /// cancelShipment 
        /// </summary>
        /// <param name="body">cancelShipment</param>
        /// <param name="xVolTenant"></param>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolSite"></param>
        /// <returns></returns>
        public void CancelShipmentUsingPUT (CancelShipment body, int? xVolTenant, int? shipmentNumber, int? xVolSite)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling CancelShipmentUsingPUT");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling CancelShipmentUsingPUT");
            // verify the required parameter 'shipmentNumber' is set
            if (shipmentNumber == null) throw new ApiException(400, "Missing required parameter 'shipmentNumber' when calling CancelShipmentUsingPUT");
    
            var path = "/shipments/{shipmentNumber}/canceled";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "shipmentNumber" + "}", ApiClient.ParameterToString(shipmentNumber));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.PUT, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling CancelShipmentUsingPUT: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling CancelShipmentUsingPUT: " + response.ErrorMessage, response.ErrorMessage);
    
            return;
        }
    
        /// <summary>
        /// canceledItems 
        /// </summary>
        /// <param name="body">canceledItemDtos</param>
        /// <param name="xVolTenant"></param>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        public ResourceOfShipment CanceledItemsUsingPOST (List<CanceledItem> body, int? xVolTenant, int? shipmentNumber, int? xVolSite)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling CanceledItemsUsingPOST");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling CanceledItemsUsingPOST");
            // verify the required parameter 'shipmentNumber' is set
            if (shipmentNumber == null) throw new ApiException(400, "Missing required parameter 'shipmentNumber' when calling CanceledItemsUsingPOST");
    
            var path = "/shipments/{shipmentNumber}/canceledItems";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "shipmentNumber" + "}", ApiClient.ParameterToString(shipmentNumber));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling CanceledItemsUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling CanceledItemsUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ResourceOfShipment) ApiClient.Deserialize(response.Content, typeof(ResourceOfShipment), response.Headers);
        }
    
        /// <summary>
        /// deleteShipment 
        /// </summary>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns></returns>
        public void DeleteShipmentUsingDELETE (int? shipmentNumber, int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'shipmentNumber' is set
            if (shipmentNumber == null) throw new ApiException(400, "Missing required parameter 'shipmentNumber' when calling DeleteShipmentUsingDELETE");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling DeleteShipmentUsingDELETE");
    
            var path = "/shipments/{shipmentNumber}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "shipmentNumber" + "}", ApiClient.ParameterToString(shipmentNumber));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                            
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.DELETE, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteShipmentUsingDELETE: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteShipmentUsingDELETE: " + response.ErrorMessage, response.ErrorMessage);
    
            return;
        }
    
        /// <summary>
        /// execute 
        /// </summary>
        /// <param name="body">taskBody</param>
        /// <param name="xVolTenant"></param>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="taskId">taskId</param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        public ResourceOfShipment ExecuteUsingPUT (Dictionary<string, Object> body, int? xVolTenant, int? shipmentNumber, string taskId, int? xVolSite)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling ExecuteUsingPUT");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling ExecuteUsingPUT");
            // verify the required parameter 'shipmentNumber' is set
            if (shipmentNumber == null) throw new ApiException(400, "Missing required parameter 'shipmentNumber' when calling ExecuteUsingPUT");
            // verify the required parameter 'taskId' is set
            if (taskId == null) throw new ApiException(400, "Missing required parameter 'taskId' when calling ExecuteUsingPUT");
    
            var path = "/shipments/{shipmentNumber}/tasks/{taskId}/completed";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "shipmentNumber" + "}", ApiClient.ParameterToString(shipmentNumber));
path = path.Replace("{" + "taskId" + "}", ApiClient.ParameterToString(taskId));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.PUT, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling ExecuteUsingPUT: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling ExecuteUsingPUT: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ResourceOfShipment) ApiClient.Deserialize(response.Content, typeof(ResourceOfShipment), response.Headers);
        }
    
        /// <summary>
        /// fulfillShipment 
        /// </summary>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns></returns>
        public void FulfillShipmentUsingPUT (int? shipmentNumber, int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'shipmentNumber' is set
            if (shipmentNumber == null) throw new ApiException(400, "Missing required parameter 'shipmentNumber' when calling FulfillShipmentUsingPUT");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling FulfillShipmentUsingPUT");
    
            var path = "/shipments/{shipmentNumber}/fulfilled";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "shipmentNumber" + "}", ApiClient.ParameterToString(shipmentNumber));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                            
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.PUT, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling FulfillShipmentUsingPUT: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling FulfillShipmentUsingPUT: " + response.ErrorMessage, response.ErrorMessage);
    
            return;
        }
    
        /// <summary>
        /// getShipment 
        /// </summary>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolTenant"></param>
        /// <param name="fields">fields</param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        public ResourceOfShipment GetShipmentUsingGET (int? shipmentNumber, int? xVolTenant, string fields, int? xVolSite)
        {
            // verify the required parameter 'shipmentNumber' is set
            if (shipmentNumber == null) throw new ApiException(400, "Missing required parameter 'shipmentNumber' when calling GetShipmentUsingGET");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling GetShipmentUsingGET");
    
            var path = "/shipments/{shipmentNumber}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "shipmentNumber" + "}", ApiClient.ParameterToString(shipmentNumber));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (fields != null) queryParams.Add("fields", ApiClient.ParameterToString(fields)); // query parameter
             if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                            
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetShipmentUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetShipmentUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ResourceOfShipment) ApiClient.Deserialize(response.Content, typeof(ResourceOfShipment), response.Headers);
        }
    
        /// <summary>
        /// getShipments 
        /// </summary>
        /// <param name="xVolTenant"></param>
        /// <param name="fields"></param>
        /// <param name="filter"></param>
        /// <param name="isLate"></param>
        /// <param name="page"></param>
        /// <param name="pageSize"></param>
        /// <param name="quickSearch"></param>
        /// <param name="sort"></param>
        /// <param name="xVolSite"></param>
        /// <returns>PagedResourcesOfResourceOfShipment</returns>
        public PagedResourcesOfResourceOfShipment GetShipmentsUsingGET (int? xVolTenant, string fields, string filter, bool? isLate, int? page, int? pageSize, string quickSearch, string sort, int? xVolSite)
        {
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling GetShipmentsUsingGET");
    
            var path = "/shipments";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (fields != null) queryParams.Add("fields", ApiClient.ParameterToString(fields)); // query parameter
 if (filter != null) queryParams.Add("filter", ApiClient.ParameterToString(filter)); // query parameter
 if (isLate != null) queryParams.Add("isLate", ApiClient.ParameterToString(isLate)); // query parameter
 if (page != null) queryParams.Add("page", ApiClient.ParameterToString(page)); // query parameter
 if (pageSize != null) queryParams.Add("pageSize", ApiClient.ParameterToString(pageSize)); // query parameter
 if (quickSearch != null) queryParams.Add("quickSearch", ApiClient.ParameterToString(quickSearch)); // query parameter
 if (sort != null) queryParams.Add("sort", ApiClient.ParameterToString(sort)); // query parameter
             if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                            
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetShipmentsUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetShipmentsUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (PagedResourcesOfResourceOfShipment) ApiClient.Deserialize(response.Content, typeof(PagedResourcesOfResourceOfShipment), response.Headers);
        }
    
        /// <summary>
        /// getTasks 
        /// </summary>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourcesOfTask</returns>
        public ResourcesOfTask GetTasksUsingGET (int? shipmentNumber, int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'shipmentNumber' is set
            if (shipmentNumber == null) throw new ApiException(400, "Missing required parameter 'shipmentNumber' when calling GetTasksUsingGET");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling GetTasksUsingGET");
    
            var path = "/shipments/{shipmentNumber}/tasks";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "shipmentNumber" + "}", ApiClient.ParameterToString(shipmentNumber));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                            
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetTasksUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetTasksUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ResourcesOfTask) ApiClient.Deserialize(response.Content, typeof(ResourcesOfTask), response.Headers);
        }
    
        /// <summary>
        /// newShipment 
        /// </summary>
        /// <param name="body">newShipment</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        public ResourceOfShipment NewShipmentUsingPOST (Shipment body, int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling NewShipmentUsingPOST");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling NewShipmentUsingPOST");
    
            var path = "/shipments";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling NewShipmentUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling NewShipmentUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ResourceOfShipment) ApiClient.Deserialize(response.Content, typeof(ResourceOfShipment), response.Headers);
        }
    
        /// <summary>
        /// newShipment 
        /// </summary>
        /// <param name="body">newShipment</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        public ResourceOfShipment NewShipmentUsingPOST1 (Shipment body, int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling NewShipmentUsingPOST1");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling NewShipmentUsingPOST1");
    
            var path = "/shipments/";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling NewShipmentUsingPOST1: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling NewShipmentUsingPOST1: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ResourceOfShipment) ApiClient.Deserialize(response.Content, typeof(ResourceOfShipment), response.Headers);
        }
    
        /// <summary>
        /// reassignItems 
        /// </summary>
        /// <param name="body">reassignItemDtos</param>
        /// <param name="xVolTenant"></param>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        public ResourceOfShipment ReassignItemsUsingPOST (List<ReassignItem> body, int? xVolTenant, int? shipmentNumber, int? xVolSite)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling ReassignItemsUsingPOST");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling ReassignItemsUsingPOST");
            // verify the required parameter 'shipmentNumber' is set
            if (shipmentNumber == null) throw new ApiException(400, "Missing required parameter 'shipmentNumber' when calling ReassignItemsUsingPOST");
    
            var path = "/shipments/{shipmentNumber}/reassignedItems";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "shipmentNumber" + "}", ApiClient.ParameterToString(shipmentNumber));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling ReassignItemsUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling ReassignItemsUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ResourceOfShipment) ApiClient.Deserialize(response.Content, typeof(ResourceOfShipment), response.Headers);
        }
    
        /// <summary>
        /// reassignShipment 
        /// </summary>
        /// <param name="body">reassignShipment</param>
        /// <param name="xVolTenant"></param>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        public ResourceOfShipment ReassignShipmentUsingPUT (ReassignShipment body, int? xVolTenant, int? shipmentNumber, int? xVolSite)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling ReassignShipmentUsingPUT");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling ReassignShipmentUsingPUT");
            // verify the required parameter 'shipmentNumber' is set
            if (shipmentNumber == null) throw new ApiException(400, "Missing required parameter 'shipmentNumber' when calling ReassignShipmentUsingPUT");
    
            var path = "/shipments/{shipmentNumber}/reassigned";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "shipmentNumber" + "}", ApiClient.ParameterToString(shipmentNumber));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.PUT, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling ReassignShipmentUsingPUT: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling ReassignShipmentUsingPUT: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ResourceOfShipment) ApiClient.Deserialize(response.Content, typeof(ResourceOfShipment), response.Headers);
        }
    
        /// <summary>
        /// rejectShipment 
        /// </summary>
        /// <param name="body">rejectShipment</param>
        /// <param name="xVolTenant"></param>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolSite"></param>
        /// <returns></returns>
        public void RejectShipmentUsingPUT (RejectShipment body, int? xVolTenant, int? shipmentNumber, int? xVolSite)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling RejectShipmentUsingPUT");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling RejectShipmentUsingPUT");
            // verify the required parameter 'shipmentNumber' is set
            if (shipmentNumber == null) throw new ApiException(400, "Missing required parameter 'shipmentNumber' when calling RejectShipmentUsingPUT");
    
            var path = "/shipments/{shipmentNumber}/rejected";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "shipmentNumber" + "}", ApiClient.ParameterToString(shipmentNumber));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.PUT, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling RejectShipmentUsingPUT: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling RejectShipmentUsingPUT: " + response.ErrorMessage, response.ErrorMessage);
    
            return;
        }
    
        /// <summary>
        /// replaceShipment 
        /// </summary>
        /// <param name="body">newShipment</param>
        /// <param name="xVolTenant"></param>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        public ResourceOfShipment ReplaceShipmentUsingPUT (Shipment body, int? xVolTenant, int? shipmentNumber, int? xVolSite)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling ReplaceShipmentUsingPUT");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling ReplaceShipmentUsingPUT");
            // verify the required parameter 'shipmentNumber' is set
            if (shipmentNumber == null) throw new ApiException(400, "Missing required parameter 'shipmentNumber' when calling ReplaceShipmentUsingPUT");
    
            var path = "/shipments/{shipmentNumber}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "shipmentNumber" + "}", ApiClient.ParameterToString(shipmentNumber));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.PUT, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling ReplaceShipmentUsingPUT: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling ReplaceShipmentUsingPUT: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ResourceOfShipment) ApiClient.Deserialize(response.Content, typeof(ResourceOfShipment), response.Headers);
        }
    
        /// <summary>
        /// revert 
        /// </summary>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="taskId">taskId</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        public ResourceOfShipment RevertUsingPUT (int? shipmentNumber, string taskId, int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'shipmentNumber' is set
            if (shipmentNumber == null) throw new ApiException(400, "Missing required parameter 'shipmentNumber' when calling RevertUsingPUT");
            // verify the required parameter 'taskId' is set
            if (taskId == null) throw new ApiException(400, "Missing required parameter 'taskId' when calling RevertUsingPUT");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling RevertUsingPUT");
    
            var path = "/shipments/{shipmentNumber}/tasks/{taskId}/reverted";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "shipmentNumber" + "}", ApiClient.ParameterToString(shipmentNumber));
path = path.Replace("{" + "taskId" + "}", ApiClient.ParameterToString(taskId));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                            
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.PUT, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling RevertUsingPUT: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling RevertUsingPUT: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ResourceOfShipment) ApiClient.Deserialize(response.Content, typeof(ResourceOfShipment), response.Headers);
        }
    
        /// <summary>
        /// skipTask 
        /// </summary>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="taskId">taskId</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        public ResourceOfShipment SkipTaskUsingPUT (int? shipmentNumber, string taskId, int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'shipmentNumber' is set
            if (shipmentNumber == null) throw new ApiException(400, "Missing required parameter 'shipmentNumber' when calling SkipTaskUsingPUT");
            // verify the required parameter 'taskId' is set
            if (taskId == null) throw new ApiException(400, "Missing required parameter 'taskId' when calling SkipTaskUsingPUT");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling SkipTaskUsingPUT");
    
            var path = "/shipments/{shipmentNumber}/tasks/{taskId}/skipped";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "shipmentNumber" + "}", ApiClient.ParameterToString(shipmentNumber));
path = path.Replace("{" + "taskId" + "}", ApiClient.ParameterToString(taskId));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                            
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.PUT, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling SkipTaskUsingPUT: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling SkipTaskUsingPUT: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ResourceOfShipment) ApiClient.Deserialize(response.Content, typeof(ResourceOfShipment), response.Headers);
        }
    
        /// <summary>
        /// splitShipment 
        /// </summary>
        /// <param name="body">splitItemDtos</param>
        /// <param name="xVolTenant"></param>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceOfShipment</returns>
        public ResourceOfShipment SplitShipmentUsingPOST (List<SplitItem> body, int? xVolTenant, int? shipmentNumber, int? xVolSite)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling SplitShipmentUsingPOST");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling SplitShipmentUsingPOST");
            // verify the required parameter 'shipmentNumber' is set
            if (shipmentNumber == null) throw new ApiException(400, "Missing required parameter 'shipmentNumber' when calling SplitShipmentUsingPOST");
    
            var path = "/shipments/{shipmentNumber}/split";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "shipmentNumber" + "}", ApiClient.ParameterToString(shipmentNumber));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling SplitShipmentUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling SplitShipmentUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ResourceOfShipment) ApiClient.Deserialize(response.Content, typeof(ResourceOfShipment), response.Headers);
        }
    
        /// <summary>
        /// workflowDefinitionImage 
        /// </summary>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>string</returns>
        public string WorkflowDefinitionImageUsingGET (int? shipmentNumber, int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'shipmentNumber' is set
            if (shipmentNumber == null) throw new ApiException(400, "Missing required parameter 'shipmentNumber' when calling WorkflowDefinitionImageUsingGET");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling WorkflowDefinitionImageUsingGET");
    
            var path = "/shipments/{shipmentNumber}/workflow-definition-image";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "shipmentNumber" + "}", ApiClient.ParameterToString(shipmentNumber));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                            
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling WorkflowDefinitionImageUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling WorkflowDefinitionImageUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
        /// <summary>
        /// workflowInstanceImage 
        /// </summary>
        /// <param name="shipmentNumber">shipmentNumber</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>string</returns>
        public string WorkflowInstanceImageUsingGET (int? shipmentNumber, int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'shipmentNumber' is set
            if (shipmentNumber == null) throw new ApiException(400, "Missing required parameter 'shipmentNumber' when calling WorkflowInstanceImageUsingGET");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling WorkflowInstanceImageUsingGET");
    
            var path = "/shipments/{shipmentNumber}/workflow-instance-image";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "shipmentNumber" + "}", ApiClient.ParameterToString(shipmentNumber));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                            
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling WorkflowInstanceImageUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling WorkflowInstanceImageUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
    }
}
