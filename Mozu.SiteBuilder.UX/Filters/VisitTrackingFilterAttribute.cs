using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.Visit;

namespace Mozu.SiteBuilder.UX.Filters
{
    public class VisitTrackingFilterAttribute : ActionFilterAttribute
    {
        private ILogger _logger;

        public override bool AllowMultiple { get { return false; } }

        public VisitTrackingFilterAttribute()
        {
            _logger = LoggingService.LoggerFor<VisitTrackingFilterAttribute>();
        }

        /// <summary>
        /// Before action: get or create a visit object.
        /// </summary>
        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            var pageContext = actionContext.Request.Resolve<PageContext>();
            
            // set PageContext.Visit by loading the cookie or creating one
            pageContext.Visit = LoadVisitFromCookie(actionContext.Request) ?? CreateVisit(actionContext.Request);
        }

        /// <summary>
        /// After action: manage cookies related to the visit.
        /// </summary>
        public override void OnActionExecuted(HttpActionExecutedContext actionExecutedContext)
        {
            // on exceptions, Response is null, and this filter has no business to conduct.
            if (actionExecutedContext.Response == null)
                return;

            var requestHeaders = actionExecutedContext.Request.Headers;
            var responseHeaders = actionExecutedContext.Response.Headers;
            var pageContext = actionExecutedContext.Request.Resolve<PageContext>();

            if (!requestHeaders.VisitorCookieExists())
            {
                responseHeaders.SetVisitorCookie(pageContext.Visit.VisitorId);
            }
            var sessionCookie = requestHeaders.GetSessionCookie();
            string sessionCookieExpectedValue = (pageContext.Visit.IsTracked ? "y" : "n") + (pageContext.Visit.IsUserTracked ? "y" : "n");
            if (sessionCookie == null || (pageContext.Visit.IsTracked && sessionCookie.Value != sessionCookieExpectedValue))
            {
                responseHeaders.SetSessionCookie(sessionCookieExpectedValue);
            }

            // always send visit cookie, setting expiration to 30 minutes from now.
            responseHeaders.SetVisitCookie(pageContext.Visit.VisitId);
        }


        private Visit LoadVisitFromCookie(HttpRequestMessage request)
        {
            // check for both an existing visit cookie and a session cookie.
            var visitCookie = request.Headers.GetVisitCookie();
            var visitorCookie = request.Headers.GetVisitorCookie();
            var sessionCookie = request.Headers.GetSessionCookie();
            var apiContext = request.Resolve<ISiteBuilderApiContext>();

            if (visitCookie != null && visitorCookie != null && sessionCookie != null)
            {
                // visit cookie is fresh.
                return new Visit {
                    VisitId = visitCookie.Value,
                    VisitorId = visitorCookie.Value,
                    UserId = apiContext.UserClaims != null && !apiContext.UserClaims.IsAnonymous ? apiContext.UserClaims.UserId : null,
                    IsTracked = sessionCookie.Value == "yy" || sessionCookie.Value == "yn" ? true : false,
                    IsUserTracked = sessionCookie.Value == "yy" || sessionCookie.Value == "ny" ? true : false,
                    IsLanding = false
                };
            }

            return null;
        }

        private static Visit CreateVisit(HttpRequestMessage request)
        {
            // try to parse the visitor id from the cookie.
            var visitorCookie = request.Headers.GetVisitorCookie();
            Guid visitorIdFromCookie = Guid.Empty;
            if (visitorCookie != null)
            {
                Guid.TryParse(visitorCookie.Value, out visitorIdFromCookie);
            }
            if (visitorIdFromCookie == Guid.Empty)
            {
                visitorIdFromCookie = Guid.NewGuid();
            }

            string visitorId = visitorIdFromCookie.ToUrlSafeString();

            var apiContext = request.Resolve<ISiteBuilderApiContext>();

            return new Visit
            {
                VisitId = Guid.NewGuid().ToUrlSafeString(),
                VisitorId = visitorId,
                UserId = apiContext.UserClaims != null && !apiContext.UserClaims.IsAnonymous ? apiContext.UserClaims.UserId : null,
                IsLanding = true
            };
        }
    }

    internal static class VisitHeadersExtensions
    {
        /// <summary>
        /// The visit cookie contains a serialized Visit object about the current visit, and has a 30 minute expiration.
        /// </summary>
        internal const string VISIT_COOKIE_NAME = "_mzvt";

        /// <summary>
        /// The visitor cookie is a lifetime cookie that remembers this visitor's id.
        /// </summary>
        internal const string VISITOR_COOKIE_NAME = "_mzvr";

        /// <summary>
        /// The session cookie is an HTTP session cookie which expires when the user closes their browser. The presense or lack of it indicates whether the visit cookie is still valid.
        /// </summary>
        internal const string SESSION_COOKIE_NAME = "_mzvs";

        public static CookieState GetVisitCookie(this HttpRequestHeaders requestHeaders)
        {
            return requestHeaders.GetCookies(VISIT_COOKIE_NAME).Select(cookies => cookies[VISIT_COOKIE_NAME]).FirstOrDefault();
        }

        public static CookieState GetVisitorCookie(this HttpRequestHeaders requestHeaders)
        {
            return requestHeaders.GetCookies(VISITOR_COOKIE_NAME).Select(cookies => cookies[VISITOR_COOKIE_NAME]).FirstOrDefault();
        }

        public static CookieState GetSessionCookie(this HttpRequestHeaders requestHeaders)
        {
            return requestHeaders.GetCookies(SESSION_COOKIE_NAME).Select(cookies => cookies[SESSION_COOKIE_NAME]).FirstOrDefault();
        }

        public static void SetVisitCookie(this HttpResponseHeaders responseHeaders, string content)
        {
            responseHeaders.AddCookies(new[] {
                new CookieHeaderValue(VISIT_COOKIE_NAME, content) {
                    HttpOnly = true,
                    Expires = DateTimeOffset.UtcNow.AddMinutes(30),
                    Path = "/"
                }
            });
        }

        public static void SetVisitorCookie(this HttpResponseHeaders responseHeaders, string content)
        {
            responseHeaders.AddCookies(new[] {
                new CookieHeaderValue(VISITOR_COOKIE_NAME, content)
                {
                    HttpOnly = true,
                    Expires = DateTimeOffset.UtcNow.AddYears(1),
                    Path = "/"
                }
            });
        }

        public static void SetSessionCookie(this HttpResponseHeaders responseHeaders, string content)
        {
            responseHeaders.AddCookies(new[] {
                new CookieHeaderValue(SESSION_COOKIE_NAME, content) {
                    HttpOnly = true,
                    Path = "/"
                }
            });
        }

        public static bool VisitCookieExists(this HttpRequestHeaders requestHeaders)
        {
            return requestHeaders.GetCookies(VISIT_COOKIE_NAME).Count > 0;
        }

        public static bool VisitorCookieExists(this HttpRequestHeaders requestHeaders)
        {
            return requestHeaders.GetCookies(VISITOR_COOKIE_NAME).Count > 0;
        }

        public static bool SessionCookieExists(this HttpRequestHeaders requestHeaders)
        {
            return requestHeaders.GetCookies(SESSION_COOKIE_NAME).Count > 0;
        }
    }
}
