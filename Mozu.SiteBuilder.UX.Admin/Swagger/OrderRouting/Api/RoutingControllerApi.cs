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
    public interface IRoutingControllerApi
    {
        /// <summary>
        /// getSampleRequest 
        /// </summary>
        /// <returns>SuggestionRequest</returns>
        SuggestionRequest GetSampleRequestUsingGET ();
        /// <summary>
        /// getSuggestionLog 
        /// </summary>
        /// <param name="externalResponseID">externalResponseID</param>
        /// <param name="orderID">orderID</param>
        /// <param name="responseID">responseID</param>
        /// <param name="suggestionID">suggestionID</param>
        /// <returns>List&lt;JsonNode&gt;</returns>
        List<JsonNode> GetSuggestionLogUsingGET (string externalResponseID, int? orderID, int? responseID, int? suggestionID);
        /// <summary>
        /// suggestCandidates 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>CandidateSuggestionsResponse</returns>
        CandidateSuggestionsResponse SuggestCandidatesUsingPOST (CandidateSuggestionsRequest body);
        /// <summary>
        /// suggestRouting 
        /// </summary>
        /// <param name="body">request</param>
        /// <param name="returnSuggestionLog">returnSuggestionLog</param>
        /// <returns>SuggestionResponse</returns>
        SuggestionResponse SuggestRoutingUsingPOST (SuggestionRequest body, bool? returnSuggestionLog);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class RoutingControllerApi : IRoutingControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="RoutingControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public RoutingControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="RoutingControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public RoutingControllerApi(String basePath)
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
        /// getSampleRequest 
        /// </summary>
        /// <returns>SuggestionRequest</returns>
        public SuggestionRequest GetSampleRequestUsingGET ()
        {
    
            var path = "/api/v1/routing/samplerequest";
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetSampleRequestUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetSampleRequestUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (SuggestionRequest) ApiClient.Deserialize(response.Content, typeof(SuggestionRequest), response.Headers);
        }
    
        /// <summary>
        /// getSuggestionLog 
        /// </summary>
        /// <param name="externalResponseID">externalResponseID</param>
        /// <param name="orderID">orderID</param>
        /// <param name="responseID">responseID</param>
        /// <param name="suggestionID">suggestionID</param>
        /// <returns>List&lt;JsonNode&gt;</returns>
        public List<JsonNode> GetSuggestionLogUsingGET (string externalResponseID, int? orderID, int? responseID, int? suggestionID)
        {
    
            var path = "/api/v1/routing/suggestionLog/";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (externalResponseID != null) queryParams.Add("externalResponseID", ApiClient.ParameterToString(externalResponseID)); // query parameter
 if (orderID != null) queryParams.Add("orderID", ApiClient.ParameterToString(orderID)); // query parameter
 if (responseID != null) queryParams.Add("responseID", ApiClient.ParameterToString(responseID)); // query parameter
 if (suggestionID != null) queryParams.Add("suggestionID", ApiClient.ParameterToString(suggestionID)); // query parameter
                                        
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetSuggestionLogUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetSuggestionLogUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (List<JsonNode>) ApiClient.Deserialize(response.Content, typeof(List<JsonNode>), response.Headers);
        }
    
        /// <summary>
        /// suggestCandidates 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>CandidateSuggestionsResponse</returns>
        public CandidateSuggestionsResponse SuggestCandidatesUsingPOST (CandidateSuggestionsRequest body)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling SuggestCandidatesUsingPOST");
    
            var path = "/api/v1/routing/candidates";
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
                throw new ApiException ((int)response.StatusCode, "Error calling SuggestCandidatesUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling SuggestCandidatesUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (CandidateSuggestionsResponse) ApiClient.Deserialize(response.Content, typeof(CandidateSuggestionsResponse), response.Headers);
        }
    
        /// <summary>
        /// suggestRouting 
        /// </summary>
        /// <param name="body">request</param>
        /// <param name="returnSuggestionLog">returnSuggestionLog</param>
        /// <returns>SuggestionResponse</returns>
        public SuggestionResponse SuggestRoutingUsingPOST (SuggestionRequest body, bool? returnSuggestionLog)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling SuggestRoutingUsingPOST");
    
            var path = "/api/v1/routing/suggestion";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (returnSuggestionLog != null) queryParams.Add("returnSuggestionLog", ApiClient.ParameterToString(returnSuggestionLog)); // query parameter
                                    postBody = ApiClient.Serialize(body); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling SuggestRoutingUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling SuggestRoutingUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (SuggestionResponse) ApiClient.Deserialize(response.Content, typeof(SuggestionResponse), response.Headers);
        }
    
    }
}
