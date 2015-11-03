using Mozu.Core;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.Extensions;
using System;
using System.Collections.Generic;

namespace Mozu.SiteBuilder.Mvc.Helpers
{
    public class LoginAppRouteHelper
    {
        readonly Uri _basePath;


        public LoginAppRouteHelper(string loginAppBasePath)
        {
            _basePath = new Uri(loginAppBasePath);
        }

        public Uri Unauthorized()
        {
            var builder = new UriBuilder(_basePath);
            builder.Path = "login/unauthorized/index";
            return builder.Uri;
        }

        public Uri Launchpad(UserScopeType scopeType, string postbackUrl, bool showDev)
        {
            var builder = new UriBuilder(_basePath);
            builder.Path = "login";
            var queryDict = new Dictionary<string, string>
            {
                { "scopetype", scopeType.ToStringQuickly() },
                { "postbackurl", postbackUrl },
                { "showdev", showDev.ToString() }
            };
            builder.Query = queryDict.ToQueryString();
            return builder.Uri;
        }

        public Uri To(UserScopeType scopeType, int? scopeId, string redirectUrl, string postBackUrl, bool showDev)
        {
            var builder = new UriBuilder(_basePath);
            builder.Path = "login/to";
            var queryDict = new Dictionary<string, string>
            {
                { "scopetype", scopeType.ToStringQuickly() },
                { "scopeid", scopeId.ToString() },
                { "redirecturl", redirectUrl },
                { "postbackurl", postBackUrl },
                { "showdev", showDev.ToString() }
            };
            builder.Query = queryDict.ToQueryString();
            return builder.Uri;
        }

        public Uri Logout(UserScopeType scopeType, string postback, bool showDev)
        {
            var builder = new UriBuilder(_basePath);
            builder.Path = "login/home/logout";
            var queryDict = new Dictionary<string, string>
            {
                { "scopetype", scopeType.ToStringQuickly() },
                { "postbackurl", postback },
                { "showdev", showDev.ToString() }
            };
            builder.Query = queryDict.ToQueryString();
            return builder.Uri;
        }
    }
}
