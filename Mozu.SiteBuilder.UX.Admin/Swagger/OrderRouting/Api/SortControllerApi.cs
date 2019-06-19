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
    public interface ISortControllerApi
    {
        /// <summary>
        /// deleteSort 
        /// </summary>
        /// <param name="sortID">sortID</param>
        /// <returns></returns>
        void DeleteSortUsingDELETE (int? sortID);
        /// <summary>
        /// getSort 
        /// </summary>
        /// <param name="sortID">sortID</param>
        /// <returns>LocationSort</returns>
        LocationSort GetSortUsingGET (int? sortID);
        /// <summary>
        /// saveSort 
        /// </summary>
        /// <param name="body">loc</param>
        /// <returns>LocationSort</returns>
        LocationSort SaveSortUsingPOST (LocationSort body);
        /// <summary>
        /// testSort 
        /// </summary>
        /// <returns>LocationSort</returns>
        LocationSort TestSortUsingGET ();
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class SortControllerApi : ISortControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="SortControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public SortControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="SortControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public SortControllerApi(String basePath)
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
        /// deleteSort 
        /// </summary>
        /// <param name="sortID">sortID</param>
        /// <returns></returns>
        public void DeleteSortUsingDELETE (int? sortID)
        {
            // verify the required parameter 'sortID' is set
            if (sortID == null) throw new ApiException(400, "Missing required parameter 'sortID' when calling DeleteSortUsingDELETE");
    
            var path = "/api/v1/sort/delete/{sortID}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "sortID" + "}", ApiClient.ParameterToString(sortID));
    
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
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteSortUsingDELETE: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteSortUsingDELETE: " + response.ErrorMessage, response.ErrorMessage);
    
            return;
        }
    
        /// <summary>
        /// getSort 
        /// </summary>
        /// <param name="sortID">sortID</param>
        /// <returns>LocationSort</returns>
        public LocationSort GetSortUsingGET (int? sortID)
        {
            // verify the required parameter 'sortID' is set
            if (sortID == null) throw new ApiException(400, "Missing required parameter 'sortID' when calling GetSortUsingGET");
    
            var path = "/api/v1/sort/{sortID}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "sortID" + "}", ApiClient.ParameterToString(sortID));
    
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetSortUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetSortUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (LocationSort) ApiClient.Deserialize(response.Content, typeof(LocationSort), response.Headers);
        }
    
        /// <summary>
        /// saveSort 
        /// </summary>
        /// <param name="body">loc</param>
        /// <returns>LocationSort</returns>
        public LocationSort SaveSortUsingPOST (LocationSort body)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling SaveSortUsingPOST");
    
            var path = "/api/v1/sort/";
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
                throw new ApiException ((int)response.StatusCode, "Error calling SaveSortUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling SaveSortUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (LocationSort) ApiClient.Deserialize(response.Content, typeof(LocationSort), response.Headers);
        }
    
        /// <summary>
        /// testSort 
        /// </summary>
        /// <returns>LocationSort</returns>
        public LocationSort TestSortUsingGET ()
        {
    
            var path = "/api/v1/sort/test";
            path = path.Replace("{format}", "json");
                
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
                throw new ApiException ((int)response.StatusCode, "Error calling TestSortUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling TestSortUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (LocationSort) ApiClient.Deserialize(response.Content, typeof(LocationSort), response.Headers);
        }
    
    }
}
