using Autofac;
using Autofac.Integration.WebApi;
using Mozu.Core;
using Mozu.Core.Api.Handlers.Message;
using Mozu.Core.Behaviors;
using Mozu.Core.Extensions;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Models.Settings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace Mozu.SiteBuilder.UX.Filters
{
    public class DataViewModeEnforcementAttribute : FilterAttribute, IAuthorizationFilter
    {
        static Lazy<InternalIpRanges> _mozuInternalIps;
        public override bool AllowMultiple { get { return false; } }

        public async Task<HttpResponseMessage> ExecuteAuthorizationFilterAsync(HttpActionContext actionContext, CancellationToken cancellationToken, Func<Task<HttpResponseMessage>> continuation)
        {
            var request = actionContext.Request;
            var resolver = GetRequestScope(request);
            var apiContext = resolver.Resolve<ISiteBuilderApiContext>();

            // if we don't have a siteid, we're not going to have enough to render the view in the first place so exit early
            if (!apiContext.SiteId.HasValue) return await continuation();

            var settings = resolver.Resolve<ISettings>();
            var authhelper = resolver.Resolve<IAuthenticationHelper>();
            if (_mozuInternalIps == null) _mozuInternalIps = new Lazy<InternalIpRanges>(() => new InternalIpRanges(settings.AppSettings("mozu_internal_ips")));

            // fixup claims to ensure that even anonymous viewers get claims.
            if (apiContext.UserClaims == null && apiContext.SiteId.HasValue) CreateShopperClaimsForSite(apiContext, authhelper);

            var siteContext = resolver.Resolve<ISiteContext>();
            await siteContext.Init();
            var adminToken = authhelper.GetAdminAccessToken();
            var viewMode = apiContext.DataViewMode;

            if (!IsLockedDown(viewMode, GetLockDownToggles(siteContext.GeneralSettings)))
            {
                return await ShowTheOriginalRequest(apiContext, viewMode, continuation);
            }

            // else we are in a locked-down state. Is there an admin logged in(or is our IP mozu/volusion identified)?
            if (!HasAdminCookie(adminToken) && !IsVolusionIp(MessageLoggingHelper.GetClientIpAddress(request)))
            {
                string host = GetHostValue(resolver.Resolve<IRequestUrlFinderOuter>());
                return RedirectTo(CreateLoginLink(settings, request.RequestUri, host));
            }

            // now that we have an admin, is that admin authed?
            if (!AdminHasBehavior(viewMode, adminToken)) return RedirectTo(CreateUnauthLink(settings));

            // hooray, now we can see the thing!
            return await ShowTheOriginalRequest(apiContext, viewMode, continuation);
        }

        private static string GetHostValue(IRequestUrlFinderOuter finder)
        {
            var requestUrl = finder.GetRequestUrl();
            return new UriBuilder(requestUrl).Uri.Host;
        }

        private static void CreateShopperClaimsForSite(ISiteBuilderApiContext apiContext, IAuthenticationHelper authhelper)
        {
            var anonClaims = LightweightUserClaims.CreateForAnonymousShopper(apiContext.TenantId, apiContext.SiteId.GetValueOrDefault());
            apiContext.SetUser(anonClaims);
            authhelper.SaveStoreFrontAccessToken(anonClaims.ToAccessToken(), null);
        }

        private static ViewModeToggles GetLockDownToggles(GeneralSettings settings)
        {
            return new ViewModeToggles {
                IsRequiredLoginForLiveEnabled = settings.IsRequiredLoginForLiveEnabled.GetValueOrDefault(),
                IsRequiredLoginForStagingEnabled = settings.IsRequiredLoginForStagingEnabled.GetValueOrDefault()
            };
        }

        private bool IsVolusionIp(string ip)
        {
            IPAddress casted;
            if (IPAddress.TryParse(ip, out casted)) return _mozuInternalIps.Value.Includes(casted);
            return false;
        }
        private static Uri CreateUnauthLink(ISettings settings)
        {
            return CreateLinkForLoginApp(settings, "unauthorized/index").Uri;
        }

        private static UriBuilder CreateLinkForLoginApp(ISettings settings, string route)
        {
            var builder = new UriBuilder(settings.LoginPath);
            builder.Path = string.Format("login/{0}", route.Trim());
            return builder;
        }

        private static bool AdminHasBehavior(DataViewModeType viewMode, string adminToken)
        {
            LightweightUserClaims claims;
            if (!adminToken.IsNullOrEmpty() && LightweightUserClaims.TryParse(adminToken, out claims))
            {
                switch (viewMode)
                {
                    case DataViewModeType.Live: return claims.HasBehavior<ViewLiveBehavior>();
                    case DataViewModeType.Pending: return claims.HasBehavior<PublishPreviewBehavior>();
                    default: throw new ArgumentException("data view mode must be set");
                }
            }
            return false;
        }

        /// <summary>
        /// Performs the original continuation, but with an appropriate permission behavior added to the context's user claims, as determined by the dataviewmode of the request.
        /// </summary>
        /// <param name="apiContext"></param>
        /// <param name="viewMode"></param>
        /// <param name="continuation"></param>
        /// <returns></returns>
        private async Task<HttpResponseMessage> ShowTheOriginalRequest(ISiteBuilderApiContext apiContext, DataViewModeType viewMode, Func<Task<HttpResponseMessage>> continuation)
        {
            switch (viewMode)
            {
                case DataViewModeType.Pending:
                    AddPreviewPermission(apiContext.UserClaims);
                    break;
                case DataViewModeType.Live:
                    AddLivePermission(apiContext.UserClaims);
                    break;
                case DataViewModeType.NoneSet:
                    throw new ArgumentException("data view mode must be set");
            }
            return await continuation();
        }

        /// <summary>
        /// Given the desired data view mode and the current site's view mode settings, is this request 'locked down'?
        /// </summary>
        /// <param name="dvm"></param>
        /// <param name="toggles"></param>
        /// <returns></returns>
        private static bool IsLockedDown(DataViewModeType dvm, ViewModeToggles toggles)
        {
            switch (dvm)
            {
                case DataViewModeType.Pending: return toggles.IsRequiredLoginForStagingEnabled;
                case DataViewModeType.Live: return toggles.IsRequiredLoginForLiveEnabled;
                case DataViewModeType.NoneSet: throw new ArgumentException("dvm", "data view mode must be set");
            }
            return false;
        }

        private static bool HasAdminCookie(string adminToken)
        {
            return !adminToken.IsNullOrEmpty();
        }

        private Uri CreateLoginLink(ISettings settings, Uri requestUri, string postbackHostValue)
        {
            var builder = CreateLinkForLoginApp(settings, "to");
            var queryDict = new Dictionary<string, string> {
                { "scopeType", "Tenant" },
                { "redirectUrl", requestUri.PathAndQuery},
                { "postbackUrl",  new UriBuilder(requestUri.Scheme, postbackHostValue, requestUri.Port, "/auth/pants").Uri.ToString()}
            };
            builder.Query = queryDict.ToQueryString();
            return builder.Uri;
        }

        static readonly int[] _publishBehaviorId = new[] { new PublishPreviewBehavior().Id };
        private static LightweightUserClaims AddPreviewPermission(LightweightUserClaims inClaims)
        {
            return AddPermission(inClaims, _publishBehaviorId);
        }

        static readonly int[] _liveBehaviorId = new[] { new ViewLiveBehavior().Id };
        private static LightweightUserClaims AddLivePermission(LightweightUserClaims inClaims)
        {
            return AddPermission(inClaims, _liveBehaviorId);
        }

        private static LightweightUserClaims AddPermission(LightweightUserClaims inClaims, params int[] perms)
        {
            inClaims.BehaviorIds = inClaims.BehaviorIds.Concat(perms).ToArray();
            return inClaims;
        }

        private static ILifetimeScope GetRequestScope(HttpRequestMessage request)
        {
            var thing = request.GetDependencyScope();
            return thing.GetRequestLifetimeScope();
        }

        private static HttpResponseMessage RedirectTo(Uri redirectUrl)
        {
            var response = new HttpResponseMessage(HttpStatusCode.Redirect);
            response.Headers.Location = redirectUrl;
            return response;
        }
    }
}
