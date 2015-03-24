using Autofac;
using Autofac.Integration.WebApi;
using Mozu.Core;
using Mozu.Core.Extensions;
using Mozu.Core.Behaviors;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using Mozu.SiteBuilder.UX.Models.Settings;
using System.Collections.Concurrent;

namespace Mozu.SiteBuilder.UX.MessageHandlers
{
    /// <summary>
    /// Because live and pending sites can be locked down, this handler ensures that callers that are trying to access locked down content have the appropriate behavior.
    /// </summary>
    public class ViewRestrictionHandler : DelegatingHandler
    {
        private Lazy<InternalIpRanges> _mozuInternalIps;

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            // the auth controller's Pants url is used to actually post cookies, so we let them pass:
            // TODO: is this ok?  Is there a more fault-tolerant way of getting the route to the pants action? (besides reflection :P)
            if (request.RequestUri.PathAndQuery.StartsWith("/auth/pants", StringComparison.OrdinalIgnoreCase)) return await base.SendAsync(request, cancellationToken);
            var requestScope = GetRequestScope(request);
            var apiContext = requestScope.Resolve<ISiteBuilderApiContext>();

            // if we don't have a siteid, we're not going to have enough to render the view in the first place
            if (!apiContext.SiteId.HasValue) return await base.SendAsync(request, cancellationToken);
                
            var siteContext = requestScope.Resolve<ISiteContext>();
            var authhelper = requestScope.Resolve<IAuthenticationHelper>();
            var settings = requestScope.Resolve<ISettings>();
            var cookieProvider = requestScope.Resolve<ICookieProvider>();
            var requestIp = Core.Api.Handlers.Message.MessageLoggingHelper.GetClientIpAddress(request);
            if (_mozuInternalIps == null) _mozuInternalIps = new Lazy<InternalIpRanges>(() => new InternalIpRanges(settings.AppSettings("mozu_internal_ips")));


            // fixup claims to ensure that even anonymous viewers get claims.
            if (apiContext.UserClaims == null && apiContext.SiteId.HasValue)
            {
                var anonClaims = LightweightUserClaims.CreateForAnonymousShopper(apiContext.TenantId, apiContext.SiteId.GetValueOrDefault());
                // fixup the claims for an anonymous shopper
                apiContext.SetUser(anonClaims);
                authhelper.SaveStoreFrontAccessToken(anonClaims.ToAccessToken(), null);
            }

            await siteContext.Init();
            var adminToken = authhelper.GetAdminAccessToken();
            var viewMode = apiContext.DataViewMode;

            if (!IsLockedDown(viewMode, new ViewModeToggles { IsRequiredLoginForLiveEnabled = siteContext.GeneralSettings.IsRequiredLoginForLiveEnabled.GetValueOrDefault(), IsRequiredLoginForStagingEnabled = siteContext.GeneralSettings.IsRequiredLoginForStagingEnabled.GetValueOrDefault()}))
            {
                return await ShowTheOriginalRequest(request, cancellationToken, apiContext, viewMode);
            }

            // else we are in a locked-down state. Is there an admin logged in(or is our IP mozu/volusion identified)?
            if (!HasAdminCookie(adminToken) && !IsVolusionIp(requestIp))
            {
                IEnumerable<string> hostValues;
                var hostHeaderPresent = request.Headers.TryGetValues("host", out hostValues);
                return RedirectTo(CreateLoginLink(settings, request.RequestUri.PathAndQuery, hostHeaderPresent ? hostValues.First() : request.RequestUri.Host));
            }

            // now that we have an admin, is that admin authed?
            if (!AdminHasBehavior(viewMode, adminToken)) return RedirectTo(CreateUnauthLink(settings));
            
            // hooray, now we can see the thing!
            return await ShowTheOriginalRequest(request, cancellationToken, apiContext, viewMode);
        }

        //TESTING ONLY
        public async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request)
        {
            return await SendAsync(request, new CancellationTokenSource().Token);
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
            if( !adminToken.IsNullOrEmpty() && LightweightUserClaims.TryParse(adminToken, out claims))
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

        private async Task<HttpResponseMessage> ShowTheOriginalRequest(HttpRequestMessage request, CancellationToken cancellationToken, ISiteBuilderApiContext apiContext, DataViewModeType viewMode)
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
            return await base.SendAsync(request, cancellationToken);
        }

        private static bool IsLockedDown(DataViewModeType dvm, ViewModeToggles toggles)
        {
            switch (dvm) {
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

        private Uri CreateLoginLink(ISettings settings, string pathAndQuery, string postbackHostValue)
        {
            var builder = CreateLinkForLoginApp(settings, "to");
            var queryDict = new Dictionary<string, string> {
                { "scopeType", "Tenant" },
                { "redirectUrl", pathAndQuery},
                { "postbackUrl",  new UriBuilder("https", postbackHostValue, 80, "/auth/pants").Uri.ToString()}
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

    public static class UserClaimExtensions {
        private static ConcurrentDictionary<Type, int> cachedThings = new ConcurrentDictionary<Type, int>();
        public static bool HasBehavior<T>(this LightweightUserClaims claims) where T : BehaviorDefinition, new()
        {
            var tid = cachedThings.GetOrAdd(typeof(T), t => new T().Id);
            return claims.BehaviorIds.Contains(tid);
        }
    }

    public static class DictionaryExtensions
    {
        /// <summary>
        /// creates a query string from a dictionary of string, string.  This query string is NOT prepended with '?'. This is so you can set a System.Web.Uri's Query property with this and not get duplicate '?' characters.
        /// </summary>
        /// <param name="values"></param>
        /// <returns></returns>
        public static string ToQueryString(this Dictionary<string, string> values)
        {
            var strings = 
                values
                .Where(x => !x.Value.IsNullOrEmpty())
                .Select((x, i) => string.Format("{0}{1}={2}", i == 0 ? string.Empty : "&", x.Key, HttpUtility.UrlEncode(x.Value)));
            return string.Join(string.Empty, strings);
        }
    }
}