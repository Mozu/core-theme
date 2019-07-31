using System;
using System.Collections.Generic;
using RestSharp;
using Mozu.Swagger.Client;
using Mozu.CARS.Contracts.Model;

namespace Mozu.CARS.Contracts.Api
{
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public interface IExampleXmlControllerApi
    {
        /// <summary>
        /// exampleCall 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>ExampleXmlControllerResponse</returns>
        ExampleXmlControllerResponse ExampleCallUsingPOST (ExampleXmlPageRequest body);
        /// <summary>
        /// getExampleXml 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>ExampleXmlControllerResponse</returns>
        ExampleXmlControllerResponse GetExampleXmlUsingPOST (ExampleXmlPageRequest body);
        /// <summary>
        /// parseResponse 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>ExampleXmlControllerResponse</returns>
        ExampleXmlControllerResponse ParseResponseUsingPOST (ExampleXmlPageRequest body);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class ExampleXmlControllerApi : IExampleXmlControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ExampleXmlControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public ExampleXmlControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="ExampleXmlControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public ExampleXmlControllerApi(String basePath)
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
        /// exampleCall 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>ExampleXmlControllerResponse</returns>
        public ExampleXmlControllerResponse ExampleCallUsingPOST (ExampleXmlPageRequest body)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling ExampleCallUsingPOST");
    
            var path = "/example/exampleCall";
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
                throw new ApiException ((int)response.StatusCode, "Error calling ExampleCallUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling ExampleCallUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ExampleXmlControllerResponse) ApiClient.Deserialize(response.Content, typeof(ExampleXmlControllerResponse), response.Headers);
        }
    
        /// <summary>
        /// getExampleXml 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>ExampleXmlControllerResponse</returns>
        public ExampleXmlControllerResponse GetExampleXmlUsingPOST (ExampleXmlPageRequest body)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling GetExampleXmlUsingPOST");
    
            var path = "/example/exampleXml";
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetExampleXmlUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetExampleXmlUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ExampleXmlControllerResponse) ApiClient.Deserialize(response.Content, typeof(ExampleXmlControllerResponse), response.Headers);
        }
    
        /// <summary>
        /// parseResponse 
        /// </summary>
        /// <param name="body">request</param>
        /// <returns>ExampleXmlControllerResponse</returns>
        public ExampleXmlControllerResponse ParseResponseUsingPOST (ExampleXmlPageRequest body)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling ParseResponseUsingPOST");
    
            var path = "/example/parseResponse";
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
                throw new ApiException ((int)response.StatusCode, "Error calling ParseResponseUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling ParseResponseUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ExampleXmlControllerResponse) ApiClient.Deserialize(response.Content, typeof(ExampleXmlControllerResponse), response.Headers);
        }
    
    }
}
