using System;
using System.Collections.Generic;
using RestSharp;
using Mozu.Swagger.Client;

namespace Mozu.CARS.Contracts.Api
{
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public interface ISwitchUserControllerApi
    {
        /// <summary>
        /// accountSearch 
        /// </summary>
        /// <param name="accountType"></param>
        /// <param name="page">page</param>
        /// <param name="perPage">perPage</param>
        /// <param name="searchTerm"></param>
        /// <returns>string</returns>
        string AccountSearchUsingPOST (string accountType, int? page, int? perPage, string searchTerm);
        /// <summary>
        /// selectUser 
        /// </summary>
        /// <returns>string</returns>
        string SelectUserUsingGET ();
        /// <summary>
        /// selectUser 
        /// </summary>
        /// <param name="complete"></param>
        /// <param name="userID">userID</param>
        /// <param name="username">username</param>
        /// <returns>string</returns>
        string SelectUserUsingPOST (bool? complete, int? userID, string username);
        /// <summary>
        /// userSearch 
        /// </summary>
        /// <param name="accountID">accountID</param>
        /// <param name="accountType"></param>
        /// <param name="page">page</param>
        /// <param name="perPage">perPage</param>
        /// <param name="searchTerm"></param>
        /// <returns>string</returns>
        string UserSearchUsingPOST (int? accountID, string accountType, int? page, int? perPage, string searchTerm);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class SwitchUserControllerApi : ISwitchUserControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="SwitchUserControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public SwitchUserControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="SwitchUserControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public SwitchUserControllerApi(String basePath)
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
        /// accountSearch 
        /// </summary>
        /// <param name="accountType"></param>
        /// <param name="page">page</param>
        /// <param name="perPage">perPage</param>
        /// <param name="searchTerm"></param>
        /// <returns>string</returns>
        public string AccountSearchUsingPOST (string accountType, int? page, int? perPage, string searchTerm)
        {
    
            var path = "/admin/selectUser/accountSearch";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (accountType != null) queryParams.Add("accountType", ApiClient.ParameterToString(accountType)); // query parameter
 if (page != null) queryParams.Add("page", ApiClient.ParameterToString(page)); // query parameter
 if (perPage != null) queryParams.Add("perPage", ApiClient.ParameterToString(perPage)); // query parameter
 if (searchTerm != null) queryParams.Add("searchTerm", ApiClient.ParameterToString(searchTerm)); // query parameter
                                        
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling AccountSearchUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling AccountSearchUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
        /// <summary>
        /// selectUser 
        /// </summary>
        /// <returns>string</returns>
        public string SelectUserUsingGET ()
        {
    
            var path = "/admin/selectUser";
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
                throw new ApiException ((int)response.StatusCode, "Error calling SelectUserUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling SelectUserUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
        /// <summary>
        /// selectUser 
        /// </summary>
        /// <param name="complete"></param>
        /// <param name="userID">userID</param>
        /// <param name="username">username</param>
        /// <returns>string</returns>
        public string SelectUserUsingPOST (bool? complete, int? userID, string username)
        {
    
            var path = "/admin/selectUser";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (complete != null) queryParams.Add("complete", ApiClient.ParameterToString(complete)); // query parameter
 if (userID != null) queryParams.Add("userID", ApiClient.ParameterToString(userID)); // query parameter
 if (username != null) queryParams.Add("username", ApiClient.ParameterToString(username)); // query parameter
                                        
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling SelectUserUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling SelectUserUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
        /// <summary>
        /// userSearch 
        /// </summary>
        /// <param name="accountID">accountID</param>
        /// <param name="accountType"></param>
        /// <param name="page">page</param>
        /// <param name="perPage">perPage</param>
        /// <param name="searchTerm"></param>
        /// <returns>string</returns>
        public string UserSearchUsingPOST (int? accountID, string accountType, int? page, int? perPage, string searchTerm)
        {
            // verify the required parameter 'accountID' is set
            if (accountID == null) throw new ApiException(400, "Missing required parameter 'accountID' when calling UserSearchUsingPOST");
    
            var path = "/admin/selectUser/userSearch";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (accountID != null) queryParams.Add("accountID", ApiClient.ParameterToString(accountID)); // query parameter
 if (accountType != null) queryParams.Add("accountType", ApiClient.ParameterToString(accountType)); // query parameter
 if (page != null) queryParams.Add("page", ApiClient.ParameterToString(page)); // query parameter
 if (perPage != null) queryParams.Add("perPage", ApiClient.ParameterToString(perPage)); // query parameter
 if (searchTerm != null) queryParams.Add("searchTerm", ApiClient.ParameterToString(searchTerm)); // query parameter
                                        
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling UserSearchUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling UserSearchUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
    }
}
