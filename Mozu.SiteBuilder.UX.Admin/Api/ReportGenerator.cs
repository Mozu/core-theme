using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Mozu.Core;
using Mozu.Core.Exceptions;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Reports;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public interface IReportGenerator
    {
        Task<string> GenerateDashboardUri(ReportParams reportParams);
    }

    public class ReportGenerator : IReportGenerator
    {
        private const string LOOKER_HOST = "LookerHost";
        private const string SECRET_KEY = "LookerSecret";
        private const string TIMEOUT_KEY = "LookerTimeout";
        private const string DEFAULT_EMBED_URL = "LookerDefaultEmbedUrl";
        private const string VIEWER_GROUP_ID = "LookerEmbedViewerGroupId";
        private const string EDITOR_GROUP_ID = "LookerEmbedEditorGroupId";

        private readonly ISettings _settings;
        private readonly IApiContext _apiContext;

        public ReportGenerator(IApiContext apiContext, ISettings settings)
        {
            _settings = settings;
            _apiContext = apiContext;
        }


        public async Task<string> GenerateDashboardUri(ReportParams reportParams)
        {
            var unixTime = (Int32)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;

            var secret = _settings.AppSettings(SECRET_KEY);
            var host = _settings.AppSettings(LOOKER_HOST);
            var defaultPage = _settings.AppSettings(DEFAULT_EMBED_URL);

            var viewerGroupId = int.Parse(_settings.AppSettings(VIEWER_GROUP_ID));
            var editorGroupId = int.Parse(_settings.AppSettings(EDITOR_GROUP_ID));

            if (string.IsNullOrEmpty(secret) || string.IsNullOrEmpty(host))
                throw new VaeMissingOrInvalidParameterException("Secret or Url is missing");


            var queryParams = new Dictionary<string, object>();

            queryParams.Add("nonce", DateTime.Now.Ticks.ToString());
            queryParams.Add("time", unixTime);
            queryParams.Add("session_length", int.Parse(_settings.AppSettings(TIMEOUT_KEY)));
            queryParams.Add("external_user_id", $"{_apiContext.UserClaims.UserFirstName}.{_apiContext.UserClaims.UserLastName}.{_apiContext.TenantId}");
            queryParams.Add("permissions", new List<string>(){"embed_browse_spaces", "see_drill_overlay"});

            queryParams.Add("models", new List<string>() {});


            var groupIds = new List<int> { viewerGroupId };
            var externalGroupId = _apiContext.TenantId.ToString();
            
            if(_apiContext.UserClaims.BehaviorIds.Contains(new Mozu.Core.Behaviors.ReportDefinitionCreateBehavior().Id) &&
                _apiContext.UserClaims.BehaviorIds.Contains(new Mozu.Core.Behaviors.ReportDefinitionUpdateBehavior().Id) &&
                _apiContext.UserClaims.BehaviorIds.Contains(new Mozu.Core.Behaviors.ReportDefinitionDeleteBehavior().Id))
            {
                groupIds.Add(editorGroupId);
                externalGroupId += $"_Editor";
            }
            else
            {
                externalGroupId += $"_Viewer";
            }


            queryParams.Add("group_ids", groupIds);
            queryParams.Add("external_group_id", externalGroupId);

            queryParams.Add("user_attributes", new { tenant = _apiContext.TenantId.ToString() });

            queryParams.Add("access_filters", new object());


            var urlToSign = host;

            urlToSign += "\n/login/embed/" + HttpUtility.UrlEncode(defaultPage);




            urlToSign += "\n" + string.Join("\n", queryParams.Select(kv => Newtonsoft.Json.JsonConvert.SerializeObject(kv.Value)));

            var signature = EncodeString(urlToSign, secret);



            queryParams.Add("first_name", _apiContext.UserClaims.UserFirstName);
            queryParams.Add("last_name", _apiContext.UserClaims.UserLastName);



            queryParams.Add("force_logout_login", true);
            
            var embedUrl = $"https://{host}/login/embed/{HttpUtility.UrlEncode(defaultPage)}";

            var embedQuery = string.Join("&", queryParams.Select(kv => $"{kv.Key}={HttpUtility.UrlEncode(Newtonsoft.Json.JsonConvert.SerializeObject(kv.Value))}"));

            var fullUrl = embedUrl + "?" + embedQuery + $"&signature={HttpUtility.UrlEncode(signature)}";
            
            return fullUrl;
        }


        private static string EncodeString(string urlToSign, string secret)
        {
            var bytes = Encoding.UTF8.GetBytes(secret);
            var stringToEncode = Encoding.UTF8.GetBytes(urlToSign);
            using (HMACSHA1 hmac = new HMACSHA1(bytes))
            {
                var rawHmac = hmac.ComputeHash(stringToEncode);
                return Convert.ToBase64String(rawHmac);
            }

        }
    }
    
}