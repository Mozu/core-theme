using System;
using System.Collections.Generic;
using RestSharp;
using Mozu.Swagger.Client;
using Mozu.Inventory.Contracts.Model;

namespace Mozu.Inventory.Contracts.Api
{
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public interface IExportInventoryControllerApi
    {
        /// <summary>
        ///  Create an Export Settings
        /// </summary>
        /// <param name="body">Request to create a new Export Settings</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>string</returns>
        string CreateExportSettings (CreateExportSettingsRequest body, int? xVolTenant);
        /// <summary>
        ///  Create an Export Settings FTP
        /// </summary>
        /// <param name="body">Request to create a new Export Settings FTP</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>string</returns>
        string CreateExportSettingsFTP (CreateExportSettingsFTPRequest body, int? xVolTenant);
        /// <summary>
        ///  Create an Export Settings S3
        /// </summary>
        /// <param name="body">Request to create a new Export Settings S3</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>int?</returns>
        int? CreateExportSettingsS3 (CreateExportSettingsS3Request body, int? xVolTenant);
        /// <summary>
        ///  Deletes an Export Settings
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="exportSettingsName">Export Settings Name</param>
        /// <returns>int?</returns>
        int? DeleteExportSettings (int? xVolTenant, string exportSettingsName);
        /// <summary>
        ///  Deletes an Export Settings FTP. Not specifying exportSettingsFTPID deletes ALL ftp settings for the specified export settings.
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="exportSettingsName">Export Settings Name</param>
        /// <param name="exportSettingsFTPName">Export Settings FTP Name</param>
        /// <returns>ModelInt</returns>
        //ModelInt DeleteExportSettingsFTP (int? xVolTenant, string exportSettingsName, string exportSettingsFTPName);
        /// <summary>
        ///  Deletes an Export Settings S3. Not specifying exportSettingsS3ID deletes ALL s3 settings for the specified export settings.
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="exportSettingsName">Export Settings Name</param>
        /// <param name="exportSettingsS3Name">Export Settings S3 Name</param>
        /// <returns>bool?</returns>
        bool? DeleteExportSettingsS3 (int? xVolTenant, string exportSettingsName, string exportSettingsS3Name);
        /// <summary>
        ///  Run Export Settings Job
        /// </summary>
        /// <param name="body">Request to run an inventory export</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>ExportInventoryResponse</returns>
        ExportInventoryResponse RunExport (ExportInventoryRequest body, int? xVolTenant);
        /// <summary>
        ///  Update an Export Settings
        /// </summary>
        /// <param name="body">Request to update an existing Export Settings</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>UpdateExportSettingsResponse</returns>
        UpdateExportSettingsResponse UpdateExportSettings (UpdateExportSettingsRequest body, int? xVolTenant);
        /// <summary>
        ///  Update an Export Settings FTP
        /// </summary>
        /// <param name="body">Request to update an existing Export Settings FTP</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>UpdateExportSettingsFTPResponse</returns>
        UpdateExportSettingsFTPResponse UpdateExportSettingsFTP (UpdateExportSettingsFTPRequest body, int? xVolTenant);
        /// <summary>
        ///  Update an Export Settings S3
        /// </summary>
        /// <param name="body">Request to update an existing Export Settings S3</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>UpdateExportSettingsS3Response</returns>
        UpdateExportSettingsS3Response UpdateExportSettingsS3 (UpdateExportSettingsS3Request body, int? xVolTenant);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class ExportInventoryControllerApi : IExportInventoryControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ExportInventoryControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public ExportInventoryControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="ExportInventoryControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public ExportInventoryControllerApi(string basePath)
        {
            this.ApiClient = new ApiClient(basePath);
        }
    
        /// <summary>
        /// Sets the base path of the API client.
        /// </summary>
        /// <param name="basePath">The base path</param>
        /// <value>The base path</value>
        public void SetBasePath(string basePath)
        {
            this.ApiClient.BasePath = basePath;
        }
    
        /// <summary>
        /// Gets the base path of the API client.
        /// </summary>
        /// <param name="basePath">The base path</param>
        /// <value>The base path</value>
        public string GetBasePath(string basePath)
        {
            return this.ApiClient.BasePath;
        }
    
        /// <summary>
        /// Gets or sets the API client.
        /// </summary>
        /// <value>An instance of the ApiClient</value>
        public ApiClient ApiClient {get; set;}
    
        /// <summary>
        ///  Create an Export Settings
        /// </summary>
        /// <param name="body">Request to create a new Export Settings</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>string</returns>
        public string CreateExportSettings (CreateExportSettingsRequest body, int? xVolTenant)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling CreateExportSettings");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling CreateExportSettings");
    
            var path = "/v1/export/create";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;
    
