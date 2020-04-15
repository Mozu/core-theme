using Mozu.Core;
using Mozu.Core.Behaviors;
using Mozu.Core.Extensions;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Helpers;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Models.Settings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using Mozu.Core.Configuration;

namespace Mozu.SiteBuilder.UX.Filters
{

    public class IgnoreDataViewModeAttribute : Attribute, IFilterMetadata { };

    public class DataViewModeEnforcementAttribute : ActionFilterAttribute, IAsyncAuthorizationFilter
    {
        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var request = context.HttpContext.Request;
            var resolver = context.HttpContext.RequestServices;
            var apiContext = resolver.Resolve<ISiteBuilderApiContext>();

            // if we don't have a siteid, we're not going to have enough to render the view in the first place so exit early
            if (!apiContext.SiteId.HasValue) return;

            var authhelper = resolver.Resolve<IAuthenticationHelper>();

            // fixup claims to ensure that even anonymous viewers get claims.
            if (apiContext.UserClaims == null) CreateShopperClaimsForSite(apiContext, authhelper);

            var siteContext = resolver.Resolve<ISiteContext>();
            await siteContext.Init();
            var adminToken = authhelper.GetAdminAccessToken();
            var viewMode = apiContext.DataViewMode;

            if (!IsLockedDown(viewMode, GetLockDownToggles(siteContext.GeneralSettings))
                || IsControllerIgnoringDataViewMode(context.ActionDescriptor as ControllerActionDescriptor))
            {
                ShowTheOriginalRequest(apiContext, viewMode);
                return;
            }

            var loginAppHelper = new LoginAppRouteHelper(resolver.Resolve<IMozuSettings>().Domains.GetValue<string>("login", "/login"));
            // else we are in a locked-down state. Is there an admin logged in?
            if (!HasAdminCookie(adminToken))
            {
                var host = GetHostValue(resolver.Resolve<IRequestUrlFinderOuter>());
                context.Result = RedirectTo(CreateLoginLink(loginAppHelper, request.HttpContext.GetRequestUri(), host, apiContext.TenantId));
                return;
            }

            // now that we have an admin, is that admin authed?
            if (!AdminHasBehavior(viewMode, adminToken))
            {
                context.Result = RedirectTo(loginAppHelper.Unauthorized());
                return;
            }

            // hooray, now we can see the thing!
            ShowTheOriginalRequest(apiContext, viewMode);
        }

        private static bool IsControllerIgnoringDataViewMode(ControllerActionDescriptor descriptor)
        {
            return descriptor != null && descriptor.HasAttribute<IgnoreDataViewModeAttribute>();
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

        private static bool AdminHasBehavior(DataViewModeType viewMode, string adminToken)
        {
            if (!adminToken.IsNullOrEmpty() && LightweightUserClaims.TryParse(adminToken, out var claims))
            {
                return viewMode switch
                {
                    DataViewModeType.Live => claims.HasBehavior<ViewLiveBehavior>(),
                    DataViewModeType.Pending => claims.HasBehavior<PublishPreviewBehavior>(),
                    _ => throw new ArgumentException("data view mode must be set")
                };
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
        private static void ShowTheOriginalRequest(IApiContext apiContext, DataViewModeType viewMode)
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
        }

        /// <summary>
        /// Given the desired data view mode and the current site's view mode settings, is this request 'locked down'?
        /// </summary>
        /// <param name="dvm"></param>
        /// <param name="toggles"></param>
        /// <returns></returns>
        private static bool IsLockedDown(DataViewModeType dvm, ViewModeToggles toggles)
        {
            return dvm switch
            {
                DataViewModeType.Pending => toggles.IsRequiredLoginForStagingEnabled,
                DataViewModeType.Live => toggles.IsRequiredLoginForLiveEnabled,
                DataViewModeType.NoneSet => throw new ArgumentException("data view mode must be set", nameof(dvm)),
                _ => false,
            };
        }

        private static bool HasAdminCookie(string adminToken)
        {
            return !adminToken.IsNullOrEmpty();
        }

        private static Uri CreateLoginLink(LoginAppRouteHelper router, Uri requestUri, string postbackHostValue, int tenantId)
        {
            var postback = new UriBuilder(requestUri.Scheme, postbackHostValue, requestUri.Port, "/auth/pants").Uri.ToString();
            return router.To(UserScopeType.Tenant, tenantId, requestUri.PathAndQuery, postback, false);
        }

        private static readonly int[] _publishBehaviorId = { new PublishPreviewBehavior().Id };
        private static LightweightUserClaims AddPreviewPermission(LightweightUserClaims inClaims)
        {
            return AddPermission(inClaims, _publishBehaviorId);
        }

        private static readonly int[] _liveBehaviorId = { new ViewLiveBehavior().Id };
        private static LightweightUserClaims AddLivePermission(LightweightUserClaims inClaims)
        {
            return AddPermission(inClaims, _liveBehaviorId);
        }

        private static LightweightUserClaims AddPermission(LightweightUserClaims inClaims, params int[] perms)
        {
            inClaims.BehaviorIds = inClaims.BehaviorIds.Concat(perms).ToArray();
            return inClaims;
        }

        private static RedirectResult RedirectTo(Uri redirectUrl)
        {
            return new RedirectResult(redirectUrl.ToString());
        }
    }
}
