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
    public interface ICarrierControllerApi
    {
        /// <summary>
        /// addCarrier 
        /// </summary>
        /// <param name="body">carrier</param>
        /// <returns>AddCarrierResponse</returns>
        AddCarrierResponse AddCarrierUsingPOST1 (AddCarrierRequest body);
        /// <summary>
        /// addServiceType 
        /// </summary>
        /// <param name="body">req</param>
        /// <returns>GetCarriersResponse</returns>
        GetCarriersResponse AddServiceTypeUsingPOST1 (AddServiceTypeRequest body);
        /// <summary>
        /// deleteCarrier 
        /// </summary>
        /// <param name="carrierName">carrierName</param>
        /// <returns>DeleteCarriersResponse</returns>
        DeleteCarriersResponse DeleteCarrierUsingDELETE1 (string carrierName);
        /// <summary>
        /// getCarriers 
        /// </summary>
        /// <returns>GetCarriersResponse</returns>
        GetCarriersResponse GetCarriersUsingGET ();
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class CarrierControllerApi : ICarrierControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="CarrierControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public CarrierControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="CarrierControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public CarrierControllerApi(String basePath)
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
        /// addCarrier 
        /// </summary>
        /// <param name="body">carrier</param>
        /// <returns>AddCarrierResponse</returns>
        public AddCarrierResponse AddCarrierUsingPOST1 (AddCarrierRequest body)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling AddCarrierUsingPOST1");
    
            var path = "/api/v1/carrier";
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
                throw new ApiException ((int)response.StatusCode, "Error calling AddCarrierUsingPOST1: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling AddCarrierUsingPOST1: " + response.ErrorMessage, response.ErrorMessage);
    
            return (AddCarrierResponse) ApiClient.Deserialize(response.Content, typeof(AddCarrierResponse), response.Headers);
        }
    
        /// <summary>
        /// addServiceType 
        /// </summary>
        /// <param name="body">req</param>
        /// <returns>GetCarriersResponse</returns>
        public GetCarriersResponse AddServiceTypeUsingPOST1 (AddServiceTypeRequest body)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling AddServiceTypeUsingPOST1");
    
            var path = "/api/v1/carrier/serviceType";
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
                throw new ApiException ((int)response.StatusCode, "Error calling AddServiceTypeUsingPOST1: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling AddServiceTypeUsingPOST1: " + response.ErrorMessage, response.ErrorMessage);
    
            return (GetCarriersResponse) ApiClient.Deserialize(response.Content, typeof(GetCarriersResponse), response.Headers);
        }
    
        /// <summary>
        /// deleteCarrier 
        /// </summary>
        /// <param name="carrierName">carrierName</param>
        /// <returns>DeleteCarriersResponse</returns>
        public DeleteCarriersResponse DeleteCarrierUsingDELETE1 (string carrierName)
        {
            // verify the required parameter 'carrierName' is set
            if (carrierName == null) throw new ApiException(400, "Missing required parameter 'carrierName' when calling DeleteCarrierUsingDELETE1");
    
            var path = "/api/v1/carrier/{carrierName}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "carrierName" + "}", ApiClient.ParameterToString(carrierName));
    
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
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteCarrierUsingDELETE1: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteCarrierUsingDELETE1: " + response.ErrorMessage, response.ErrorMessage);
    
            return (DeleteCarriersResponse) ApiClient.Deserialize(response.Content, typeof(DeleteCarriersResponse), response.Headers);
        }
    
        /// <summary>
        /// getCarriers 
        /// </summary>
        /// <returns>GetCarriersResponse</returns>
        public GetCarriersResponse GetCarriersUsingGET ()
        {
    
            var path = "/api/v1/carrier";
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetCarriersUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetCarriersUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (GetCarriersResponse) ApiClient.Deserialize(response.Content, typeof(GetCarriersResponse), response.Headers);
        }
    
    }
}