                         if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter

            // authentication setting, if any
            string[] authSettings = new string[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling CreateExportSettings: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling CreateExportSettings: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
        /// <summary>
        ///  Create an Export Settings FTP
        /// </summary>
        /// <param name="body">Request to create a new Export Settings FTP</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>string</returns>
        public string CreateExportSettingsFTP (CreateExportSettingsFTPRequest body, int? xVolTenant)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling CreateExportSettingsFTP");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling CreateExportSettingsFTP");
    
            var path = "/v1/export/ftp/create";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;
    
                         if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter

            // authentication setting, if any
            string[] authSettings = new string[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling CreateExportSettingsFTP: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling CreateExportSettingsFTP: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
        /// <summary>
        ///  Create an Export Settings S3
        /// </summary>
        /// <param name="body">Request to create a new Export Settings S3</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>int?</returns>
        public int? CreateExportSettingsS3 (CreateExportSettingsS3Request body, int? xVolTenant)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling CreateExportSettingsS3");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling CreateExportSettingsS3");
    
            var path = "/v1/export/s3/create";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;
    
                         if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter

            // authentication setting, if any
            string[] authSettings = new string[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling CreateExportSettingsS3: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling CreateExportSettingsS3: " + response.ErrorMessage, response.ErrorMessage);
    
            return (int?) ApiClient.Deserialize(response.Content, typeof(int?), response.Headers);
        }
    
        /// <summary>
        ///  Deletes an Export Settings
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="exportSettingsName">Export Settings Name</param>
        /// <returns>int?</returns>
        public int? DeleteExportSettings (int? xVolTenant, string exportSettingsName)
        {
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling DeleteExportSettings");
            // verify the required parameter 'exportSettingsName' is set
            if (exportSettingsName == null) throw new ApiException(400, "Missing required parameter 'exportSettingsName' when calling DeleteExportSettings");
    
            var path = "/v1/export/{exportSettingsName}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "exportSettingsName" + "}", ApiClient.ParameterToString(exportSettingsName));
    
            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;
    
                         if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter

            // authentication setting, if any
            string[] authSettings = new string[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.DELETE, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteExportSettings: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteExportSettings: " + response.ErrorMessage, response.ErrorMessage);
    
            return (int?) ApiClient.Deserialize(response.Content, typeof(int?), response.Headers);
        }
    
        /// <summary>
        ///  Deletes an Export Settings FTP. Not specifying exportSettingsFTPID deletes ALL ftp settings for the specified export settings.
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="exportSettingsName">Export Settings Name</param>
        /// <param name="exportSettingsFTPName">Export Settings FTP Name</param>
        /// <returns>ModelInt</returns>
//        public ModelInt DeleteExportSettingsFTP (int? xVolTenant, string exportSettingsName, string exportSettingsFTPName)
//        {
//            // verify the required parameter 'xVolTenant' is set
//            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling DeleteExportSettingsFTP");
//            // verify the required parameter 'exportSettingsName' is set
//            if (exportSettingsName == null) throw new ApiException(400, "Missing required parameter 'exportSettingsName' when calling DeleteExportSettingsFTP");
//            // verify the required parameter 'exportSettingsFTPName' is set
//            if (exportSettingsFTPName == null) throw new ApiException(400, "Missing required parameter 'exportSettingsFTPName' when calling DeleteExportSettingsFTP");
    
//            var path = "/v1/export/ftp/{exportSettingsName}/{exportSettingsFTPName}";
//            path = path.Replace("{format}", "json");
//            path = path.Replace("{" + "exportSettingsName" + "}", ApiClient.ParameterToString(exportSettingsName));
//path = path.Replace("{" + "exportSettingsFTPName" + "}", ApiClient.ParameterToString(exportSettingsFTPName));
    
//            var queryParams = new Dictionary<String, String>();
//            var headerParams = new Dictionary<String, String>();
//            var formParams = new Dictionary<String, String>();
//            var fileParams = new Dictionary<String, FileParameter>();
//            String postBody = null;
    
//                         if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                            
//            // authentication setting, if any
//            String[] authSettings = new String[] {  };
    
//            // make the HTTP request
//            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.DELETE, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
//            if (((int)response.StatusCode) >= 400)
//                throw new ApiException ((int)response.StatusCode, "Error calling DeleteExportSettingsFTP: " + response.Content, response.Content);
//            else if (((int)response.StatusCode) == 0)
//                throw new ApiException ((int)response.StatusCode, "Error calling DeleteExportSettingsFTP: " + response.ErrorMessage, response.ErrorMessage);
    
//            return (ModelInt) ApiClient.Deserialize(response.Content, typeof(ModelInt), response.Headers);
//        }
    
