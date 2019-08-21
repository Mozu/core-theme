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
    public interface IBinControllerApi
    {
        /// <summary>
        ///  Create a bin
        /// </summary>
        /// <param name="body">Request to create a new bin</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>int?</returns>
        int? CreateBin (CreateBinRequest body, int? xVolTenant);
        /// <summary>
        ///  Delete a bin
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="binId">Id of bin to get</param>
        /// <param name="binName">Bin Name</param>
        /// <param name="locationCode">Location Code</param>
        /// <returns>BaseResponse</returns>
        BaseResponse DeleteBin (int? xVolTenant, long? binId, int? binName, string locationCode);
        /// <summary>
        ///  Get a bin
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="binId">Id of bin to get</param>
        /// <returns>Bin</returns>
        Bin GetBin (int? xVolTenant, long? binId);
        /// <summary>
        ///  Get list of bin statuses
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>List&lt;BinStatusModel&gt;</returns>
        List<BinStatusModel> GetBinStatuses (int? xVolTenant);
        /// <summary>
        ///  Get list of bin types
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>List&lt;BinTypeModel&gt;</returns>
        List<BinTypeModel> GetBinTypes (int? xVolTenant);
        /// <summary>
        ///  Get a list of bins
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="locationID">Id of location</param>
        /// <param name="searchTerm">Term to match in bins</param>
        /// <param name="perPage">Results per page</param>
        /// <param name="page">Page to show</param>
        /// <returns>BinResponseModel</returns>
        BinResponseModel GetBins (int? xVolTenant, long? locationID, long? searchTerm, long? perPage, long? page);
        /// <summary>
        ///  Loads bin inventory for designated bins
        /// </summary>
        /// <param name="body">Request to load bin inventory</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>LoadBinInventoryResponse</returns>
        LoadBinInventoryResponse LoadInventory (LoadBinInventoryRequest body, int? xVolTenant);
        /// <summary>
        ///  Search bins for a inventory by bin name or any product identifier
        /// </summary>
        /// <param name="body">Request to allocate inventory</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>BinSearchResponse</returns>
        BinSearchResponse SearchBins (BinSearchRequest body, int? xVolTenant);
        /// <summary>
        ///  Update the designated bin
        /// </summary>
        /// <param name="body">Request to update a bin</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="binId">Id of bin to update</param>
        /// <returns>Bin</returns>
        Bin UpdateBin (UpdateBinRequest body, int? xVolTenant, long? binId);
        /// <summary>
        ///  Update the designated bins
        /// </summary>
        /// <param name="body">Request to update multiple bins</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>UpdateBinsResponse</returns>
        UpdateBinsResponse UpdateBins (UpdateBinsRequest body, int? xVolTenant);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class BinControllerApi : IBinControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="BinControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public BinControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="BinControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public BinControllerApi(string basePath)
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
        ///  Create a bin
        /// </summary>
        /// <param name="body">Request to create a new bin</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>int?</returns>
        public int? CreateBin (CreateBinRequest body, int? xVolTenant)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling CreateBin");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling CreateBin");
    
            var path = "/v1/bin/";
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
                throw new ApiException ((int)response.StatusCode, "Error calling CreateBin: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling CreateBin: " + response.ErrorMessage, response.ErrorMessage);
    
            return (int?) ApiClient.Deserialize(response.Content, typeof(int?), response.Headers);
        }
    
        /// <summary>
        ///  Delete a bin
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="binId">Id of bin to get</param>
        /// <param name="binName">Bin Name</param>
        /// <param name="locationCode">Location Code</param>
        /// <returns>BaseResponse</returns>
        public BaseResponse DeleteBin (int? xVolTenant, long? binId, int? binName, string locationCode)
        {
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling DeleteBin");
            // verify the required parameter 'binId' is set
            if (binId == null) throw new ApiException(400, "Missing required parameter 'binId' when calling DeleteBin");
            // verify the required parameter 'binName' is set
            if (binName == null) throw new ApiException(400, "Missing required parameter 'binName' when calling DeleteBin");
            // verify the required parameter 'locationCode' is set
            if (locationCode == null) throw new ApiException(400, "Missing required parameter 'locationCode' when calling DeleteBin");
    
            var path = "/v1/bin/{bin_id}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "bin_id" + "}", ApiClient.ParameterToString(binId));
    
            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;
    
             if (binName != null) queryParams.Add("binName", ApiClient.ParameterToString(binName)); // query parameter
 if (locationCode != null) queryParams.Add("locationCode", ApiClient.ParameterToString(locationCode)); // query parameter
             if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter

            // authentication setting, if any
            string[] authSettings = new string[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.DELETE, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteBin: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteBin: " + response.ErrorMessage, response.ErrorMessage);
    
            return (BaseResponse) ApiClient.Deserialize(response.Content, typeof(BaseResponse), response.Headers);
        }
    
        /// <summary>
        ///  Get a bin
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="binId">Id of bin to get</param>
        /// <returns>Bin</returns>
        public Bin GetBin (int? xVolTenant, long? binId)
        {
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling GetBin");
            // verify the required parameter 'binId' is set
            if (binId == null) throw new ApiException(400, "Missing required parameter 'binId' when calling GetBin");
    
            var path = "/v1/bin/{bin_id}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "bin_id" + "}", ApiClient.ParameterToString(binId));
    
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetBin: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetBin: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Bin) ApiClient.Deserialize(response.Content, typeof(Bin), response.Headers);
        }
    
        /// <summary>
        ///  Get list of bin statuses
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>List&lt;BinStatusModel&gt;</returns>
        public List<BinStatusModel> GetBinStatuses (int? xVolTenant)
        {
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling GetBinStatuses");
    
            var path = "/v1/bin/binStatuses/";
            path = path.Replace("{format}", "json");
                
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetBinStatuses: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetBinStatuses: " + response.ErrorMessage, response.ErrorMessage);
    
            return (List<BinStatusModel>) ApiClient.Deserialize(response.Content, typeof(List<BinStatusModel>), response.Headers);
        }
    
        /// <summary>
        ///  Get list of bin types
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>List&lt;BinTypeModel&gt;</returns>
        public List<BinTypeModel> GetBinTypes (int? xVolTenant)
        {
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling GetBinTypes");
    
            var path = "/v1/bin/binTypes/";
            path = path.Replace("{format}", "json");
                
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetBinTypes: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetBinTypes: " + response.ErrorMessage, response.ErrorMessage);
    
            return (List<BinTypeModel>) ApiClient.Deserialize(response.Content, typeof(List<BinTypeModel>), response.Headers);
        }
    
        /// <summary>
        ///  Get a list of bins
        /// </summary>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="locationID">Id of location</param>
        /// <param name="searchTerm">Term to match in bins</param>
        /// <param name="perPage">Results per page</param>
        /// <param name="page">Page to show</param>
        /// <returns>BinResponseModel</returns>
        public BinResponseModel GetBins (int? xVolTenant, long? locationID, long? searchTerm, long? perPage, long? page)
        {
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling GetBins");
            // verify the required parameter 'locationID' is set
            if (locationID == null) throw new ApiException(400, "Missing required parameter 'locationID' when calling GetBins");
            // verify the required parameter 'searchTerm' is set
            if (searchTerm == null) throw new ApiException(400, "Missing required parameter 'searchTerm' when calling GetBins");
    
            var path = "/v1/bin/";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            string postBody = null;
    
             if (locationID != null) queryParams.Add("locationID", ApiClient.ParameterToString(locationID)); // query parameter
 if (searchTerm != null) queryParams.Add("searchTerm", ApiClient.ParameterToString(searchTerm)); // query parameter
 if (perPage != null) queryParams.Add("perPage", ApiClient.ParameterToString(perPage)); // query parameter
 if (page != null) queryParams.Add("page", ApiClient.ParameterToString(page)); // query parameter
             if (xVolTenant != null) headerParams.Add("x-vol-tenant", ApiClient.ParameterToString(xVolTenant)); // header parameter

            // authentication setting, if any
            string[] authSettings = new string[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetBins: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetBins: " + response.ErrorMessage, response.ErrorMessage);
    
            return (BinResponseModel) ApiClient.Deserialize(response.Content, typeof(BinResponseModel), response.Headers);
        }
    
        /// <summary>
        ///  Loads bin inventory for designated bins
        /// </summary>
        /// <param name="body">Request to load bin inventory</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>LoadBinInventoryResponse</returns>
        public LoadBinInventoryResponse LoadInventory (LoadBinInventoryRequest body, int? xVolTenant)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling LoadInventory");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling LoadInventory");
    
            var path = "/v1/bin/loadInventory/";
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
                throw new ApiException ((int)response.StatusCode, "Error calling LoadInventory: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling LoadInventory: " + response.ErrorMessage, response.ErrorMessage);
    
            return (LoadBinInventoryResponse) ApiClient.Deserialize(response.Content, typeof(LoadBinInventoryResponse), response.Headers);
        }
    
        /// <summary>
        ///  Search bins for a inventory by bin name or any product identifier
        /// </summary>
        /// <param name="body">Request to allocate inventory</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>BinSearchResponse</returns>
        public BinSearchResponse SearchBins (BinSearchRequest body, int? xVolTenant)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling SearchBins");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling SearchBins");
    
            var path = "/v1/bin/searchInventory/";
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
                throw new ApiException ((int)response.StatusCode, "Error calling SearchBins: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling SearchBins: " + response.ErrorMessage, response.ErrorMessage);
    
            return (BinSearchResponse) ApiClient.Deserialize(response.Content, typeof(BinSearchResponse), response.Headers);
        }
    
        /// <summary>
        ///  Update the designated bin
        /// </summary>
        /// <param name="body">Request to update a bin</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <param name="binId">Id of bin to update</param>
        /// <returns>Bin</returns>
        public Bin UpdateBin (UpdateBinRequest body, int? xVolTenant, long? binId)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling UpdateBin");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling UpdateBin");
            // verify the required parameter 'binId' is set
            if (binId == null) throw new ApiException(400, "Missing required parameter 'binId' when calling UpdateBin");
    
            var path = "/v1/bin/{bin_id}/";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "bin_id" + "}", ApiClient.ParameterToString(binId));
    
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
                throw new ApiException ((int)response.StatusCode, "Error calling UpdateBin: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling UpdateBin: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Bin) ApiClient.Deserialize(response.Content, typeof(Bin), response.Headers);
        }
    
        /// <summary>
        ///  Update the designated bins
        /// </summary>
        /// <param name="body">Request to update multiple bins</param>
        /// <param name="xVolTenant">Tenant ID</param>
        /// <returns>UpdateBinsResponse</returns>
        public UpdateBinsResponse UpdateBins (UpdateBinsRequest body, int? xVolTenant)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling UpdateBins");
            // verify the required parameter 'xVolTenant' is set
            if (xVolTenant == null) throw new ApiException(400, "Missing required parameter 'xVolTenant' when calling UpdateBins");
    
            var path = "/v1/bin/updateBins/";
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
                throw new ApiException ((int)response.StatusCode, "Error calling UpdateBins: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling UpdateBins: " + response.ErrorMessage, response.ErrorMessage);
    
            return (UpdateBinsResponse) ApiClient.Deserialize(response.Content, typeof(UpdateBinsResponse), response.Headers);
        }
    
    }
}
