using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Mozu.Core;
using Mozu.Core.Api.Handlers.Message;
using Mozu.Core.Api.Session;
using Mozu.Core.Configuration;
using Mozu.Core.Logging;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Handler;
using Mozu.SiteBuilder.Mvc.Security;

namespace Mozu.SiteBuilder.Mvc.Middleware
{
    public class SiteBuilderSessionMessageHandler : IMiddleware
    {
        public static IServiceCollection ReplaceMozuCoreSessionManagerHandler(IServiceCollection collection)
        {
            collection.AddScoped<IMiddlewareFactory, SiteBuilderMiddlewareFactory>();
            collection.AddScoped<SiteBuilderSessionMessageHandler>();
            return collection;
        }

        class SiteBuilderMiddlewareFactory : IMiddlewareFactory
        {
            // The default middleware factory is just an IServiceProvider proxy.
            // This should be registered as a scoped service so that the middleware instances
            // don't end up being singletons.
            private readonly IServiceProvider _serviceProvider;
            private readonly Type _type = typeof(Mozu.Core.Api.Handlers.Message.SessionMessageHandler);

            public SiteBuilderMiddlewareFactory(IServiceProvider serviceProvider)
            {
                _serviceProvider = serviceProvider;
            }

            public IMiddleware Create(Type middlewareType)
            {
                if (middlewareType == _type)
                {
                    return (IMiddleware) _serviceProvider.GetService<SiteBuilderSessionMessageHandler>();
                }
                return _serviceProvider.GetRequiredService(middlewareType) as IMiddleware;
            }

            public void Release(IMiddleware middleware)
            {
            }
        }

        public const string ConfigSwitch = Mozu.Core.Constants.Session.INIT_CTX_FROM_SESSION_KEY;
        public const string PristListCodeKey = Mozu.Core.Constants.Session.PRICELIST_CODE_KEY;
        public const string PricePlanCodeKey = Mozu.Core.Constants.Session.PRICEPLAN_CODE_KEY;
        public const string PurchaseLocationKey = Mozu.Core.Constants.Session.PURCHASE_LOCATION_KEY;
        private readonly SiteBuilderApiContext apiContext;
        private readonly ISettings settings;
        private readonly Lazy<IMozuSession> session;
        private readonly ILogger<SessionMessageHandler> _logger;

        async Task IMiddleware.InvokeAsync(HttpContext context, RequestDelegate next)
        {
            await Process(apiContext, settings, session, context.RequestAborted, _logger);
            await next(context);
            return;
        }

        public SiteBuilderSessionMessageHandler(IApiContext apiContext, ISettings settings, Lazy<IMozuSession> session
            , ILogger<SessionMessageHandler> logger)
        {
            this.apiContext = apiContext as SiteBuilderApiContext;
            this.settings = settings;
            this.session = session;
            this._logger = logger;
        }

        static async Task Process(

            SiteBuilderApiContext apiContext,
            ISettings settings,
            Lazy<IMozuSession> session,
            CancellationToken cancellationToken,
            ILogger<SessionMessageHandler> logger
        )
        {
            
            var hasSession = apiContext.IsReturnUser  && 
                             apiContext.UserClaims != null &&
                             (apiContext.CallChain?.Length == 0 || apiContext?.UserClaims?.SessionInfo?.IsBot == false);
            //(apiContext?.UserClaims?.SessionInfo?.IsPersisted == true || 
            var allowLookup = settings.AppSettingsAsNullableBool(ConfigSwitch).GetValueOrDefault(true);

            if (hasSession && allowLookup)
            {
                try
                {
                    var bucket = await session.Value.GetBucketAsync(token: cancellationToken).ConfigureAwait(false);
                    if (bucket != null)
                    {
                        apiContext.PriceListCode = (string) bucket.GetValue(PristListCodeKey, apiContext.PriceListCode);
                        apiContext.PricePlanCode = (string) bucket.GetValue(PricePlanCodeKey, apiContext.PricePlanCode);
                        apiContext.PurchaseLocation =
                            (string) bucket.GetValue(PurchaseLocationKey, apiContext.PurchaseLocation);
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "error in session");
                }
            }

        }
    }

    public class SessionMiddleware
    {
        private const int MAX_TIME_IN_MINUTES = 30;
        private const string NULL_PRICE_LIST_CODE = "nullPriceListCode";

        private readonly RequestDelegate _next;

