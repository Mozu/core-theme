using System;
using System.Collections.Generic;
using RestSharp;
using IO.Swagger.Client;
using Swagger.Fulfiller.Model;

namespace Swagger.Fulfiller.Api
{
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public interface IWorkflowProcessControllerApi
    {
        /// <summary>
        /// getWorkflowProcess 
        /// </summary>
        /// <param name="containerId">containerId</param>
        /// <param name="processId">processId</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceWorkflowProcess</returns>
        ResourceWorkflowProcess GetWorkflowProcessUsingGET (string containerId, string processId, int? xVolTenant, int? xVolSite);
        /// <summary>
        /// getWorkflowProcess 
        /// </summary>
        /// <param name="shipmentType">shipmentType</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceWorkflowProcess</returns>
        ResourceWorkflowProcess GetWorkflowProcessUsingGET1 (string shipmentType, int? xVolTenant, int? xVolSite);
        /// <summary>
        /// getWorkflowProcesses 
        /// </summary>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourcesResourceWorkflowProcess</returns>
        ResourcesResourceWorkflowProcess GetWorkflowProcessesUsingGET (int? xVolTenant, int? xVolSite);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class WorkflowProcessControllerApi : IWorkflowProcessControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="WorkflowProcessControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public WorkflowProcessControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="WorkflowProcessControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public WorkflowProcessControllerApi(String basePath)
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
        /// getWorkflowProcess 
        /// </summary>
        /// <param name="containerId">containerId</param>
        /// <param name="processId">processId</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceWorkflowProcess</returns>
        public ResourceWorkflowProcess GetWorkflowProcessUsingGET (string containerId, string processId, int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'containerId' is set
            if (containerId == null) throw new ApiException(400, "Missing required parameter 'containerId' when calling GetWorkflowProcessUsingGET");
            // verify the required parameter 'processId' is set
            if (processId == null) throw new ApiException(400, "Missing required parameter 'processId' when calling GetWorkflowProcessUsingGET");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling GetWorkflowProcessUsingGET");
    
            var path = "/processes/definitions/{containerId}/{processId}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "containerId" + "}", ApiClient.ParameterToString(containerId));
path = path.Replace("{" + "processId" + "}", ApiClient.ParameterToString(processId));
    
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetWorkflowProcessUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetWorkflowProcessUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ResourceWorkflowProcess) ApiClient.Deserialize(response.Content, typeof(ResourceWorkflowProcess), response.Headers);
        }
    
        /// <summary>
        /// getWorkflowProcess 
        /// </summary>
        /// <param name="shipmentType">shipmentType</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourceWorkflowProcess</returns>
        public ResourceWorkflowProcess GetWorkflowProcessUsingGET1 (string shipmentType, int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'shipmentType' is set
            if (shipmentType == null) throw new ApiException(400, "Missing required parameter 'shipmentType' when calling GetWorkflowProcessUsingGET1");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling GetWorkflowProcessUsingGET1");
    
            var path = "/processes/shipmentType/{shipmentType}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "shipmentType" + "}", ApiClient.ParameterToString(shipmentType));
    
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetWorkflowProcessUsingGET1: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetWorkflowProcessUsingGET1: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ResourceWorkflowProcess) ApiClient.Deserialize(response.Content, typeof(ResourceWorkflowProcess), response.Headers);
        }
    
        /// <summary>
        /// getWorkflowProcesses 
        /// </summary>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourcesResourceWorkflowProcess</returns>
        public ResourcesResourceWorkflowProcess GetWorkflowProcessesUsingGET (int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling GetWorkflowProcessesUsingGET");
    
            var path = "/processes/definitions";
            path = path.Replace("{format}", "json");
                
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetWorkflowProcessesUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetWorkflowProcessesUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ResourcesResourceWorkflowProcess) ApiClient.Deserialize(response.Content, typeof(ResourcesResourceWorkflowProcess), response.Headers);
        }
    
    }
}
