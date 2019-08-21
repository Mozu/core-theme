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
    public interface IJobControllerApi
    {
        /// <summary>
        ///  Get the specified job
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="jobID">Id of bin to get</param>
        /// <returns>JobQueueResponse</returns>
        JobQueueResponse GetJob (int? xVolTenant, long? jobID);
        /// <summary>
        ///  Get the requested jobs
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="locationCode">Tenant specified unique Identifier of the owning location</param>
        /// <param name="limit">The maximum number of results to return, defaults to 100 for most</param>
        /// <param name="owner">User that owns the job</param>
        /// <param name="types">Type of the Job Queue Request</param>
        /// <param name="originalFilename">The full name of the file that was picked up at the secure droppoint server before being split up by location.</param>
        /// <returns>List&lt;JobQueueResponse&gt;</returns>
        List<JobQueueResponse> GetJobs (int? xVolTenant, string locationCode, int? limit, string owner, List<string> types, string originalFilename);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class JobControllerApi : IJobControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="JobControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public JobControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="JobControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public JobControllerApi(string basePath)
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
        ///  Get the specified job
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="jobID">Id of bin to get</param>
        /// <returns>JobQueueResponse</returns>
        public JobQueueResponse GetJob (int? xVolTenant, long? jobID)
        {
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling GetJob");
            // verify the required parameter 'jobID' is set
            if (jobID == null) throw new ApiException(400, "Missing required parameter 'jobID' when calling GetJob");
    
            var path = "/v1/queue/{jobID}/";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "jobID" + "}", ApiClient.ParameterToString(jobID));
    
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetJob: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetJob: " + response.ErrorMessage, response.ErrorMessage);
    
            return (JobQueueResponse) ApiClient.Deserialize(response.Content, typeof(JobQueueResponse), response.Headers);
        }
    
        /// <summary>
        ///  Get the requested jobs
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="locationCode">Tenant specified unique Identifier of the owning location</param>
        /// <param name="limit">The maximum number of results to return, defaults to 100 for most</param>
        /// <param name="owner">User that owns the job</param>
        /// <param name="types">Type of the Job Queue Request</param>
        /// <param name="originalFilename">The full name of the file that was picked up at the secure droppoint server before being split up by location.</param>
        /// <returns>List&lt;JobQueueResponse&gt;</returns>
        public List<JobQueueResponse> GetJobs (int? xVolTenant, string locationCode, int? limit, string owner, List<string> types, string originalFilename)
        {
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling GetJobs");
    
            var path = "/v1/queue/";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;
    
             if (locationCode != null) queryParams.Add("locationCode", ApiClient.ParameterToString(locationCode)); // query parameter
 if (limit != null) queryParams.Add("limit", ApiClient.ParameterToString(limit)); // query parameter
 if (owner != null) queryParams.Add("owner", ApiClient.ParameterToString(owner)); // query parameter
 if (types != null) queryParams.Add("types", ApiClient.ParameterToString(types)); // query parameter
 if (originalFilename != null) queryParams.Add("originalFilename", ApiClient.ParameterToString(originalFilename)); // query parameter
             if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter

            // authentication setting, if any
            string[] authSettings = new string[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetJobs: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetJobs: " + response.ErrorMessage, response.ErrorMessage);
    
            return (List<JobQueueResponse>) ApiClient.Deserialize(response.Content, typeof(List<JobQueueResponse>), response.Headers);
        }
    
    }
}
