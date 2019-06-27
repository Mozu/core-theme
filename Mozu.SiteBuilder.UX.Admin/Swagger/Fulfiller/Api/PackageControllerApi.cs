using System;
using System.Collections.Generic;
using RestSharp;
using IO.Swagger.Client;
using Swagger.Fulfiller.Model;

namespace Swagger.Fulfiller.Api
{
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public interface IPackageControllerApi
    {
        /// <summary>
        /// deletePackage 
        /// </summary>
        /// <param name="id">id</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>Object</returns>
        Object DeletePackageUsingDELETE (string id, int? xVolTenant, int? xVolSite);
        /// <summary>
        /// getPackage 
        /// </summary>
        /// <param name="id">id</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourcePackage</returns>
        ResourcePackage GetPackageUsingGET (string id, int? xVolTenant, int? xVolSite);
        /// <summary>
        /// getPackages 
        /// </summary>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourcesResourcePackage</returns>
        ResourcesResourcePackage GetPackagesUsingGET (int? xVolTenant, int? xVolSite);
        /// <summary>
        /// getPackages 
        /// </summary>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourcesResourcePackage</returns>
        ResourcesResourcePackage GetPackagesUsingGET1 (int? xVolTenant, int? xVolSite);
        /// <summary>
        /// newPackage 
        /// </summary>
        /// <param name="body">newPackage</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>Object</returns>
        Object NewPackageUsingPOST (Package body, int? xVolTenant, int? xVolSite);
        /// <summary>
        /// newPackage 
        /// </summary>
        /// <param name="body">newPackage</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>Object</returns>
        Object NewPackageUsingPOST1 (Package body, int? xVolTenant, int? xVolSite);
        /// <summary>
        /// replacePackage 
        /// </summary>
        /// <param name="body">newPackage</param>
        /// <param name="xVolTenant"></param>
        /// <param name="id">id</param>
        /// <param name="xVolSite"></param>
        /// <returns>Object</returns>
        Object ReplacePackageUsingPUT (Package body, int? xVolTenant, string id, int? xVolSite);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class PackageControllerApi : IPackageControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PackageControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public PackageControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="PackageControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public PackageControllerApi(String basePath)
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
        /// deletePackage 
        /// </summary>
        /// <param name="id">id</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>Object</returns>
        public Object DeletePackageUsingDELETE (string id, int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'id' is set
            if (id == null) throw new ApiException(400, "Missing required parameter 'id' when calling DeletePackageUsingDELETE");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling DeletePackageUsingDELETE");
    
            var path = "/packages/{id}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "id" + "}", ApiClient.ParameterToString(id));
    
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
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.DELETE, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling DeletePackageUsingDELETE: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling DeletePackageUsingDELETE: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Object) ApiClient.Deserialize(response.Content, typeof(Object), response.Headers);
        }
    
        /// <summary>
        /// getPackage 
        /// </summary>
        /// <param name="id">id</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourcePackage</returns>
        public ResourcePackage GetPackageUsingGET (string id, int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'id' is set
            if (id == null) throw new ApiException(400, "Missing required parameter 'id' when calling GetPackageUsingGET");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling GetPackageUsingGET");
    
            var path = "/packages/{id}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "id" + "}", ApiClient.ParameterToString(id));
    
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetPackageUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetPackageUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ResourcePackage) ApiClient.Deserialize(response.Content, typeof(ResourcePackage), response.Headers);
        }
    
        /// <summary>
        /// getPackages 
        /// </summary>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourcesResourcePackage</returns>
        public ResourcesResourcePackage GetPackagesUsingGET (int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling GetPackagesUsingGET");
    
            var path = "/packages";
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetPackagesUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetPackagesUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ResourcesResourcePackage) ApiClient.Deserialize(response.Content, typeof(ResourcesResourcePackage), response.Headers);
        }
    
        /// <summary>
        /// getPackages 
        /// </summary>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>ResourcesResourcePackage</returns>
        public ResourcesResourcePackage GetPackagesUsingGET1 (int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling GetPackagesUsingGET1");
    
            var path = "/packages/";
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetPackagesUsingGET1: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetPackagesUsingGET1: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ResourcesResourcePackage) ApiClient.Deserialize(response.Content, typeof(ResourcesResourcePackage), response.Headers);
        }
    
        /// <summary>
        /// newPackage 
        /// </summary>
        /// <param name="body">newPackage</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>Object</returns>
        public Object NewPackageUsingPOST (Package body, int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling NewPackageUsingPOST");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling NewPackageUsingPOST");
    
            var path = "/packages";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling NewPackageUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling NewPackageUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Object) ApiClient.Deserialize(response.Content, typeof(Object), response.Headers);
        }
    
        /// <summary>
        /// newPackage 
        /// </summary>
        /// <param name="body">newPackage</param>
        /// <param name="xVolTenant"></param>
        /// <param name="xVolSite"></param>
        /// <returns>Object</returns>
        public Object NewPackageUsingPOST1 (Package body, int? xVolTenant, int? xVolSite)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling NewPackageUsingPOST1");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling NewPackageUsingPOST1");
    
            var path = "/packages/";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling NewPackageUsingPOST1: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling NewPackageUsingPOST1: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Object) ApiClient.Deserialize(response.Content, typeof(Object), response.Headers);
        }
    
        /// <summary>
        /// replacePackage 
        /// </summary>
        /// <param name="body">newPackage</param>
        /// <param name="xVolTenant"></param>
        /// <param name="id">id</param>
        /// <param name="xVolSite"></param>
        /// <returns>Object</returns>
        public Object ReplacePackageUsingPUT (Package body, int? xVolTenant, string id, int? xVolSite)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling ReplacePackageUsingPUT");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling ReplacePackageUsingPUT");
            // verify the required parameter 'id' is set
            if (id == null) throw new ApiException(400, "Missing required parameter 'id' when calling ReplacePackageUsingPUT");
    
            var path = "/packages/{id}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "id" + "}", ApiClient.ParameterToString(id));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                         if (xVolSite != null) headerParams.Add("x-vol-site", ApiClient.ParameterToString(xVolSite)); // header parameter
 if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter
                        postBody = ApiClient.Serialize(body); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.PUT, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling ReplacePackageUsingPUT: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling ReplacePackageUsingPUT: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Object) ApiClient.Deserialize(response.Content, typeof(Object), response.Headers);
        }
    
    }
}
