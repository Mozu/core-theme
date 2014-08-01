using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Mozu.Core;
using Mozu.Core.Exceptions;
using Mozu.Core.Settings;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public class BirstTokenGenerator
    {
        private const string TOKEN_URI_KEY = "BirstTokenGeneratorUrl";
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

        public async Task<string> GenerateToken()
        {
            var tokenGenUri = GetBirstTokenGeneratorUri(_apiContext.TenantId);
            var httpClient = new HttpClient(new HttpClientHandler());
            HttpResponseMessage responseMsg = await httpClient.PostAsync(tokenGenUri, new HttpMessageContent(new HttpResponseMessage()));
            if (responseMsg.IsSuccessStatusCode)
            {
                return await responseMsg.Content.ReadAsStringAsync();
            }
            throw new VaeUnexpectedErrorException(string.Format("Unexpected error with status code:{0}", responseMsg.StatusCode));
        }

        private string GetBirstTokenGeneratorUri(int tenantId)
        {
            return string.Format("{0}?username={1}&ssopassword={2}&BirstSpaceId={3}&birst.sessionVars=tenantId%3D{4}",
                _settings.AppSettings(TOKEN_URI_KEY),
                _settings.AppSettings(USER_KEY),
                _settings.AppSettings(PASSWORD_KEY),
                _settings.AppSettings(SPACE_KEY),
                tenantId
                );
        }
    }
}