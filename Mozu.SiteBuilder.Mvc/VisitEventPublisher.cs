using System;
using System.Collections;
using System.Collections.Specialized;
using System.Diagnostics;
using MassTransit;
using Microsoft.AspNetCore.Http;
using Microsoft.Net.Http.Headers;
using Mozu.Core.Messaging.Contracts.Visit.Commands;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.UX.Models.Visit;

namespace Mozu.SiteBuilder.UX.Messaging
{
    public interface IVisitEventPublisher
    {
        void PublishVisit(Visit visit);
    }
    public sealed class VisitEventPublisher: IVisitEventPublisher
    {
        private ISiteBuilderApiContext _apiContext;
        private IPublishEndpoint _publisher;
        private IPageContext _pageContext;
        private HttpContext _httpContext;

        public VisitEventPublisher(HttpContext httpContext, ISiteBuilderApiContext apiContext, IPageContext pageContext, IPublishEndpoint publisher)
        {
            _httpContext = httpContext;
            _apiContext = apiContext;
            _publisher = publisher;
            _pageContext = pageContext;
        }

        public void PublishVisit(Visit visit)
        {
            var visitTrackingEvent = new CreateWebsiteVisit  {
                VisitId = _pageContext.Visit.VisitId,
                VisitType = "Website",
                WebSiteId = _apiContext.SiteId,
                TenantId = _apiContext.TenantId,
                UserId = _apiContext.UserClaims.UserId,
                CustomerId = _pageContext.User.AccountId,
                Date = DateTime.Now,
                WebUserAgent = _httpContext.Request.Headers[HeaderNames.UserAgent],
                BrowserLocationCode = null, // location on mobile devices.
                // todo:cole look into what this is used for, and if so, how to get it
                //BrowserPlatform = _httpContext.Request.Browser != null ? _httpContext.Request.Browser.Platform : null,
                WebReferrer = null, // currently have no way to track this
                MessagePublishingContext = new Mozu.Core.Messaging.Contracts.MessagePublishingContext(
                    tenantId:         _apiContext.TenantId,
                    siteId:           _apiContext.SiteId,
                    masterCatalogId:  _apiContext.MasterCatalogId,
                    catalogId:        _apiContext.CatalogId,
                    userId:           _apiContext.UserClaims.UserId,
                    correlationId:    Trace.CorrelationManager.ActivityId.ToString("N")
                ) { CustomerId = _pageContext.User?.AccountId != null ? _pageContext.User.AccountId.ToString() : null }
                // TODO: would be nice to have a place to track landing page.
            };

            _publisher.Publish(visitTrackingEvent);
        }
    }
}
