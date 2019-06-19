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
    public interface IFilterControllerApi
    {
        /// <summary>
        /// deleteFilter 
        /// </summary>
        /// <param name="filterID">filterID</param>
        /// <returns></returns>
        void DeleteFilterUsingDELETE (int? filterID);
        /// <summary>
        /// getFilter 
        /// </summary>
        /// <param name="filterID">filterID</param>
        /// <returns>AbstractFilter</returns>
        AbstractFilter GetFilterUsingGET (int? filterID);
        /// <summary>
        /// saveCriteriaSetFilter 
        /// </summary>
        /// <param name="body">loc</param>
        /// <returns>AbstractFilter</returns>
        AbstractFilter SaveCriteriaSetFilterUsingPOST (LocationCriteriaSetFilter body);
        /// <summary>
        /// saveCustomDataListFilter 
        /// </summary>
        /// <param name="body">filter</param>
        /// <returns>AbstractFilter</returns>
        AbstractFilter SaveCustomDataListFilterUsingPOST (CustomDataListFilter body);
        /// <summary>
        /// saveCustomDataValueFilter 
        /// </summary>
        /// <param name="body">customDataValueFilter</param>
        /// <returns>AbstractFilter</returns>
        AbstractFilter SaveCustomDataValueFilterUsingPOST (CustomDataValueFilter body);
        /// <summary>
        /// testFilter 
        /// </summary>
        /// <returns>AbstractFilter</returns>
        AbstractFilter TestFilterUsingGET ();
        /// <summary>
        /// testSetFilter 
        /// </summary>
        /// <returns>AbstractFilter</returns>
        AbstractFilter TestSetFilterUsingGET ();
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class FilterControllerApi : IFilterControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="FilterControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public FilterControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="FilterControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public FilterControllerApi(String basePath)
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
        /// deleteFilter 
        /// </summary>
        /// <param name="filterID">filterID</param>
        /// <returns></returns>
        public void DeleteFilterUsingDELETE (int? filterID)
        {
            // verify the required parameter 'filterID' is set
            if (filterID == null) throw new ApiException(400, "Missing required parameter 'filterID' when calling DeleteFilterUsingDELETE");
    
            var path = "/api/v1/filter/delete/{filterID}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "filterID" + "}", ApiClient.ParameterToString(filterID));
    
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
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteFilterUsingDELETE: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteFilterUsingDELETE: " + response.ErrorMessage, response.ErrorMessage);
    
            return;
        }
    
        /// <summary>
        /// getFilter 
        /// </summary>
        /// <param name="filterID">filterID</param>
        /// <returns>AbstractFilter</returns>
        public AbstractFilter GetFilterUsingGET (int? filterID)
        {
            // verify the required parameter 'filterID' is set
            if (filterID == null) throw new ApiException(400, "Missing required parameter 'filterID' when calling GetFilterUsingGET");
    
            var path = "/api/v1/filter/{filterID}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "filterID" + "}", ApiClient.ParameterToString(filterID));
    
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetFilterUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetFilterUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (AbstractFilter) ApiClient.Deserialize(response.Content, typeof(AbstractFilter), response.Headers);
        }
    
        /// <summary>
        /// saveCriteriaSetFilter 
        /// </summary>
        /// <param name="body">loc</param>
        /// <returns>AbstractFilter</returns>
        public AbstractFilter SaveCriteriaSetFilterUsingPOST (LocationCriteriaSetFilter body)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling SaveCriteriaSetFilterUsingPOST");
    
            var path = "/api/v1/filter/criteriaSet";
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
                throw new ApiException ((int)response.StatusCode, "Error calling SaveCriteriaSetFilterUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling SaveCriteriaSetFilterUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (AbstractFilter) ApiClient.Deserialize(response.Content, typeof(AbstractFilter), response.Headers);
        }
    
        /// <summary>
        /// saveCustomDataListFilter 
        /// </summary>
        /// <param name="body">filter</param>
        /// <returns>AbstractFilter</returns>
        public AbstractFilter SaveCustomDataListFilterUsingPOST (CustomDataListFilter body)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling SaveCustomDataListFilterUsingPOST");
    
            var path = "/api/v1/filter/customDataListFilter";
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
                throw new ApiException ((int)response.StatusCode, "Error calling SaveCustomDataListFilterUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling SaveCustomDataListFilterUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (AbstractFilter) ApiClient.Deserialize(response.Content, typeof(AbstractFilter), response.Headers);
        }
    
        /// <summary>
        /// saveCustomDataValueFilter 
        /// </summary>
        /// <param name="body">customDataValueFilter</param>
        /// <returns>AbstractFilter</returns>
        public AbstractFilter SaveCustomDataValueFilterUsingPOST (CustomDataValueFilter body)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling SaveCustomDataValueFilterUsingPOST");
    
            var path = "/api/v1/filter/customDataValueFilter";
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
                throw new ApiException ((int)response.StatusCode, "Error calling SaveCustomDataValueFilterUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling SaveCustomDataValueFilterUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (AbstractFilter) ApiClient.Deserialize(response.Content, typeof(AbstractFilter), response.Headers);
        }
    
        /// <summary>
        /// testFilter 
        /// </summary>
        /// <returns>AbstractFilter</returns>
        public AbstractFilter TestFilterUsingGET ()
        {
    
            var path = "/api/v1/filter/testcriteria";
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
                throw new ApiException ((int)response.StatusCode, "Error calling TestFilterUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling TestFilterUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (AbstractFilter) ApiClient.Deserialize(response.Content, typeof(AbstractFilter), response.Headers);
        }
    
        /// <summary>
        /// testSetFilter 
        /// </summary>
        /// <returns>AbstractFilter</returns>
        public AbstractFilter TestSetFilterUsingGET ()
        {
    
            var path = "/api/v1/filter/testset";
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
                throw new ApiException ((int)response.StatusCode, "Error calling TestSetFilterUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling TestSetFilterUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (AbstractFilter) ApiClient.Deserialize(response.Content, typeof(AbstractFilter), response.Headers);
        }
    
    }
}
