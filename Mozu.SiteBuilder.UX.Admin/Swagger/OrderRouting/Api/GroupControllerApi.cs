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
    public interface IGroupControllerApi
    {
        /// <summary>
        /// deleteGroup 
        /// </summary>
        /// <param name="groupID">groupID</param>
        /// <returns></returns>
        void DeleteGroupUsingDELETE (int? groupID);
        /// <summary>
        /// getGroup 
        /// </summary>
        /// <param name="groupID">groupID</param>
        /// <returns>LocationGroup</returns>
        LocationGroup GetGroupUsingGET (int? groupID);
        /// <summary>
        /// saveGroup 
        /// </summary>
        /// <param name="body">loc</param>
        /// <returns>LocationGroup</returns>
        LocationGroup SaveGroupUsingPOST (LocationGroup body);
        /// <summary>
        /// setGroupFilters 
        /// </summary>
        /// <param name="body">filterIDs</param>
        /// <param name="groupID">groupID</param>
        /// <returns>LocationGroup</returns>
        LocationGroup SetGroupFiltersUsingPOST (List<int?> body, int? groupID);
        /// <summary>
        /// setGroupSorts 
        /// </summary>
        /// <param name="body">sorts</param>
        /// <param name="groupID">groupID</param>
        /// <returns>LocationGroup</returns>
        LocationGroup SetGroupSortsUsingPOST (List<LocationSort> body, int? groupID);
        /// <summary>
        /// testGroup 
        /// </summary>
        /// <returns>LocationGroup</returns>
        LocationGroup TestGroupUsingGET ();
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class GroupControllerApi : IGroupControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="GroupControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public GroupControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="GroupControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public GroupControllerApi(String basePath)
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
        /// deleteGroup 
        /// </summary>
        /// <param name="groupID">groupID</param>
        /// <returns></returns>
        public void DeleteGroupUsingDELETE (int? groupID)
        {
            // verify the required parameter 'groupID' is set
            if (groupID == null) throw new ApiException(400, "Missing required parameter 'groupID' when calling DeleteGroupUsingDELETE");
    
            var path = "/api/v1/group/delete/{groupID}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "groupID" + "}", ApiClient.ParameterToString(groupID));
    
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
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteGroupUsingDELETE: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteGroupUsingDELETE: " + response.ErrorMessage, response.ErrorMessage);
    
            return;
        }
    
        /// <summary>
        /// getGroup 
        /// </summary>
        /// <param name="groupID">groupID</param>
        /// <returns>LocationGroup</returns>
        public LocationGroup GetGroupUsingGET (int? groupID)
        {
            // verify the required parameter 'groupID' is set
            if (groupID == null) throw new ApiException(400, "Missing required parameter 'groupID' when calling GetGroupUsingGET");
    
            var path = "/api/v1/group/{groupID}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "groupID" + "}", ApiClient.ParameterToString(groupID));
    
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetGroupUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetGroupUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (LocationGroup) ApiClient.Deserialize(response.Content, typeof(LocationGroup), response.Headers);
        }
    
        /// <summary>
        /// saveGroup 
        /// </summary>
        /// <param name="body">loc</param>
        /// <returns>LocationGroup</returns>
        public LocationGroup SaveGroupUsingPOST (LocationGroup body)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling SaveGroupUsingPOST");
    
            var path = "/api/v1/group/";
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
                throw new ApiException ((int)response.StatusCode, "Error calling SaveGroupUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling SaveGroupUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (LocationGroup) ApiClient.Deserialize(response.Content, typeof(LocationGroup), response.Headers);
        }
    
        /// <summary>
        /// setGroupFilters 
        /// </summary>
        /// <param name="body">filterIDs</param>
        /// <param name="groupID">groupID</param>
        /// <returns>LocationGroup</returns>
        public LocationGroup SetGroupFiltersUsingPOST (List<int?> body, int? groupID)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling SetGroupFiltersUsingPOST");
            // verify the required parameter 'groupID' is set
            if (groupID == null) throw new ApiException(400, "Missing required parameter 'groupID' when calling SetGroupFiltersUsingPOST");
    
            var path = "/api/v1/group/{groupID}/setFilters";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "groupID" + "}", ApiClient.ParameterToString(groupID));
    
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
                throw new ApiException ((int)response.StatusCode, "Error calling SetGroupFiltersUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling SetGroupFiltersUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (LocationGroup) ApiClient.Deserialize(response.Content, typeof(LocationGroup), response.Headers);
        }
    
        /// <summary>
        /// setGroupSorts 
        /// </summary>
        /// <param name="body">sorts</param>
        /// <param name="groupID">groupID</param>
        /// <returns>LocationGroup</returns>
        public LocationGroup SetGroupSortsUsingPOST (List<LocationSort> body, int? groupID)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling SetGroupSortsUsingPOST");
            // verify the required parameter 'groupID' is set
            if (groupID == null) throw new ApiException(400, "Missing required parameter 'groupID' when calling SetGroupSortsUsingPOST");
    
            var path = "/api/v1/group/{groupID}/setSorts";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "groupID" + "}", ApiClient.ParameterToString(groupID));
    
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
                throw new ApiException ((int)response.StatusCode, "Error calling SetGroupSortsUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling SetGroupSortsUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (LocationGroup) ApiClient.Deserialize(response.Content, typeof(LocationGroup), response.Headers);
        }
    
        /// <summary>
        /// testGroup 
        /// </summary>
        /// <returns>LocationGroup</returns>
        public LocationGroup TestGroupUsingGET ()
        {
    
            var path = "/api/v1/group/test";
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
                throw new ApiException ((int)response.StatusCode, "Error calling TestGroupUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling TestGroupUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (LocationGroup) ApiClient.Deserialize(response.Content, typeof(LocationGroup), response.Headers);
        }
    
    }
}
