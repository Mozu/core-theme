using System;
using System.Collections.Generic;
using System.Net;
using System.Runtime.Serialization;
using System.Text;
using IO.Swagger.Api;
using IO.Swagger.Client;
using IO.Swagger.Model;
using Mozu.Core;
using Mozu.Core.Extensions;
using Mozu.Core.Settings;
using Newtonsoft.Json;
using RestSharp;

namespace Mozu.SiteBuilder.UX.Admin.ApiWrappers
{
    public interface IOrderRoutingApiWrapper
    {
        SuggestionResponse SuggestRouting(SuggestionRequest request, bool returnSuggestionLog = false);
        List<JsonNode> GetSuggestionLog(string externalResponseId, int orderId, int suggestionId, int responseId);
        SuggestionRequest GetSampleRequest();
        CandidateSuggestionsResponse SuggestCandidates(CandidateSuggestionsRequest request);
    }

    public class OrderRoutingApiWrapper : IOrderRoutingApiWrapper
    {
        private readonly IApiContext _apiContext;
        private readonly ISettings _settings;
        private readonly RoutingControllerApi _routingController;

        [DataContract]
        private class OAuthToken
        {
            [DataMember(Name = "scope", EmitDefaultValue = false)]
            [JsonProperty(PropertyName = "scope")]
            public string Scope { get; set; }

            [DataMember(Name = "access_token", EmitDefaultValue = false)]
            [JsonProperty(PropertyName = "access_token")]
            public string AccessToken { get; set; }

            [DataMember(Name = "token_type", EmitDefaultValue = false)]
            [JsonProperty(PropertyName = "token_type")]
            public string TokenType { get; set; }

            [DataMember(Name = "expires_in", EmitDefaultValue = false)]
            [JsonProperty(PropertyName = "expires_in")]
            public int ExpiresIn { get; set; }
        }

        // TODO: This should go away once OrderRouting starts using authorization via JWTs.
        private void AddAuthHeaders(RoutingControllerApi controller)
        {
            var apiKey = "rraahy4jntfjcavayrvdjga5";
            var apiSecret = "Yp3fSmGJ7Fkg5WeVS7fGdf99";
            var basicAuth = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{apiKey}:{apiSecret}"));

            var client = new ApiClient("https://authdev.cloudatron.com/oauthserver/oauth2");
            var queryParams = new Dictionary<string, string>();
            var headerParams = new Dictionary<string, string>();
            headerParams.Add("Authorization", $"Basic {basicAuth}");
            headerParams.Add("Content-Type", "application/x-www-form-urlencoded");
            var formParams = new Dictionary<string, string>();
            var fileParams = new Dictionary<string, FileParameter>();
            var authSettings = new string[] { };
            var body = "grant_type=client_credentials";
            var response = (IRestResponse)client.CallApi("token", Method.POST, queryParams, body, headerParams, formParams, fileParams, authSettings);

            if (response.StatusCode != HttpStatusCode.OK) return;

            var token = (OAuthToken)client.Deserialize(response.Content, typeof(OAuthToken), response.Headers);
            var bearerToken = token.AccessToken;

            controller.ApiClient.DefaultHeader["API-Key"] = apiKey;
            controller.ApiClient.DefaultHeader["Authorization"] = $"bearer {bearerToken}";
        }

        public OrderRoutingApiWrapper(IApiContext apiContext, ISettings settings)
        {
            _apiContext = apiContext;
            _settings = settings;
            //var basePath = "http://services-tp-dev01.kubedev.kibo-dev.com/order-routing/";
            var basePath = settings.Urls("service-url-FullfilmentWebApi");
            _routingController = new RoutingControllerApi(basePath);
            _routingController.ApiClient.DefaultHeader["x-vol-tenant"] = apiContext.TenantId.ToString();
            _routingController.ApiClient.DefaultHeader["x-vol-site"] = apiContext.SiteId.GetValueOrDefault(0).ToString();
        }

        public SuggestionResponse SuggestRouting(SuggestionRequest request, bool returnSuggestionLog = false)
        {
            AddAuthHeaders(_routingController);
            return _routingController.SuggestRoutingUsingPOST(request, returnSuggestionLog);
        }

        public List<JsonNode> GetSuggestionLog(string externalResponseId, int orderId, int suggestionId, int responseId)
        {
            return _routingController.GetSuggestionLogUsingGET(externalResponseId, orderId, responseId, suggestionId);
        }

        public SuggestionRequest GetSampleRequest()
        {
            return _routingController.GetSampleRequestUsingGET();
        }

        public CandidateSuggestionsResponse SuggestCandidates(CandidateSuggestionsRequest request)
        {
            AddAuthHeaders(_routingController);
            return _routingController.SuggestCandidatesUsingPOST(request);
        }
    }
}