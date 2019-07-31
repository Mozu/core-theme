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
    public interface IAddCarriersPageControllerApi
    {
        /// <summary>
        /// addCarrier 
        /// </summary>
        /// <param name="body">carrier</param>
        /// <returns>AjaxResponse</returns>
        AjaxResponse AddCarrierUsingPOST (string body);
        /// <summary>
        /// addCarriersView 
        /// </summary>
        /// <returns>string</returns>
        string AddCarriersViewUsingGET ();
        /// <summary>
        /// addServiceType 
        /// </summary>
        /// <param name="body">req</param>
        /// <returns>AjaxResponse</returns>
        AjaxResponse AddServiceTypeUsingPOST (AddServiceTypeRequest body);
        /// <summary>
        /// deleteCarrier 
        /// </summary>
        /// <param name="carrier">carrier</param>
        /// <returns>bool?</returns>
        bool? DeleteCarrierUsingDELETE (string carrier);
        /// <summary>
        /// deleteServiceType 
        /// </summary>
        /// <param name="carrier">carrier</param>
        /// <param name="serviceType">serviceType</param>
        /// <returns>bool?</returns>
        bool? DeleteServiceTypeUsingDELETE (string carrier, string serviceType);
        /// <summary>
        /// getCarriersAndServiceTypes 
        /// </summary>
        /// <returns>Dictionary&lt;string, List&lt;string&gt;&gt;</returns>
        Dictionary<string, List<string>> GetCarriersAndServiceTypesUsingGET ();
        /// <summary>
        /// getSchemasForCarrier 
        /// </summary>
        /// <param name="body">carrier</param>
        /// <returns>List&lt;CarrierClientSchema&gt;</returns>
        List<CarrierClientSchema> GetSchemasForCarrierUsingGET (string body);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class AddCarriersPageControllerApi : IAddCarriersPageControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AddCarriersPageControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public AddCarriersPageControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="AddCarriersPageControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public AddCarriersPageControllerApi(String basePath)
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
        /// <returns>AjaxResponse</returns>
        public AjaxResponse AddCarrierUsingPOST (string body)
        {
    
            var path = "/addCarriersView/addCarrier";
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
                throw new ApiException ((int)response.StatusCode, "Error calling AddCarrierUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling AddCarrierUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (AjaxResponse) ApiClient.Deserialize(response.Content, typeof(AjaxResponse), response.Headers);
        }
    
        /// <summary>
        /// addCarriersView 
        /// </summary>
        /// <returns>string</returns>
        public string AddCarriersViewUsingGET ()
        {
    
            var path = "/addCarriersView";
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
                throw new ApiException ((int)response.StatusCode, "Error calling AddCarriersViewUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling AddCarriersViewUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
        /// <summary>
        /// addServiceType 
        /// </summary>
        /// <param name="body">req</param>
        /// <returns>AjaxResponse</returns>
        public AjaxResponse AddServiceTypeUsingPOST (AddServiceTypeRequest body)
        {
            // verify the required parameter 'body' is set
            if (body == null) throw new ApiException(400, "Missing required parameter 'body' when calling AddServiceTypeUsingPOST");
    
            var path = "/addCarriersView/serviceType";
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
                throw new ApiException ((int)response.StatusCode, "Error calling AddServiceTypeUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling AddServiceTypeUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (AjaxResponse) ApiClient.Deserialize(response.Content, typeof(AjaxResponse), response.Headers);
        }
    
        /// <summary>
        /// deleteCarrier 
        /// </summary>
        /// <param name="carrier">carrier</param>
        /// <returns>bool?</returns>
        public bool? DeleteCarrierUsingDELETE (string carrier)
        {
            // verify the required parameter 'carrier' is set
            if (carrier == null) throw new ApiException(400, "Missing required parameter 'carrier' when calling DeleteCarrierUsingDELETE");
    
            var path = "/addCarriersView/deleteCarrier/{carrier}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "carrier" + "}", ApiClient.ParameterToString(carrier));
    
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
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteCarrierUsingDELETE: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteCarrierUsingDELETE: " + response.ErrorMessage, response.ErrorMessage);
    
            return (bool?) ApiClient.Deserialize(response.Content, typeof(bool?), response.Headers);
        }
    
        /// <summary>
        /// deleteServiceType 
        /// </summary>
        /// <param name="carrier">carrier</param>
        /// <param name="serviceType">serviceType</param>
        /// <returns>bool?</returns>
        public bool? DeleteServiceTypeUsingDELETE (string carrier, string serviceType)
        {
            // verify the required parameter 'carrier' is set
            if (carrier == null) throw new ApiException(400, "Missing required parameter 'carrier' when calling DeleteServiceTypeUsingDELETE");
            // verify the required parameter 'serviceType' is set
            if (serviceType == null) throw new ApiException(400, "Missing required parameter 'serviceType' when calling DeleteServiceTypeUsingDELETE");
    
            var path = "/addCarriersView/deleteServiceType/{carrier}/{serviceType}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "carrier" + "}", ApiClient.ParameterToString(carrier));
path = path.Replace("{" + "serviceType" + "}", ApiClient.ParameterToString(serviceType));
    
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
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteServiceTypeUsingDELETE: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteServiceTypeUsingDELETE: " + response.ErrorMessage, response.ErrorMessage);
    
            return (bool?) ApiClient.Deserialize(response.Content, typeof(bool?), response.Headers);
        }
    
        /// <summary>
        /// getCarriersAndServiceTypes 
        /// </summary>
        /// <returns>Dictionary&lt;string, List&lt;string&gt;&gt;</returns>
        public Dictionary<string, List<string>> GetCarriersAndServiceTypesUsingGET ()
        {
    
            var path = "/addCarriersView/carriersAndServiceTypes";
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetCarriersAndServiceTypesUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetCarriersAndServiceTypesUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Dictionary<string, List<string>>) ApiClient.Deserialize(response.Content, typeof(Dictionary<string, List<string>>), response.Headers);
        }
    
        /// <summary>
        /// getSchemasForCarrier 
        /// </summary>
        /// <param name="body">carrier</param>
        /// <returns>List&lt;CarrierClientSchema&gt;</returns>
        public List<CarrierClientSchema> GetSchemasForCarrierUsingGET (string body)
        {
    
            var path = "/addCarriersView/getSchemasForCarrier";
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetSchemasForCarrierUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetSchemasForCarrierUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (List<CarrierClientSchema>) ApiClient.Deserialize(response.Content, typeof(List<CarrierClientSchema>), response.Headers);
        }
    
    }
}
