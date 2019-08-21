using Mozu.Inventory.Contracts.Model;
using Mozu.Swagger.Client;
using RestSharp;
using System.Collections.Generic;

namespace Mozu.Inventory.Contracts.Api
{
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public interface ITenantControllerApi
    {
        /// <summary>
        ///  Clones a tenant
        /// </summary>
        /// <param name="body">Request to clone a tenant</param>
        /// <returns>int?</returns>
        object CloneTenant(CloneTenantRequest body);
        /// <summary>
        ///  Creates a tenant
        /// </summary>
        /// <param name="body">Request to create a tenant</param>
        /// <returns>int?</returns>
        object CreateTenant(CreateTenantRequest body);
        /// <summary>
        ///  Deletes a tenant
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>bool?</returns>
        bool? DeleteTenant(int? xVolTenant);
    }

    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class TenantControllerApi : ITenantControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="TenantControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public TenantControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
            {
                ApiClient = Configuration.DefaultApiClient;
            }
            else
            {
                ApiClient = apiClient;
            }
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="TenantControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public TenantControllerApi(string basePath)
        {
            ApiClient = new ApiClient(basePath);
        }

        /// <summary>
        /// Sets the base path of the API client.
        /// </summary>
        /// <param name="basePath">The base path</param>
        /// <value>The base path</value>
        public void SetBasePath(string basePath)
        {
            ApiClient.BasePath = basePath;
        }

        /// <summary>
        /// Gets the base path of the API client.
        /// </summary>
        /// <param name="basePath">The base path</param>
        /// <value>The base path</value>
        public string GetBasePath(string basePath)
        {
            return ApiClient.BasePath;
        }

        /// <summary>
        /// Gets or sets the API client.
        /// </summary>
        /// <value>An instance of the ApiClient</value>
        public ApiClient ApiClient { get; set; }

        /// <summary>
        ///  Clones a tenant
        /// </summary>
        /// <param name="body">Request to clone a tenant</param>
        /// <returns>int?</returns>
        public object CloneTenant(CloneTenantRequest body)
        {
            // verify the required parameter 'body' is set
            if (body == null)
            {
                throw new ApiException(400, "Missing required parameter 'body' when calling CloneTenant");
            }

            var path = "/v1/tenant/clone";
            path = path.Replace("{format}", "json");

            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;

            postBody = ApiClient.Serialize(body); // http body (model) parameter

            // authentication setting, if any
            string[] authSettings = new string[] { };

            // make the HTTP request
            IRestResponse response = (IRestResponse)ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);

            if (((int)response.StatusCode) >= 400)
            {
                throw new ApiException((int)response.StatusCode, "Error calling CloneTenant: " + response.Content, response.Content);
            }
            else if (response.StatusCode == 0)
            {
                throw new ApiException((int)response.StatusCode, "Error calling CloneTenant: " + response.ErrorMessage, response.ErrorMessage);
            }

            return ApiClient.Deserialize(response.Content, typeof(object), response.Headers);
        }

        /// <summary>
        ///  Creates a tenant
        /// </summary>
        /// <param name="body">Request to create a tenant</param>
        /// <returns>int?</returns>
        public object CreateTenant(CreateTenantRequest body)
        {
            // verify the required parameter 'body' is set
            if (body == null)
            {
                throw new ApiException(400, "Missing required parameter 'body' when calling CreateTenant");
            }

            var path = "/v1/tenant/";
            path = path.Replace("{format}", "json");

            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;

            postBody = ApiClient.Serialize(body); // http body (model) parameter

            // authentication setting, if any
            string[] authSettings = new string[] { };
            // make the HTTP request
            IRestResponse response = (IRestResponse)ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);

            if (((int)response.StatusCode) >= 400)
            {
                throw new ApiException((int)response.StatusCode, "Error calling CreateTenant: " + response.Content, response.Content);
            }
            else if (response.StatusCode == 0)
            {
                throw new ApiException((int)response.StatusCode, "Error calling CreateTenant: " + response.ErrorMessage, response.ErrorMessage);
            }

            return ApiClient.Deserialize(response.Content, typeof(object), response.Headers);
        }

        /// <summary>
        ///  Deletes a tenant
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>bool?</returns>
        public bool? DeleteTenant(int? xVolTenant)
        {
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null)
            {
                throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling DeleteTenant");
            }

            var path = "/v1/tenant";
            path = path.Replace("{format}", "json");

            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;

            if (xVolTenant != null)
            {
                headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
            }

            // authentication setting, if any
            string[] authSettings = new string[] { };

            // make the HTTP request
            IRestResponse response = (IRestResponse)ApiClient.CallApi(path, Method.DELETE, queryParams, postBody, headerParams, formParams, fileParams, authSettings);

            if (((int)response.StatusCode) >= 400)
            {
                throw new ApiException((int)response.StatusCode, "Error calling DeleteTenant: " + response.Content, response.Content);
            }
            else if (response.StatusCode == 0)
            {
                throw new ApiException((int)response.StatusCode, "Error calling DeleteTenant: " + response.ErrorMessage, response.ErrorMessage);
            }

            return (bool?)ApiClient.Deserialize(response.Content, typeof(bool?), response.Headers);
        }

    }
}
