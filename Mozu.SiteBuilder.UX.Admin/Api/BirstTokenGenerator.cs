using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Mozu.Core;
using Mozu.Core.Exceptions;
using Mozu.Core.Logging;
using Mozu.Core.Settings;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public interface IBirstTokenGenerator
    {
        Task<string> GenerateDashboardUri();
    }

    public class BirstTokenGenerator : IBirstTokenGenerator
    {
        private const string TOKEN_URL_KEY = "BirstTokenGeneratorUrl";
        private const string SSO_URL_KEY = "BirstSsoUrl";
        private const string USER_KEY = "BirstUserName";
        private const string PASSWORD_KEY = "BirstSsoPassword";
        private const string SPACE_KEY = "BirstSpaceId";

        private readonly ISettings _settings;
        private readonly IApiContext _apiContext;

        public BirstTokenGenerator(IApiContext apiContext, ISettings settings)
        {
            _settings = settings;
            _apiContext = apiContext;
        }

        public async Task<string> GenerateDashboardUri()
        {
            //"https://reporting.mozu-qa.com/SSO.aspx",//"https://aus02ndbrst01.dev.volusion.com/SSO.aspx",//
            var token = await GenerateToken();
            return string.Format(
                "{0}?BirstSSOToken={1}&birst.module=dashboard&birst.dashboard=Dev%2520Dashboard&birst.page=Start%2520Here&birst.helpURL=&birst.exportZoom=2&birst.embedded=true&birst.hideDashboardNavigation=true&birst.hideDashboardPrompts=true&birst.openPageForEdit=false&birst.viewMode=full&birst.filterLayout=left",
                   "https://aus02ndbrst01.dev.volusion.com/SSO.aspx",// _settings.AppSettings(SSO_URL_KEY),
                    token
                );
        }

        private async Task<string> GenerateToken()
        {
            var tokenGenUri = FormatBirstTokenGeneratorUri(_apiContext.TenantId);
            var httpClient = new HttpClient(new HttpClientHandler());
            try
            {
                HttpResponseMessage responseMsg = await httpClient.PostAsync(tokenGenUri, new HttpMessageContent(new HttpResponseMessage()));
                if (responseMsg.IsSuccessStatusCode)
                {
                    return await responseMsg.Content.ReadAsStringAsync();
                }
            }
            catch (Exception err)
            {
                LoggingService.LoggerFor<BirstTokenGenerator>().Error(err.Message, err);
            }
            throw new VaeUnexpectedErrorException("Unexpected error with status code");
        }

        private string FormatBirstTokenGeneratorUri(int tenantId)
        {
            //"https://reporting.mozu-qa.com/TokenGenerator.aspx",//"https://aus02ndbrst01.dev.volusion.com/TokenGenerator.aspx",//
            // tenantId = 2106;
            // 1055
            return string.Format("{0}?username={1}&ssopassword={2}&BirstSpaceId={3}&birst.sessionVars=TenantId%3D{4}",
                "https://aus02ndbrst01.dev.volusion.com/TokenGenerator.aspx",//_settings.AppSettings(TOKEN_URL_KEY),
                "reportuserqa@mozu.com",//_settings.AppSettings(USER_KEY),
                "4mSPFxPJcUYhtTMA0Zkh7Akq2BFUUEij",//_settings.AppSettings(PASSWORD_KEY),
                "61b81c44-14d9-4e84-bd8f-6c4794f43763",//_settings.AppSettings(SPACE_KEY),
                tenantId
            );
        }
    }
}