using System;
using System.Collections.Generic;
using Mozu.Fulfillment.Contracts.Model;
using RestSharp;
using Mozu.Swagger.Client;

namespace Mozu.Fulfillment.Contracts.Api
{
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public interface IWebMvcLinksHandlerApi
    {
        /// <summary>
        /// links 
        /// </summary>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>Dictionary&lt;string, Dictionary&lt;string, Link&gt;&gt;</returns>
        Dictionary<string, Dictionary<string, Link>> LinksUsingGET (int? xVolTenant, int? xVolSite);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class WebMvcLinksHandlerApi : IWebMvcLinksHandlerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="WebMvcLinksHandlerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public WebMvcLinksHandlerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="WebMvcLinksHandlerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public WebMvcLinksHandlerApi(String basePath)
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
        /// links 
        /// </summary>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>Dictionary&lt;string, Dictionary&lt;string, Link&gt;&gt;</returns>
        public Dictionary<string, Dictionary<string, Link>> LinksUsingGET (int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling LinksUsingGET");
    
            var path = "/actuator";
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
                throw new ApiException ((int)response.StatusCode, "Error calling LinksUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling LinksUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Dictionary<string, Dictionary<string, Link>>) ApiClient.Deserialize(response.Content, typeof(Dictionary<string, Dictionary<string, Link>>), response.Headers);
        }
    
    }
}
