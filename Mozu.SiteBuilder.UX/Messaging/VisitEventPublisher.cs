using System;
using System.Diagnostics;
using MassTransit;
using Microsoft.AspNetCore.Http;
using Mozu.Core.Messaging.Contracts.Visit.Commands;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.UX.Models.Visit;

namespace Mozu.SiteBuilder.UX.Messaging
{
    //public sealed class VisitEventPublisher
    //{
    //    private readonly ISiteBuilderApiContext _apiContext;
    //    private readonly IPublishEndpoint _publisher;
    //    private readonly IPageContext _pageContext;
    //    private readonly HttpContext _httpContext;

    //    public VisitEventPublisher(HttpContext httpContext, ISiteBuilderApiContext apiContext, IPageContext pageContext, IPublishEndpoint publisher)
    //    {
    //        _httpContext = httpContext;
    //        _apiContext = apiContext;
    //        _publisher = publisher;
    //        _pageContext = pageContext;
    //    }

    //    public void PublishVisit(Visit visit)
    //    {
    //        var visitTrackingEvent = new CreateWebsiteVisit  {
    //            VisitId = _pageContext.Visit.VisitId,
    //            VisitType = "Website",
    //            WebSiteId = _apiContext.SiteId,
    //            TenantId = _apiContext.TenantId,
    //            UserId = _apiContext.UserClaims.UserId,
    //            CustomerId = _pageContext.User.AccountId,
    //            Date = DateTime.Now,
    //            WebUserAgent = _httpContext.Request.Headers["User-Agent"],
    //            BrowserLocationCode = null, // location on mobile devices.
    //            BrowserPlatform = null,
    //            WebReferrer = null, // currently have no way to track this
    //            MessagePublishingContext = new Mozu.Core.Messaging.Contracts.MessagePublishingContext(
    //                _apiContext.TenantId,
    //                _apiContext.SiteId,
    //                _apiContext.MasterCatalogId,
    //                _apiContext.CatalogId,
    //                _apiContext.UserClaims.UserId,
    //                correlationId:    Trace.CorrelationManager.ActivityId.ToString("N")
    //            ) { CustomerId = _pageContext.User?.AccountId != null ? _pageContext.User.AccountId.ToString() : null }
    //            // TODO: would be nice to have a place to track landing page.
    //        };

    //        _publisher.Publish(visitTrackingEvent);
    //    }
    //}
}
