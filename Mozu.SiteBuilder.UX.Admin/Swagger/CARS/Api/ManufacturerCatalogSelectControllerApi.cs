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
    public interface IManufacturerCatalogSelectControllerApi
    {
        /// <summary>
        /// getCatalogsByManufacturerID 
        /// </summary>
        /// <param name="manufacturerID">manufacturerID</param>
        /// <param name="iSO3Country"></param>
        /// <param name="iSO3Language"></param>
        /// <param name="allowAllCatalogs">allowAllCatalogs</param>
        /// <param name="catalogIDs">catalogIDs</param>
        /// <param name="country"></param>
        /// <param name="displayCountry"></param>
        /// <param name="displayLanguage"></param>
        /// <param name="displayName"></param>
        /// <param name="displayScript"></param>
        /// <param name="displayVariant"></param>
        /// <param name="language"></param>
        /// <param name="script"></param>
        /// <param name="unicodeLocaleAttributes"></param>
        /// <param name="unicodeLocaleKeys"></param>
        /// <param name="variant"></param>
        /// <returns>AjaxResponse</returns>
        AjaxResponse GetCatalogsByManufacturerIDUsingGET (int? manufacturerID, string iSO3Country, string iSO3Language, bool? allowAllCatalogs, List<int?> catalogIDs, string country, string displayCountry, string displayLanguage, string displayName, string displayScript, string displayVariant, string language, string script, List<string> unicodeLocaleAttributes, List<string> unicodeLocaleKeys, string variant);
        /// <summary>
        /// getManufacturerByID 
        /// </summary>
        /// <param name="manufacturerID">manufacturerID</param>
        /// <returns>AjaxResponse</returns>
        AjaxResponse GetManufacturerByIDUsingGET (int? manufacturerID);
        /// <summary>
        /// getManufacturerByName 
        /// </summary>
        /// <param name="substring">substring</param>
        /// <param name="maxResults">maxResults</param>
        /// <returns>AjaxResponse</returns>
        AjaxResponse GetManufacturerByNameUsingGET (string substring, int? maxResults);
        /// <summary>
        /// manufacturerCatalogSelect 
        /// </summary>
        /// <param name="allowAllCatalogs">allowAllCatalogs</param>
        /// <param name="inline">inline</param>
        /// <returns>string</returns>
        string ManufacturerCatalogSelectUsingGET (bool? allowAllCatalogs, bool? inline);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class ManufacturerCatalogSelectControllerApi : IManufacturerCatalogSelectControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ManufacturerCatalogSelectControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public ManufacturerCatalogSelectControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="ManufacturerCatalogSelectControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public ManufacturerCatalogSelectControllerApi(String basePath)
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
        /// getCatalogsByManufacturerID 
        /// </summary>
        /// <param name="manufacturerID">manufacturerID</param>
        /// <param name="iSO3Country"></param>
        /// <param name="iSO3Language"></param>
        /// <param name="allowAllCatalogs">allowAllCatalogs</param>
        /// <param name="catalogIDs">catalogIDs</param>
        /// <param name="country"></param>
        /// <param name="displayCountry"></param>
        /// <param name="displayLanguage"></param>
        /// <param name="displayName"></param>
        /// <param name="displayScript"></param>
        /// <param name="displayVariant"></param>
        /// <param name="language"></param>
        /// <param name="script"></param>
        /// <param name="unicodeLocaleAttributes"></param>
        /// <param name="unicodeLocaleKeys"></param>
        /// <param name="variant"></param>
        /// <returns>AjaxResponse</returns>
        public AjaxResponse GetCatalogsByManufacturerIDUsingGET (int? manufacturerID, string iSO3Country, string iSO3Language, bool? allowAllCatalogs, List<int?> catalogIDs, string country, string displayCountry, string displayLanguage, string displayName, string displayScript, string displayVariant, string language, string script, List<string> unicodeLocaleAttributes, List<string> unicodeLocaleKeys, string variant)
        {
            // verify the required parameter 'manufacturerID' is set
            if (manufacturerID == null) throw new ApiException(400, "Missing required parameter 'manufacturerID' when calling GetCatalogsByManufacturerIDUsingGET");
    
            var path = "/manufacturer/{manufacturerID}/catalogs";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "manufacturerID" + "}", ApiClient.ParameterToString(manufacturerID));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (iSO3Country != null) queryParams.Add("ISO3Country", ApiClient.ParameterToString(iSO3Country)); // query parameter
 if (iSO3Language != null) queryParams.Add("ISO3Language", ApiClient.ParameterToString(iSO3Language)); // query parameter
 if (allowAllCatalogs != null) queryParams.Add("allowAllCatalogs", ApiClient.ParameterToString(allowAllCatalogs)); // query parameter
 if (catalogIDs != null) queryParams.Add("catalogIDs", ApiClient.ParameterToString(catalogIDs)); // query parameter
 if (country != null) queryParams.Add("country", ApiClient.ParameterToString(country)); // query parameter
 if (displayCountry != null) queryParams.Add("displayCountry", ApiClient.ParameterToString(displayCountry)); // query parameter
 if (displayLanguage != null) queryParams.Add("displayLanguage", ApiClient.ParameterToString(displayLanguage)); // query parameter
 if (displayName != null) queryParams.Add("displayName", ApiClient.ParameterToString(displayName)); // query parameter
 if (displayScript != null) queryParams.Add("displayScript", ApiClient.ParameterToString(displayScript)); // query parameter
 if (displayVariant != null) queryParams.Add("displayVariant", ApiClient.ParameterToString(displayVariant)); // query parameter
 if (language != null) queryParams.Add("language", ApiClient.ParameterToString(language)); // query parameter
 if (script != null) queryParams.Add("script", ApiClient.ParameterToString(script)); // query parameter
 if (unicodeLocaleAttributes != null) queryParams.Add("unicodeLocaleAttributes", ApiClient.ParameterToString(unicodeLocaleAttributes)); // query parameter
 if (unicodeLocaleKeys != null) queryParams.Add("unicodeLocaleKeys", ApiClient.ParameterToString(unicodeLocaleKeys)); // query parameter
 if (variant != null) queryParams.Add("variant", ApiClient.ParameterToString(variant)); // query parameter
                                        
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetCatalogsByManufacturerIDUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetCatalogsByManufacturerIDUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (AjaxResponse) ApiClient.Deserialize(response.Content, typeof(AjaxResponse), response.Headers);
        }
    
        /// <summary>
        /// getManufacturerByID 
        /// </summary>
        /// <param name="manufacturerID">manufacturerID</param>
        /// <returns>AjaxResponse</returns>
        public AjaxResponse GetManufacturerByIDUsingGET (int? manufacturerID)
        {
            // verify the required parameter 'manufacturerID' is set
            if (manufacturerID == null) throw new ApiException(400, "Missing required parameter 'manufacturerID' when calling GetManufacturerByIDUsingGET");
    
            var path = "/manufacturer/{manufacturerID}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "manufacturerID" + "}", ApiClient.ParameterToString(manufacturerID));
    
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetManufacturerByIDUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetManufacturerByIDUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (AjaxResponse) ApiClient.Deserialize(response.Content, typeof(AjaxResponse), response.Headers);
        }
    
        /// <summary>
        /// getManufacturerByName 
        /// </summary>
        /// <param name="substring">substring</param>
        /// <param name="maxResults">maxResults</param>
        /// <returns>AjaxResponse</returns>
        public AjaxResponse GetManufacturerByNameUsingGET (string substring, int? maxResults)
        {
            // verify the required parameter 'substring' is set
            if (substring == null) throw new ApiException(400, "Missing required parameter 'substring' when calling GetManufacturerByNameUsingGET");
    
            var path = "/manufacturer/dropdown";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (maxResults != null) queryParams.Add("maxResults", ApiClient.ParameterToString(maxResults)); // query parameter
 if (substring != null) queryParams.Add("substring", ApiClient.ParameterToString(substring)); // query parameter
                                        
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetManufacturerByNameUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetManufacturerByNameUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (AjaxResponse) ApiClient.Deserialize(response.Content, typeof(AjaxResponse), response.Headers);
        }
    
        /// <summary>
        /// manufacturerCatalogSelect 
        /// </summary>
        /// <param name="allowAllCatalogs">allowAllCatalogs</param>
        /// <param name="inline">inline</param>
        /// <returns>string</returns>
        public string ManufacturerCatalogSelectUsingGET (bool? allowAllCatalogs, bool? inline)
        {
    
            var path = "/manufacturer";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (allowAllCatalogs != null) queryParams.Add("allowAllCatalogs", ApiClient.ParameterToString(allowAllCatalogs)); // query parameter
 if (inline != null) queryParams.Add("inline", ApiClient.ParameterToString(inline)); // query parameter
                                        
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling ManufacturerCatalogSelectUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling ManufacturerCatalogSelectUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
    }
}
