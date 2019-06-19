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
    public interface ISettingsControllerApi
    {
        /// <summary>
        /// deleteFilterAttribute 
        /// </summary>
        /// <param name="attributeName">attributeName</param>
        /// <returns>FilterAttribute</returns>
        FilterAttribute DeleteFilterAttributeUsingDELETE (string attributeName);
        /// <summary>
        /// deleteSettings 
        /// </summary>
        /// <param name="siteID">siteID</param>
        /// <param name="tenantID">tenantID</param>
        /// <returns>bool?</returns>
        bool? DeleteSettingsUsingDELETE (int? siteID, int? tenantID);
        /// <summary>
        /// getFilterAttribute 
        /// </summary>
        /// <param name="attributeName">attributeName</param>
        /// <returns>FilterAttribute</returns>
        FilterAttribute GetFilterAttributeUsingGET (string attributeName);
        /// <summary>
        /// getFilterAttributes 
        /// </summary>
        /// <returns>List&lt;FilterAttribute&gt;</returns>
        List<FilterAttribute> GetFilterAttributesUsingGET ();
        /// <summary>
        /// getSettings 
        /// </summary>
        /// <param name="getDefaults">getDefaults</param>
        /// <param name="siteID">siteID</param>
        /// <param name="tenantID">tenantID</param>
        /// <returns>OrderRoutingSettings</returns>
        OrderRoutingSettings GetSettingsUsingGET (bool? getDefaults, int? siteID, int? tenantID);
        /// <summary>
        /// saveFilterAttribute 
        /// </summary>
        /// <param name="body">attribute</param>
        /// <returns>FilterAttribute</returns>
        FilterAttribute SaveFilterAttributeUsingPUT (FilterAttribute body);
        /// <summary>
        /// saveSettings 
        /// </summary>
        /// <param name="body">settings</param>
        /// <returns>OrderRoutingSettings</returns>
        OrderRoutingSettings SaveSettingsUsingPUT (OrderRoutingSettings body);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class SettingsControllerApi : ISettingsControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="SettingsControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public SettingsControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="SettingsControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public SettingsControllerApi(String basePath)
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
        /// deleteFilterAttribute 
        /// </summary>
        /// <param name="attributeName">attributeName</param>
        /// <returns>FilterAttribute</returns>
        public FilterAttribute DeleteFilterAttributeUsingDELETE (string attributeName)
        {
            // verify the required parameter 'attributeName' is set
            if (attributeName == null) throw new ApiException(400, "Missing required parameter 'attributeName' when calling DeleteFilterAttributeUsingDELETE");
    
            var path = "/api/v1/settings/filterAttributes/{attributeName}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "attributeName" + "}", ApiClient.ParameterToString(attributeName));
    
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
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteFilterAttributeUsingDELETE: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteFilterAttributeUsingDELETE: " + response.ErrorMessage, response.ErrorMessage);
    
            return (FilterAttribute) ApiClient.Deserialize(response.Content, typeof(FilterAttribute), response.Headers);
        }
    
        /// <summary>
        /// deleteSettings 
        /// </summary>
        /// <param name="siteID">siteID</param>
        /// <param name="tenantID">tenantID</param>
        /// <returns>bool?</returns>
        public bool? DeleteSettingsUsingDELETE (int? siteID, int? tenantID)
        {
    
            var path = "/api/v1/settings";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (siteID != null) queryParams.Add("siteID", ApiClient.ParameterToString(siteID)); // query parameter
 if (tenantID != null) queryParams.Add("tenantID", ApiClient.ParameterToString(tenantID)); // query parameter
                                        
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.DELETE, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteSettingsUsingDELETE: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteSettingsUsingDELETE: " + response.ErrorMessage, response.ErrorMessage);
    
            return (bool?) ApiClient.Deserialize(response.Content, typeof(bool?), response.Headers);
        }
    
        /// <summary>
        /// getFilterAttribute 
        /// </summary>
        /// <param name="attributeName">attributeName</param>
        /// <returns>FilterAttribute</returns>
        public FilterAttribute GetFilterAttributeUsingGET (string attributeName)
        {
            // verify the required parameter 'attributeName' is set
            if (attributeName == null) throw new ApiException(400, "Missing required parameter 'attributeName' when calling GetFilterAttributeUsingGET");
    
            var path = "/api/v1/settings/filterAttributes/{attributeName}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "attributeName" + "}", ApiClient.ParameterToString(attributeName));
    
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetFilterAttributeUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetFilterAttributeUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (FilterAttribute) ApiClient.Deserialize(response.Content, typeof(FilterAttribute), response.Headers);
        }
    
        /// <summary>
        /// getFilterAttributes 
        /// </summary>
        /// <returns>List&lt;FilterAttribute&gt;</returns>
        public List<FilterAttribute> GetFilterAttributesUsingGET ()
        {
    
            var path = "/api/v1/settings/filterAttributes";
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetFilterAttributesUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetFilterAttributesUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (List<FilterAttribute>) ApiClient.Deserialize(response.Content, typeof(List<FilterAttribute>), response.Headers);
        }
    
        /// <summary>
        /// getSettings 
        /// </summary>
        /// <param name="getDefaults">getDefaults</param>
        /// <param name="siteID">siteID</param>
        /// <param name="tenantID">tenantID</param>
        /// <returns>OrderRoutingSettings</returns>
        public OrderRoutingSettings GetSettingsUsingGET (bool? getDefaults, int? siteID, int? tenantID)
        {
    
            var path = "/api/v1/settings";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (getDefaults != null) queryParams.Add("getDefaults", ApiClient.ParameterToString(getDefaults)); // query parameter
 if (siteID != null) queryParams.Add("siteID", ApiClient.ParameterToString(siteID)); // query parameter
 if (tenantID != null) queryParams.Add("tenantID", ApiClient.ParameterToString(tenantID)); // query parameter
                                        
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetSettingsUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetSettingsUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (OrderRoutingSettings) ApiClient.Deserialize(response.Content, typeof(OrderRoutingSettings), response.Headers);
        }
    
        /// <summary>
        /// saveFilterAttribute 
        /// </summary>
        /// <param name="body">attribute</param>
        /// <returns>FilterAttribute</returns>
        public FilterAttribute SaveFilterAttributeUsingPUT (FilterAttribute body)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling SaveFilterAttributeUsingPUT");
    
            var path = "/api/v1/settings/filterAttributes";
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
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.PUT, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling SaveFilterAttributeUsingPUT: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling SaveFilterAttributeUsingPUT: " + response.ErrorMessage, response.ErrorMessage);
    
            return (FilterAttribute) ApiClient.Deserialize(response.Content, typeof(FilterAttribute), response.Headers);
        }
    
        /// <summary>
        /// saveSettings 
        /// </summary>
        /// <param name="body">settings</param>
        /// <returns>OrderRoutingSettings</returns>
        public OrderRoutingSettings SaveSettingsUsingPUT (OrderRoutingSettings body)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling SaveSettingsUsingPUT");
    
            var path = "/api/v1/settings";
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
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.PUT, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling SaveSettingsUsingPUT: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling SaveSettingsUsingPUT: " + response.ErrorMessage, response.ErrorMessage);
    
            return (OrderRoutingSettings) ApiClient.Deserialize(response.Content, typeof(OrderRoutingSettings), response.Headers);
        }
    
    }
}
