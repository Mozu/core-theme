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
    public interface IAuditControllerApi
    {
        /// <summary>
        ///  Cancel an audit
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="auditId">Id of audit</param>
        /// <returns>BaseResponse</returns>
        BaseResponse CancelAudit (int? xVolTenant, long? auditId);
        /// <summary>
        ///  Complete an audit
        /// </summary>
        /// <param name="body">Request to load bin inventory</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="auditId">Id of audit</param>
        /// <returns>bool?</returns>
        bool? CompleteAudit (LoadBinInventoryRequest body, int? xVolTenant, long? auditId);
        /// <summary>
        ///  Create a new audit
        /// </summary>
        /// <param name="body">Request to create an audit</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>int?</returns>
        int? CreateAudit (CreateAuditRequest body, int? xVolTenant);
        /// <summary>
        ///  Get details of the specified audit
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="auditId">Id of audit</param>
        /// <returns>Audit</returns>
        Audit GetAuditDetails (int? xVolTenant, long? auditId);
        /// <summary>
        ///  Get all of the open   audits at the given location
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="locationId">Id of location</param>
        /// <returns>List&lt;Audit&gt;</returns>
        List<Audit> GetOpenAudits (int? xVolTenant, long? locationId);
        /// <summary>
        ///  Search for a list of Audits
        /// </summary>
        /// <param name="body">Request to search audits</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>AuditSearchResponse</returns>
        AuditSearchResponse SearchAudits (AuditSearchRequest body, int? xVolTenant);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class AuditControllerApi : IAuditControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AuditControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public AuditControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="AuditControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public AuditControllerApi(string basePath)
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
        ///  Cancel an audit
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="auditId">Id of audit</param>
        /// <returns>BaseResponse</returns>
        public BaseResponse CancelAudit (int? xVolTenant, long? auditId)
        {
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling CancelAudit");
            // verify the required parameter 'auditId' is set
            if (auditId == null) throw new ApiException(400, "Missing required parameter 'auditId' when calling CancelAudit");
    
            var path = "/v1/audit/{audit_id}/cancel/";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "audit_id" + "}", ApiClient.ParameterToString(auditId));
    
            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;
    
                         if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter

            // authentication setting, if any
            string[] authSettings = new string[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling CancelAudit: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling CancelAudit: " + response.ErrorMessage, response.ErrorMessage);
    
            return (BaseResponse) ApiClient.Deserialize(response.Content, typeof(BaseResponse), response.Headers);
        }
    
        /// <summary>
        ///  Complete an audit
        /// </summary>
        /// <param name="body">Request to load bin inventory</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="auditId">Id of audit</param>
        /// <returns>bool?</returns>
        public bool? CompleteAudit (LoadBinInventoryRequest body, int? xVolTenant, long? auditId)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling CompleteAudit");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling CompleteAudit");
            // verify the required parameter 'auditId' is set
            if (auditId == null) throw new ApiException(400, "Missing required parameter 'auditId' when calling CompleteAudit");
    
            var path = "/v1/audit/{audit_id}/complete/";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "audit_id" + "}", ApiClient.ParameterToString(auditId));
    
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
                throw new ApiException ((int)response.StatusCode, "Error calling CompleteAudit: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling CompleteAudit: " + response.ErrorMessage, response.ErrorMessage);
    
            return (bool?) ApiClient.Deserialize(response.Content, typeof(bool?), response.Headers);
        }
    
        /// <summary>
        ///  Create a new audit
        /// </summary>
        /// <param name="body">Request to create an audit</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>int?</returns>
        public int? CreateAudit (CreateAuditRequest body, int? xVolTenant)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling CreateAudit");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling CreateAudit");
    
            var path = "/v1/audit/";
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
                throw new ApiException ((int)response.StatusCode, "Error calling CreateAudit: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling CreateAudit: " + response.ErrorMessage, response.ErrorMessage);
    
            return (int?) ApiClient.Deserialize(response.Content, typeof(int?), response.Headers);
        }
    
        /// <summary>
        ///  Get details of the specified audit
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="auditId">Id of audit</param>
        /// <returns>Audit</returns>
        public Audit GetAuditDetails (int? xVolTenant, long? auditId)
        {
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling GetAuditDetails");
            // verify the required parameter 'auditId' is set
            if (auditId == null) throw new ApiException(400, "Missing required parameter 'auditId' when calling GetAuditDetails");
    
            var path = "/v1/audit/{audit_id}/";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "audit_id" + "}", ApiClient.ParameterToString(auditId));
    
            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;
    
                         if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter

            // authentication setting, if any
            string[] authSettings = new string[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetAuditDetails: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetAuditDetails: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Audit) ApiClient.Deserialize(response.Content, typeof(Audit), response.Headers);
        }
    
        /// <summary>
        ///  Get all of the open   audits at the given location
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="locationId">Id of location</param>
        /// <returns>List&lt;Audit&gt;</returns>
        public List<Audit> GetOpenAudits (int? xVolTenant, long? locationId)
        {
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling GetOpenAudits");
            // verify the required parameter 'locationId' is set
            if (locationId == null) throw new ApiException(400, "Missing required parameter 'locationId' when calling GetOpenAudits");
    
            var path = "/v1/audit/allOpen/{location_code}/";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "location_id" + "}", ApiClient.ParameterToString(locationId));
    
            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;
    
                         if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter

            // authentication setting, if any
            string[] authSettings = new string[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetOpenAudits: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetOpenAudits: " + response.ErrorMessage, response.ErrorMessage);
    
            return (List<Audit>) ApiClient.Deserialize(response.Content, typeof(List<Audit>), response.Headers);
        }
    
        /// <summary>
        ///  Search for a list of Audits
        /// </summary>
        /// <param name="body">Request to search audits</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>AuditSearchResponse</returns>
        public AuditSearchResponse SearchAudits (AuditSearchRequest body, int? xVolTenant)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling SearchAudits");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling SearchAudits");
    
            var path = "/v1/audit/search/";
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
                throw new ApiException ((int)response.StatusCode, "Error calling SearchAudits: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling SearchAudits: " + response.ErrorMessage, response.ErrorMessage);
    
            return (AuditSearchResponse) ApiClient.Deserialize(response.Content, typeof(AuditSearchResponse), response.Headers);
        }
    
    }
}
