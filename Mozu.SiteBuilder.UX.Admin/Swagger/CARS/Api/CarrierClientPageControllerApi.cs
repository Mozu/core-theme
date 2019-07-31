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
    public interface ICarrierClientPageControllerApi
    {
        /// <summary>
        /// addOrUpdateSchema 
        /// </summary>
        /// <param name="carrier"></param>
        /// <param name="configs"></param>
        /// <param name="operationType"></param>
        /// <param name="schema"></param>
        /// <param name="tenantID"></param>
        /// <param name="valid"></param>
        /// <returns>AjaxResponse</returns>
        AjaxResponse AddOrUpdateSchemaUsingPOST (string carrier, string configs, string operationType, string schema, int? tenantID, bool? valid);
        /// <summary>
        /// configExport 
        /// </summary>
        /// <param name="body">tenantID</param>
        /// <returns></returns>
        void ConfigExportUsingGET (int? body);
        /// <summary>
        /// configImport 
        /// </summary>
        /// <param name="file"></param>
        /// <param name="carrier">carrier</param>
        /// <param name="operationType">operationType</param>
        /// <param name="tenantID">tenantID</param>
        /// <returns>AjaxResponse</returns>
        AjaxResponse ConfigImportUsingPOST (System.IO.Stream file, string carrier, string operationType, int? tenantID);
        /// <summary>
        /// getHistoryContents 
        /// </summary>
        /// <param name="body">schemaHistoryID</param>
        /// <returns>string</returns>
        string GetHistoryContentsUsingGET (long? body);
        /// <summary>
        /// getHistoryList 
        /// </summary>
        /// <param name="body">tenantID</param>
        /// <returns>Dictionary&lt;string, string&gt;</returns>
        Dictionary<string, string> GetHistoryListUsingGET (int? body);
        /// <summary>
        /// getSchema 
        /// </summary>
        /// <param name="carrier">carrier</param>
        /// <param name="operationType">operationType</param>
        /// <param name="outputType">outputType</param>
        /// <param name="tenantID">tenantID</param>
        /// <returns>Dictionary&lt;string, string&gt;</returns>
        Dictionary<string, string> GetSchemaUsingGET (string carrier, string operationType, string outputType, int? tenantID);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class CarrierClientPageControllerApi : ICarrierClientPageControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="CarrierClientPageControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public CarrierClientPageControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="CarrierClientPageControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public CarrierClientPageControllerApi(String basePath)
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
        /// addOrUpdateSchema 
        /// </summary>
        /// <param name="carrier"></param>
        /// <param name="configs"></param>
        /// <param name="operationType"></param>
        /// <param name="schema"></param>
        /// <param name="tenantID"></param>
        /// <param name="valid"></param>
        /// <returns>AjaxResponse</returns>
        public AjaxResponse AddOrUpdateSchemaUsingPOST (string carrier, string configs, string operationType, string schema, int? tenantID, bool? valid)
        {
    
            var path = "/addOrUpdateSchema";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (carrier != null) queryParams.Add("carrier", ApiClient.ParameterToString(carrier)); // query parameter
 if (configs != null) queryParams.Add("configs", ApiClient.ParameterToString(configs)); // query parameter
 if (operationType != null) queryParams.Add("operationType", ApiClient.ParameterToString(operationType)); // query parameter
 if (schema != null) queryParams.Add("schema", ApiClient.ParameterToString(schema)); // query parameter
 if (tenantID != null) queryParams.Add("tenantID", ApiClient.ParameterToString(tenantID)); // query parameter
 if (valid != null) queryParams.Add("valid", ApiClient.ParameterToString(valid)); // query parameter
                                        
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling AddOrUpdateSchemaUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling AddOrUpdateSchemaUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (AjaxResponse) ApiClient.Deserialize(response.Content, typeof(AjaxResponse), response.Headers);
        }
    
        /// <summary>
        /// configExport 
        /// </summary>
        /// <param name="body">tenantID</param>
        /// <returns></returns>
        public void ConfigExportUsingGET (int? body)
        {
    
            var path = "/addOrUpdateSchema/export";
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
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling ConfigExportUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling ConfigExportUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return;
        }
    
        /// <summary>
        /// configImport 
        /// </summary>
        /// <param name="file"></param>
        /// <param name="carrier">carrier</param>
        /// <param name="operationType">operationType</param>
        /// <param name="tenantID">tenantID</param>
        /// <returns>AjaxResponse</returns>
        public AjaxResponse ConfigImportUsingPOST (System.IO.Stream file, string carrier, string operationType, int? tenantID)
        {
            // verify the required parameter 'file' is set
            if (file == null) throw new ApiException(400, "Missing required parameter 'file' when calling ConfigImportUsingPOST");
            // verify the required parameter 'carrier' is set
            if (carrier == null) throw new ApiException(400, "Missing required parameter 'carrier' when calling ConfigImportUsingPOST");
            // verify the required parameter 'operationType' is set
            if (operationType == null) throw new ApiException(400, "Missing required parameter 'operationType' when calling ConfigImportUsingPOST");
    
            var path = "/addOrUpdateSchema/upload";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (carrier != null) queryParams.Add("carrier", ApiClient.ParameterToString(carrier)); // query parameter
 if (operationType != null) queryParams.Add("operationType", ApiClient.ParameterToString(operationType)); // query parameter
 if (tenantID != null) queryParams.Add("tenantID", ApiClient.ParameterToString(tenantID)); // query parameter
                        if (file != null) fileParams.Add("file", ApiClient.ParameterToFile("file", file));
                
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling ConfigImportUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling ConfigImportUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (AjaxResponse) ApiClient.Deserialize(response.Content, typeof(AjaxResponse), response.Headers);
        }
    
        /// <summary>
        /// getHistoryContents 
        /// </summary>
        /// <param name="body">schemaHistoryID</param>
        /// <returns>string</returns>
        public string GetHistoryContentsUsingGET (long? body)
        {
    
            var path = "/getSchemaHistoryContents";
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
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetHistoryContentsUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetHistoryContentsUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
        /// <summary>
        /// getHistoryList 
        /// </summary>
        /// <param name="body">tenantID</param>
        /// <returns>Dictionary&lt;string, string&gt;</returns>
        public Dictionary<string, string> GetHistoryListUsingGET (int? body)
        {
    
            var path = "/getSchemaHistoryList";
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
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetHistoryListUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetHistoryListUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Dictionary<string, string>) ApiClient.Deserialize(response.Content, typeof(Dictionary<string, string>), response.Headers);
        }
    
        /// <summary>
        /// getSchema 
        /// </summary>
        /// <param name="carrier">carrier</param>
        /// <param name="operationType">operationType</param>
        /// <param name="outputType">outputType</param>
        /// <param name="tenantID">tenantID</param>
        /// <returns>Dictionary&lt;string, string&gt;</returns>
        public Dictionary<string, string> GetSchemaUsingGET (string carrier, string operationType, string outputType, int? tenantID)
        {
    
            var path = "/schemaForTenant";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (carrier != null) queryParams.Add("carrier", ApiClient.ParameterToString(carrier)); // query parameter
 if (operationType != null) queryParams.Add("operationType", ApiClient.ParameterToString(operationType)); // query parameter
 if (outputType != null) queryParams.Add("outputType", ApiClient.ParameterToString(outputType)); // query parameter
 if (tenantID != null) queryParams.Add("tenantID", ApiClient.ParameterToString(tenantID)); // query parameter
                                        
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetSchemaUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetSchemaUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Dictionary<string, string>) ApiClient.Deserialize(response.Content, typeof(Dictionary<string, string>), response.Headers);
        }
    
    }
}
