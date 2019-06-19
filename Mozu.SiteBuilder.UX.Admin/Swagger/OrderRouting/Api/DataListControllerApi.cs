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
    public interface IDataListControllerApi
    {
        /// <summary>
        /// createCustomDataList 
        /// </summary>
        /// <param name="body">customDataList</param>
        /// <returns>CustomDataListResponse</returns>
        CustomDataListResponse CreateCustomDataListUsingPOST (CustomDataList body);
        /// <summary>
        /// deleteCustomDataList 
        /// </summary>
        /// <param name="dataListID">dataListID</param>
        /// <returns></returns>
        void DeleteCustomDataListUsingDELETE (int? dataListID);
        /// <summary>
        /// getCustomDataList 
        /// </summary>
        /// <param name="dataListID">dataListID</param>
        /// <returns>CustomDataListResponse</returns>
        CustomDataListResponse GetCustomDataListUsingGET (int? dataListID);
        /// <summary>
        /// updateCustomDataList 
        /// </summary>
        /// <param name="body">newDataList</param>
        /// <param name="dataListID">dataListID</param>
        /// <returns>CustomDataListResponse</returns>
        CustomDataListResponse UpdateCustomDataListUsingPUT (CustomDataList body, int? dataListID);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class DataListControllerApi : IDataListControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="DataListControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public DataListControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="DataListControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public DataListControllerApi(String basePath)
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
        /// createCustomDataList 
        /// </summary>
        /// <param name="body">customDataList</param>
        /// <returns>CustomDataListResponse</returns>
        public CustomDataListResponse CreateCustomDataListUsingPOST (CustomDataList body)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling CreateCustomDataListUsingPOST");
    
            var path = "/api/v1/dataList";
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
                throw new ApiException ((int)response.StatusCode, "Error calling CreateCustomDataListUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling CreateCustomDataListUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (CustomDataListResponse) ApiClient.Deserialize(response.Content, typeof(CustomDataListResponse), response.Headers);
        }
    
        /// <summary>
        /// deleteCustomDataList 
        /// </summary>
        /// <param name="dataListID">dataListID</param>
        /// <returns></returns>
        public void DeleteCustomDataListUsingDELETE (int? dataListID)
        {
            // verify the required parameter 'dataListID' is set
            if (dataListID == null) throw new ApiException(400, "Missing required parameter 'dataListID' when calling DeleteCustomDataListUsingDELETE");
    
            var path = "/api/v1/dataList/{dataListID}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "dataListID" + "}", ApiClient.ParameterToString(dataListID));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                                                    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.DELETE, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteCustomDataListUsingDELETE: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteCustomDataListUsingDELETE: " + response.ErrorMessage, response.ErrorMessage);
    
            return;
        }
    
        /// <summary>
        /// getCustomDataList 
        /// </summary>
        /// <param name="dataListID">dataListID</param>
        /// <returns>CustomDataListResponse</returns>
        public CustomDataListResponse GetCustomDataListUsingGET (int? dataListID)
        {
            // verify the required parameter 'dataListID' is set
            if (dataListID == null) throw new ApiException(400, "Missing required parameter 'dataListID' when calling GetCustomDataListUsingGET");
    
            var path = "/api/v1/dataList/{dataListID}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "dataListID" + "}", ApiClient.ParameterToString(dataListID));
    
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetCustomDataListUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetCustomDataListUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (CustomDataListResponse) ApiClient.Deserialize(response.Content, typeof(CustomDataListResponse), response.Headers);
        }
    
        /// <summary>
        /// updateCustomDataList 
        /// </summary>
        /// <param name="body">newDataList</param>
        /// <param name="dataListID">dataListID</param>
        /// <returns>CustomDataListResponse</returns>
        public CustomDataListResponse UpdateCustomDataListUsingPUT (CustomDataList body, int? dataListID)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling UpdateCustomDataListUsingPUT");
            // verify the required parameter 'dataListID' is set
            if (dataListID == null) throw new ApiException(400, "Missing required parameter 'dataListID' when calling UpdateCustomDataListUsingPUT");
    
            var path = "/api/v1/dataList/{dataListID}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "dataListID" + "}", ApiClient.ParameterToString(dataListID));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                                                postBody = ApiClient.Serialize(body); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.PUT, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling UpdateCustomDataListUsingPUT: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling UpdateCustomDataListUsingPUT: " + response.ErrorMessage, response.ErrorMessage);
    
            return (CustomDataListResponse) ApiClient.Deserialize(response.Content, typeof(CustomDataListResponse), response.Headers);
        }
    
    }
}
