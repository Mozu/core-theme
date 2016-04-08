using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.Mvc.OAF;
using Mozu.Core.Api.Session;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.Core;
using Mozu.SiteBuilder.Mvc.Handler;
using Mozu.Core.Api.Handlers.Message;
using Mozu.Core.Logging;

namespace Mozu.SiteBuilder.Mvc.MessageHandler
{
    public class SessionHandler : DelegatingHandler
    {
        const int MaxTimeInMInutes = 30;

        const string NULLPRICELISTCODE = "nullPriceListCode";
        protected override async Task<HttpResponseMessage> SendAsync(
           HttpRequestMessage request,
           CancellationToken cancellationToken)
        {
            var apiContext = request.Resolve<ISiteBuilderApiContext>();
            var requestHelper = request.Resolve<IRequestUrlFinderOuter>();
            var authHelper = request.Resolve<IAuthenticationHelper>();
            var priceListOverride = (string)null;
            if ( !TryGetPriceListOverride(apiContext, request, out priceListOverride) && !RequiresUpdatedSession(request, apiContext, requestHelper, authHelper))
            {
                return await base.SendAsync(request, cancellationToken).ConfigureAwait(false);
            }

            var session = request.Resolve<Lazy<IMozuSession>>();
            var logger = LoggingService.LoggerFor<SessionHandler>();
            if ( !object.Equals( priceListOverride , NULLPRICELISTCODE ))
            {
                SetOveridePriceList(apiContext, session , priceListOverride, logger);
            }
            else
            {
                await InitSession(apiContext, authHelper, session, request.Resolve<IPriceListResolutionHandler>(), logger).ConfigureAwait(false);
            }
            
            

            return await base.SendAsync(request, cancellationToken).ConfigureAwait(false);
        }


        private static void SetOveridePriceList(ISiteBuilderApiContext apiContext, Lazy<IMozuSession> session , string priceListOverride, ILogger logger)
        {
            apiContext.SetPriceListCode(priceListOverride);
            try
            {
                session.Value.SetValue(SessionMessageHandler.PristListCodeKey, priceListOverride);
            }
            catch (Exception ex)
            {
                logger.Warn("error writing to session", ex);
               
            }
        }


        private static async Task InitSession(ISiteBuilderApiContext apiContext, IAuthenticationHelper authHelper, Lazy<IMozuSession> session, IPriceListResolutionHandler priceListResolutionHandler, ILogger  logger)
        {
            apiContext.UserClaims.SessionInfo = new SessionInfo();

            try
            {
                apiContext.UserClaims.SessionInfo.LastModified = DateTime.UtcNow;
                var res = await priceListResolutionHandler.ResolvePriceList().ConfigureAwait(false);
                if (!string.IsNullOrEmpty(res))
                {
                    session.Value.SetValue(SessionMessageHandler.PristListCodeKey, res);
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

        private static bool RequiresUpdatedSession(HttpRequestMessage request, ISiteBuilderApiContext apiContext, IRequestUrlFinderOuter requestHelper, IAuthenticationHelper authHelper)
        {
            if (apiContext.UserClaims == null || apiContext.SiteId == null || requestHelper.IsCdnRequest())
            {
                return false;
            }



            LightweightUserClaims sUserClaims;
            LightweightUserClaims pUserClaims;
            LightweightUserClaims.TryParse(authHelper.GetStoreFrontSessionAccessToken(), out sUserClaims);
            LightweightUserClaims.TryParse(authHelper.GetStoreFrontAccessToken(), out pUserClaims);
            var cookieDate = authHelper.GetStoreFrontSessionAccessTokenDate();


            if (sUserClaims == null && pUserClaims == null)
            {
                return false;
                //first request or bot or something ... do nothing..
            }

            if (sUserClaims?.SessionInfo?.Id == pUserClaims?.SessionInfo?.Id)
            {
                if (cookieDate == null)
                {
                    return false;
                }
                var mins = (cookieDate.Value.ToUniversalTime() - DateTime.UtcNow).TotalMinutes;

                if (mins < MaxTimeInMInutes / 2)
                {
                    return false;
                }
                if (mins < MaxTimeInMInutes)
                {
                    //reset cookietime
                    authHelper.SaveStoreFrontAccessToken(apiContext.UserClaims.ToAccessToken(), authHelper.GetProfileToken());
                    return false;
                }

            }
            return true;
        }


        private static bool TryGetPriceListOverride(ISiteBuilderApiContext apiContext, HttpRequestMessage request,  out string priceList)
        {
            priceList = NULLPRICELISTCODE;
            if (apiContext.DataViewMode != DataViewModeType.Pending)
            {
                return false;
            }
            
            var val = request.GetQueryNameValuePairs().Where(x => string.Equals(x.Key, "mz_pricelist", StringComparison.OrdinalIgnoreCase)).Select(x => x.Value).FirstOrDefault();
            if (val != null)
            {
                priceList = val;
                return true;
            }
            return false;
        }
    }
}