        public SessionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context, ISiteBuilderApiContext apiContext, IRequestUrlFinderOuter requestHelper, IAuthenticationHelper authHelper, IMozuSession session)
        {
            if (!TryGetPriceListOverride(apiContext, context, out var priceListOverride) && !RequiresUpdatedSession(apiContext, requestHelper, authHelper))
            {
                await _next.Invoke(context);
                return;
            }

            var logger = LoggingService.LoggerFor<SessionMiddleware>();
            if (!Equals(priceListOverride, NULL_PRICE_LIST_CODE))
            {
                SetOveridePriceList(apiContext, authHelper, session, priceListOverride, logger);
            }
            else
            {
                await InitSession(apiContext, authHelper, session, context.RequestServices.Resolve<IPriceListResolutionHandler>(), logger).ConfigureAwait(false);
            }

            await _next.Invoke(context);
        }

        private static void SetOveridePriceList(ISiteBuilderApiContext apiContext, IAuthenticationHelper authHelper, IMozuSession session, string priceListOverride, ILogger logger)
        {
            apiContext.SetPriceListCode(priceListOverride);
            try
            {
                session.SetValue(SessionMessageHandler.PristListCodeKey, priceListOverride);
                authHelper.SaveStoreFrontAccessToken(apiContext.UserClaims.ToAccessToken(), authHelper.GetProfileToken());
            }
            catch (Exception ex)
            {
                logger.Warn("error writing to session", ex);

            }
        }

        private static async Task InitSession(ISiteBuilderApiContext apiContext, IAuthenticationHelper authHelper, IMozuSession session, IPriceListResolutionHandler priceListResolutionHandler, ILogger logger)
        {
            apiContext.UserClaims.SessionInfo = new SessionInfo();

            try
            {
                apiContext.UserClaims.SessionInfo.LastModified = DateTime.UtcNow;
                var res = await priceListResolutionHandler.ResolvePriceList(apiContext.UserClaims.AccountId).ConfigureAwait(false);
                if (!string.IsNullOrEmpty(res))
                {
                    await session.SetValueAsync(SessionMessageHandler.PristListCodeKey, res);
                }
                apiContext.SetPriceListCode(res);
                authHelper.SaveStoreFrontAccessToken(apiContext.UserClaims.ToAccessToken(), authHelper.GetProfileToken());
            }
            catch (Exception ex)
            {
                logger.Warn("error accessing pricelist resolver", ex);
                //should we reset the session or let it try to fail again?
            }
        }

        private static bool RequiresUpdatedSession(IApiContext apiContext, IRequestUrlFinderOuter requestHelper, IAuthenticationHelper authHelper)
        {
            if (apiContext.UserClaims == null || apiContext.SiteId == null || requestHelper.IsCdnRequest())
            {
                return false;
            }

            LightweightUserClaims.TryParse(authHelper.GetStoreFrontSessionAccessToken(), out var sUserClaims);
            LightweightUserClaims.TryParse(authHelper.GetStoreFrontAccessToken(), out var pUserClaims);
            var cookieDate = authHelper.GetStoreFrontSessionAccessTokenDate();

            if (sUserClaims == null && pUserClaims == null)
            {
                return false;
                //first request or bot or something ... do nothing..
            }

            if (sUserClaims?.SessionInfo?.Id != pUserClaims?.SessionInfo?.Id) return true;
            if (cookieDate == null)
            {
                return false;
            }
            var mins = (cookieDate.Value.ToUniversalTime() - DateTime.UtcNow).TotalMinutes;

            if (mins < MAX_TIME_IN_MINUTES / 2)
            {
                return false;
            }

            if (!(mins < MAX_TIME_IN_MINUTES)) return true;

            //reset cookietime
            authHelper.SaveStoreFrontAccessToken(apiContext.UserClaims.ToAccessToken(), authHelper.GetProfileToken());
            return false;
        }

        private static bool TryGetPriceListOverride(IApiContext apiContext, HttpContext context, out string priceList)
        {
            priceList = NULL_PRICE_LIST_CODE;
            if (apiContext.DataViewMode != DataViewModeType.Pending)
            {
                return false;
            }

            var val = context.Request.Query.Where(x => string.Equals(x.Key, "mz_pricelist", StringComparison.OrdinalIgnoreCase)).Select(x => x.Value).FirstOrDefault();
            if (val.Count == 0) return false;

            priceList = val;
            return true;
        }
    }
}