        /// <summary>
        ///  Deletes an Export Settings S3. Not specifying exportSettingsS3ID deletes ALL s3 settings for the specified export settings.
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="exportSettingsName">Export Settings Name</param>
        /// <param name="exportSettingsS3Name">Export Settings S3 Name</param>
        /// <returns>bool?</returns>
        public bool? DeleteExportSettingsS3 (int? xVolTenant, string exportSettingsName, string exportSettingsS3Name)
        {
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling DeleteExportSettingsS3");
            // verify the required parameter 'exportSettingsName' is set
            if (exportSettingsName == null) throw new ApiException(400, "Missing required parameter 'exportSettingsName' when calling DeleteExportSettingsS3");
            // verify the required parameter 'exportSettingsS3Name' is set
            if (exportSettingsS3Name == null) throw new ApiException(400, "Missing required parameter 'exportSettingsS3Name' when calling DeleteExportSettingsS3");
    
            var path = "/v1/export/s3/{exportSettingsName}/{exportSettingsS3Name}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "exportSettingsName" + "}", ApiClient.ParameterToString(exportSettingsName));
path = path.Replace("{" + "exportSettingsS3Name" + "}", ApiClient.ParameterToString(exportSettingsS3Name));
    
            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;
    
                         if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter

            // authentication setting, if any
            string[] authSettings = new string[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.DELETE, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteExportSettingsS3: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteExportSettingsS3: " + response.ErrorMessage, response.ErrorMessage);
    
            return (bool?) ApiClient.Deserialize(response.Content, typeof(bool?), response.Headers);
        }
    
        /// <summary>
        ///  Run Export Settings Job
        /// </summary>
        /// <param name="body">Request to run an inventory export</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>ExportInventoryResponse</returns>
        public ExportInventoryResponse RunExport (ExportInventoryRequest body, int? xVolTenant)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling RunExport");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling RunExport");
    
            var path = "/v1/export/";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;
    
                         if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter

            // authentication setting, if any
            string[] authSettings = new string[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling RunExport: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling RunExport: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ExportInventoryResponse) ApiClient.Deserialize(response.Content, typeof(ExportInventoryResponse), response.Headers);
        }
    
        /// <summary>
        ///  Update an Export Settings
        /// </summary>
        /// <param name="body">Request to update an existing Export Settings</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>UpdateExportSettingsResponse</returns>
        public UpdateExportSettingsResponse UpdateExportSettings (UpdateExportSettingsRequest body, int? xVolTenant)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling UpdateExportSettings");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling UpdateExportSettings");
    
            var path = "/v1/export/update";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;
    
                         if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter

            // authentication setting, if any
            string[] authSettings = new string[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling UpdateExportSettings: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling UpdateExportSettings: " + response.ErrorMessage, response.ErrorMessage);
    
            return (UpdateExportSettingsResponse) ApiClient.Deserialize(response.Content, typeof(UpdateExportSettingsResponse), response.Headers);
        }
    
        /// <summary>
        ///  Update an Export Settings FTP
        /// </summary>
        /// <param name="body">Request to update an existing Export Settings FTP</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>UpdateExportSettingsFTPResponse</returns>
        public UpdateExportSettingsFTPResponse UpdateExportSettingsFTP (UpdateExportSettingsFTPRequest body, int? xVolTenant)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling UpdateExportSettingsFTP");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling UpdateExportSettingsFTP");
    
            var path = "/v1/export/ftp/update";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;
    
                         if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter

            // authentication setting, if any
            string[] authSettings = new string[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling UpdateExportSettingsFTP: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling UpdateExportSettingsFTP: " + response.ErrorMessage, response.ErrorMessage);
    
            return (UpdateExportSettingsFTPResponse) ApiClient.Deserialize(response.Content, typeof(UpdateExportSettingsFTPResponse), response.Headers);
        }
    
        /// <summary>
        ///  Update an Export Settings S3
        /// </summary>
        /// <param name="body">Request to update an existing Export Settings S3</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>UpdateExportSettingsS3Response</returns>
        public UpdateExportSettingsS3Response UpdateExportSettingsS3 (UpdateExportSettingsS3Request body, int? xVolTenant)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling UpdateExportSettingsS3");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling UpdateExportSettingsS3");
    
            var path = "/v1/export/s3/update";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;
    
                         if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter

            // authentication setting, if any
            string[] authSettings = new string[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling UpdateExportSettingsS3: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling UpdateExportSettingsS3: " + response.ErrorMessage, response.ErrorMessage);
    
            return (UpdateExportSettingsS3Response) ApiClient.Deserialize(response.Content, typeof(UpdateExportSettingsS3Response), response.Headers);
        }
    
    }
}
