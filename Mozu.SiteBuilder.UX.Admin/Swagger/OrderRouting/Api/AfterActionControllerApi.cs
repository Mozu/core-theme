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
    public interface IAfterActionControllerApi
    {
        /// <summary>
        /// deleteAction 
        /// </summary>
        /// <param name="actionID">actionID</param>
        /// <returns></returns>
        void DeleteActionUsingDELETE (int? actionID);
        /// <summary>
        /// getAction 
        /// </summary>
        /// <param name="actionID">actionID</param>
        /// <returns>GroupAfterAction</returns>
        GroupAfterAction GetActionUsingGET (int? actionID);
        /// <summary>
        /// saveNoInvAction 
        /// </summary>
        /// <param name="body">loc</param>
        /// <param name="groupID">groupID</param>
        /// <returns>GroupAfterAction</returns>
        GroupAfterAction SaveNoInvActionUsingPOST (GroupAfterAction body, int? groupID);
        /// <summary>
        /// savePartialAction 
        /// </summary>
        /// <param name="body">loc</param>
        /// <param name="groupID">groupID</param>
        /// <returns>GroupAfterAction</returns>
        GroupAfterAction SavePartialActionUsingPOST (GroupAfterAction body, int? groupID);
        /// <summary>
        /// testAction 
        /// </summary>
        /// <returns>GroupAfterAction</returns>
        GroupAfterAction TestActionUsingGET ();
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class AfterActionControllerApi : IAfterActionControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AfterActionControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public AfterActionControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="AfterActionControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public AfterActionControllerApi(String basePath)
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
        /// deleteAction 
        /// </summary>
        /// <param name="actionID">actionID</param>
        /// <returns></returns>
        public void DeleteActionUsingDELETE (int? actionID)
        {
            // verify the required parameter 'actionID' is set
            if (actionID == null) throw new ApiException(400, "Missing required parameter 'actionID' when calling DeleteActionUsingDELETE");
    
            var path = "/api/v1/action/delete/{actionID}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "actionID" + "}", ApiClient.ParameterToString(actionID));
    
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
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteActionUsingDELETE: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteActionUsingDELETE: " + response.ErrorMessage, response.ErrorMessage);
    
            return;
        }
    
        /// <summary>
        /// getAction 
        /// </summary>
        /// <param name="actionID">actionID</param>
        /// <returns>GroupAfterAction</returns>
        public GroupAfterAction GetActionUsingGET (int? actionID)
        {
            // verify the required parameter 'actionID' is set
            if (actionID == null) throw new ApiException(400, "Missing required parameter 'actionID' when calling GetActionUsingGET");
    
            var path = "/api/v1/action/{actionID}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "actionID" + "}", ApiClient.ParameterToString(actionID));
    
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetActionUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetActionUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (GroupAfterAction) ApiClient.Deserialize(response.Content, typeof(GroupAfterAction), response.Headers);
        }
    
        /// <summary>
        /// saveNoInvAction 
        /// </summary>
        /// <param name="body">loc</param>
        /// <param name="groupID">groupID</param>
        /// <returns>GroupAfterAction</returns>
        public GroupAfterAction SaveNoInvActionUsingPOST (GroupAfterAction body, int? groupID)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling SaveNoInvActionUsingPOST");
            // verify the required parameter 'groupID' is set
            if (groupID == null) throw new ApiException(400, "Missing required parameter 'groupID' when calling SaveNoInvActionUsingPOST");
    
            var path = "/api/v1/action/noinv";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (groupID != null) queryParams.Add("groupID", ApiClient.ParameterToString(groupID)); // query parameter
                                    postBody = ApiClient.Serialize(body); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling SaveNoInvActionUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling SaveNoInvActionUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (GroupAfterAction) ApiClient.Deserialize(response.Content, typeof(GroupAfterAction), response.Headers);
        }
    
        /// <summary>
        /// savePartialAction 
        /// </summary>
        /// <param name="body">loc</param>
        /// <param name="groupID">groupID</param>
        /// <returns>GroupAfterAction</returns>
        public GroupAfterAction SavePartialActionUsingPOST (GroupAfterAction body, int? groupID)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling SavePartialActionUsingPOST");
            // verify the required parameter 'groupID' is set
            if (groupID == null) throw new ApiException(400, "Missing required parameter 'groupID' when calling SavePartialActionUsingPOST");
    
            var path = "/api/v1/action/partial";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (groupID != null) queryParams.Add("groupID", ApiClient.ParameterToString(groupID)); // query parameter
                                    postBody = ApiClient.Serialize(body); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling SavePartialActionUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling SavePartialActionUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (GroupAfterAction) ApiClient.Deserialize(response.Content, typeof(GroupAfterAction), response.Headers);
        }
    
        /// <summary>
        /// testAction 
        /// </summary>
        /// <returns>GroupAfterAction</returns>
        public GroupAfterAction TestActionUsingGET ()
        {
    
            var path = "/api/v1/action/test";
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
                throw new ApiException ((int)response.StatusCode, "Error calling TestActionUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling TestActionUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (GroupAfterAction) ApiClient.Deserialize(response.Content, typeof(GroupAfterAction), response.Headers);
        }
    
    }
}
