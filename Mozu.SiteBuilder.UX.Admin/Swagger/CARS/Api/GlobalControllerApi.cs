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
    public interface IGlobalControllerApi
    {
        /// <summary>
        /// about 
        /// </summary>
        /// <param name="assertionAttributes"></param>
        /// <param name="assertionPrincipalAttributes"></param>
        /// <param name="assertionValidFromDate"></param>
        /// <param name="assertionValidUntilDate"></param>
        /// <param name="authenticated"></param>
        /// <param name="authorities0Authority"></param>
        /// <param name="credentials"></param>
        /// <param name="details"></param>
        /// <param name="keyHash"></param>
        /// <param name="name"></param>
        /// <param name="principal"></param>
        /// <param name="userDetailsAccountNonExpired"></param>
        /// <param name="userDetailsAccountNonLocked"></param>
        /// <param name="userDetailsAuthorities0Authority"></param>
        /// <param name="userDetailsCredentialsNonExpired"></param>
        /// <param name="userDetailsEnabled"></param>
        /// <param name="userDetailsPassword"></param>
        /// <param name="userDetailsUsername"></param>
        /// <returns>string</returns>
        string AboutUsingGET (Object assertionAttributes, Object assertionPrincipalAttributes, DateTime? assertionValidFromDate, DateTime? assertionValidUntilDate, bool? authenticated, string authorities0Authority, Object credentials, Object details, int? keyHash, string name, Object principal, bool? userDetailsAccountNonExpired, bool? userDetailsAccountNonLocked, string userDetailsAuthorities0Authority, bool? userDetailsCredentialsNonExpired, bool? userDetailsEnabled, string userDetailsPassword, string userDetailsUsername);
        /// <summary>
        /// authority 
        /// </summary>
        /// <returns>List&lt;string&gt;</returns>
        List<string> AuthorityUsingGET ();
        /// <summary>
        /// forbidden 
        /// </summary>
        /// <returns>string</returns>
        string ForbiddenUsingGET ();
        /// <summary>
        /// getBuildVersion 
        /// </summary>
        /// <returns>Dictionary&lt;string, string&gt;</returns>
        Dictionary<string, string> GetBuildVersionUsingGET ();
        /// <summary>
        /// getSessionData 
        /// </summary>
        /// <param name="expectedSessionVar">expectedSessionVar</param>
        /// <param name="iSO3Country"></param>
        /// <param name="iSO3Language"></param>
        /// <param name="country"></param>
        /// <param name="displayCountry"></param>
        /// <param name="displayLanguage"></param>
        /// <param name="displayName"></param>
        /// <param name="displayScript"></param>
        /// <param name="displayVariant"></param>
        /// <param name="language"></param>
        /// <param name="script"></param>
        /// <param name="sessionVar"></param>
        /// <param name="unicodeLocaleAttributes"></param>
        /// <param name="unicodeLocaleKeys"></param>
        /// <param name="variant"></param>
        /// <returns>AjaxResponse</returns>
        AjaxResponse GetSessionDataUsingGET (int? expectedSessionVar, string iSO3Country, string iSO3Language, string country, string displayCountry, string displayLanguage, string displayName, string displayScript, string displayVariant, string language, string script, int? sessionVar, List<string> unicodeLocaleAttributes, List<string> unicodeLocaleKeys, string variant);
        /// <summary>
        /// getTestPage 
        /// </summary>
        /// <returns>string</returns>
        string GetTestPageUsingDELETE ();
        /// <summary>
        /// getTestPage 
        /// </summary>
        /// <returns>string</returns>
        string GetTestPageUsingGET ();
        /// <summary>
        /// getTestPage 
        /// </summary>
        /// <returns>string</returns>
        string GetTestPageUsingHEAD ();
        /// <summary>
        /// getTestPage 
        /// </summary>
        /// <returns>string</returns>
        string GetTestPageUsingOPTIONS ();
        /// <summary>
        /// getTestPage 
        /// </summary>
        /// <returns>string</returns>
        string GetTestPageUsingPATCH ();
        /// <summary>
        /// getTestPage 
        /// </summary>
        /// <returns>string</returns>
        string GetTestPageUsingPOST ();
        /// <summary>
        /// getTestPage 
        /// </summary>
        /// <returns>string</returns>
        string GetTestPageUsingPUT ();
        /// <summary>
        /// loading 
        /// </summary>
        /// <param name="size">size</param>
        /// <returns>string</returns>
        string LoadingUsingGET (int? size);
        /// <summary>
        /// ping 
        /// </summary>
        /// <returns></returns>
        void PingUsingGET ();
        /// <summary>
        /// userSearch 
        /// </summary>
        /// <returns>ShopatronUser</returns>
        ShopatronUser UserSearchUsingGET ();
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class GlobalControllerApi : IGlobalControllerApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="GlobalControllerApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public GlobalControllerApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="GlobalControllerApi"/> class.
        /// </summary>
        /// <returns></returns>
        public GlobalControllerApi(String basePath)
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
        /// about 
        /// </summary>
        /// <param name="assertionAttributes"></param>
        /// <param name="assertionPrincipalAttributes"></param>
        /// <param name="assertionValidFromDate"></param>
        /// <param name="assertionValidUntilDate"></param>
        /// <param name="authenticated"></param>
        /// <param name="authorities0Authority"></param>
        /// <param name="credentials"></param>
        /// <param name="details"></param>
        /// <param name="keyHash"></param>
        /// <param name="name"></param>
        /// <param name="principal"></param>
        /// <param name="userDetailsAccountNonExpired"></param>
        /// <param name="userDetailsAccountNonLocked"></param>
        /// <param name="userDetailsAuthorities0Authority"></param>
        /// <param name="userDetailsCredentialsNonExpired"></param>
        /// <param name="userDetailsEnabled"></param>
        /// <param name="userDetailsPassword"></param>
        /// <param name="userDetailsUsername"></param>
        /// <returns>string</returns>
        public string AboutUsingGET (Object assertionAttributes, Object assertionPrincipalAttributes, DateTime? assertionValidFromDate, DateTime? assertionValidUntilDate, bool? authenticated, string authorities0Authority, Object credentials, Object details, int? keyHash, string name, Object principal, bool? userDetailsAccountNonExpired, bool? userDetailsAccountNonLocked, string userDetailsAuthorities0Authority, bool? userDetailsCredentialsNonExpired, bool? userDetailsEnabled, string userDetailsPassword, string userDetailsUsername)
        {
    
            var path = "/about";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (assertionAttributes != null) queryParams.Add("assertion.attributes", ApiClient.ParameterToString(assertionAttributes)); // query parameter
 if (assertionPrincipalAttributes != null) queryParams.Add("assertion.principal.attributes", ApiClient.ParameterToString(assertionPrincipalAttributes)); // query parameter
 if (assertionValidFromDate != null) queryParams.Add("assertion.validFromDate", ApiClient.ParameterToString(assertionValidFromDate)); // query parameter
 if (assertionValidUntilDate != null) queryParams.Add("assertion.validUntilDate", ApiClient.ParameterToString(assertionValidUntilDate)); // query parameter
 if (authenticated != null) queryParams.Add("authenticated", ApiClient.ParameterToString(authenticated)); // query parameter
 if (authorities0Authority != null) queryParams.Add("authorities[0].authority", ApiClient.ParameterToString(authorities0Authority)); // query parameter
 if (credentials != null) queryParams.Add("credentials", ApiClient.ParameterToString(credentials)); // query parameter
 if (details != null) queryParams.Add("details", ApiClient.ParameterToString(details)); // query parameter
 if (keyHash != null) queryParams.Add("keyHash", ApiClient.ParameterToString(keyHash)); // query parameter
 if (name != null) queryParams.Add("name", ApiClient.ParameterToString(name)); // query parameter
 if (principal != null) queryParams.Add("principal", ApiClient.ParameterToString(principal)); // query parameter
 if (userDetailsAccountNonExpired != null) queryParams.Add("userDetails.accountNonExpired", ApiClient.ParameterToString(userDetailsAccountNonExpired)); // query parameter
 if (userDetailsAccountNonLocked != null) queryParams.Add("userDetails.accountNonLocked", ApiClient.ParameterToString(userDetailsAccountNonLocked)); // query parameter
 if (userDetailsAuthorities0Authority != null) queryParams.Add("userDetails.authorities[0].authority", ApiClient.ParameterToString(userDetailsAuthorities0Authority)); // query parameter
 if (userDetailsCredentialsNonExpired != null) queryParams.Add("userDetails.credentialsNonExpired", ApiClient.ParameterToString(userDetailsCredentialsNonExpired)); // query parameter
 if (userDetailsEnabled != null) queryParams.Add("userDetails.enabled", ApiClient.ParameterToString(userDetailsEnabled)); // query parameter
 if (userDetailsPassword != null) queryParams.Add("userDetails.password", ApiClient.ParameterToString(userDetailsPassword)); // query parameter
 if (userDetailsUsername != null) queryParams.Add("userDetails.username", ApiClient.ParameterToString(userDetailsUsername)); // query parameter
                                        
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling AboutUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling AboutUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
        /// <summary>
        /// authority 
        /// </summary>
        /// <returns>List&lt;string&gt;</returns>
        public List<string> AuthorityUsingGET ()
        {
    
            var path = "/authority";
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
                throw new ApiException ((int)response.StatusCode, "Error calling AuthorityUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling AuthorityUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (List<string>) ApiClient.Deserialize(response.Content, typeof(List<string>), response.Headers);
        }
    
        /// <summary>
        /// forbidden 
        /// </summary>
        /// <returns>string</returns>
        public string ForbiddenUsingGET ()
        {
    
            var path = "/forbidden";
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
                throw new ApiException ((int)response.StatusCode, "Error calling ForbiddenUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling ForbiddenUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
        /// <summary>
        /// getBuildVersion 
        /// </summary>
        /// <returns>Dictionary&lt;string, string&gt;</returns>
        public Dictionary<string, string> GetBuildVersionUsingGET ()
        {
    
            var path = "/version";
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetBuildVersionUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetBuildVersionUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Dictionary<string, string>) ApiClient.Deserialize(response.Content, typeof(Dictionary<string, string>), response.Headers);
        }
    
        /// <summary>
        /// getSessionData 
        /// </summary>
        /// <param name="expectedSessionVar">expectedSessionVar</param>
        /// <param name="iSO3Country"></param>
        /// <param name="iSO3Language"></param>
        /// <param name="country"></param>
        /// <param name="displayCountry"></param>
        /// <param name="displayLanguage"></param>
        /// <param name="displayName"></param>
        /// <param name="displayScript"></param>
        /// <param name="displayVariant"></param>
        /// <param name="language"></param>
        /// <param name="script"></param>
        /// <param name="sessionVar"></param>
        /// <param name="unicodeLocaleAttributes"></param>
        /// <param name="unicodeLocaleKeys"></param>
        /// <param name="variant"></param>
        /// <returns>AjaxResponse</returns>
        public AjaxResponse GetSessionDataUsingGET (int? expectedSessionVar, string iSO3Country, string iSO3Language, string country, string displayCountry, string displayLanguage, string displayName, string displayScript, string displayVariant, string language, string script, int? sessionVar, List<string> unicodeLocaleAttributes, List<string> unicodeLocaleKeys, string variant)
        {
            // verify the required parameter 'expectedSessionVar' is set
            if (expectedSessionVar == null) throw new ApiException(400, "Missing required parameter 'expectedSessionVar' when calling GetSessionDataUsingGET");
    
            var path = "/developer/test/getSession";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (iSO3Country != null) queryParams.Add("ISO3Country", ApiClient.ParameterToString(iSO3Country)); // query parameter
 if (iSO3Language != null) queryParams.Add("ISO3Language", ApiClient.ParameterToString(iSO3Language)); // query parameter
 if (country != null) queryParams.Add("country", ApiClient.ParameterToString(country)); // query parameter
 if (displayCountry != null) queryParams.Add("displayCountry", ApiClient.ParameterToString(displayCountry)); // query parameter
 if (displayLanguage != null) queryParams.Add("displayLanguage", ApiClient.ParameterToString(displayLanguage)); // query parameter
 if (displayName != null) queryParams.Add("displayName", ApiClient.ParameterToString(displayName)); // query parameter
 if (displayScript != null) queryParams.Add("displayScript", ApiClient.ParameterToString(displayScript)); // query parameter
 if (displayVariant != null) queryParams.Add("displayVariant", ApiClient.ParameterToString(displayVariant)); // query parameter
 if (expectedSessionVar != null) queryParams.Add("expectedSessionVar", ApiClient.ParameterToString(expectedSessionVar)); // query parameter
 if (language != null) queryParams.Add("language", ApiClient.ParameterToString(language)); // query parameter
 if (script != null) queryParams.Add("script", ApiClient.ParameterToString(script)); // query parameter
 if (sessionVar != null) queryParams.Add("sessionVar", ApiClient.ParameterToString(sessionVar)); // query parameter
 if (unicodeLocaleAttributes != null) queryParams.Add("unicodeLocaleAttributes", ApiClient.ParameterToString(unicodeLocaleAttributes)); // query parameter
 if (unicodeLocaleKeys != null) queryParams.Add("unicodeLocaleKeys", ApiClient.ParameterToString(unicodeLocaleKeys)); // query parameter
 if (variant != null) queryParams.Add("variant", ApiClient.ParameterToString(variant)); // query parameter
                                        
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetSessionDataUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetSessionDataUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (AjaxResponse) ApiClient.Deserialize(response.Content, typeof(AjaxResponse), response.Headers);
        }
    
        /// <summary>
        /// getTestPage 
        /// </summary>
        /// <returns>string</returns>
        public string GetTestPageUsingDELETE ()
        {
    
            var path = "/developer/test";
            path = path.Replace("{format}", "json");
                
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetTestPageUsingDELETE: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetTestPageUsingDELETE: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
        /// <summary>
        /// getTestPage 
        /// </summary>
        /// <returns>string</returns>
        public string GetTestPageUsingGET ()
        {
    
            var path = "/developer/test";
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetTestPageUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetTestPageUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
        /// <summary>
        /// getTestPage 
        /// </summary>
        /// <returns>string</returns>
        public string GetTestPageUsingHEAD ()
        {
    
            var path = "/developer/test";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                                                    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.HEAD, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetTestPageUsingHEAD: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetTestPageUsingHEAD: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
        /// <summary>
        /// getTestPage 
        /// </summary>
        /// <returns>string</returns>
        public string GetTestPageUsingOPTIONS ()
        {
    
            var path = "/developer/test";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                                                    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.OPTIONS, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetTestPageUsingOPTIONS: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetTestPageUsingOPTIONS: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
        /// <summary>
        /// getTestPage 
        /// </summary>
        /// <returns>string</returns>
        public string GetTestPageUsingPATCH ()
        {
    
            var path = "/developer/test";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                                                    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.PATCH, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetTestPageUsingPATCH: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetTestPageUsingPATCH: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
        /// <summary>
        /// getTestPage 
        /// </summary>
        /// <returns>string</returns>
        public string GetTestPageUsingPOST ()
        {
    
            var path = "/developer/test";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                                                    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetTestPageUsingPOST: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetTestPageUsingPOST: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
        /// <summary>
        /// getTestPage 
        /// </summary>
        /// <returns>string</returns>
        public string GetTestPageUsingPUT ()
        {
    
            var path = "/developer/test";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                                                    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.PUT, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetTestPageUsingPUT: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetTestPageUsingPUT: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
        /// <summary>
        /// loading 
        /// </summary>
        /// <param name="size">size</param>
        /// <returns>string</returns>
        public string LoadingUsingGET (int? size)
        {
    
            var path = "/loading";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (size != null) queryParams.Add("size", ApiClient.ParameterToString(size)); // query parameter
                                        
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling LoadingUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling LoadingUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
        /// <summary>
        /// ping 
        /// </summary>
        /// <returns></returns>
        public void PingUsingGET ()
        {
    
            var path = "/ping";
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
                throw new ApiException ((int)response.StatusCode, "Error calling PingUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling PingUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return;
        }
    
        /// <summary>
        /// userSearch 
        /// </summary>
        /// <returns>ShopatronUser</returns>
        public ShopatronUser UserSearchUsingGET ()
        {
    
            var path = "/user";
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
                throw new ApiException ((int)response.StatusCode, "Error calling UserSearchUsingGET: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling UserSearchUsingGET: " + response.ErrorMessage, response.ErrorMessage);
    
            return (ShopatronUser) ApiClient.Deserialize(response.Content, typeof(ShopatronUser), response.Headers);
        }
    
    }
}
