using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Headers;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;
using Mozu.Core.Configuration;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.Visit;
using ActionFilterAttribute = Microsoft.AspNetCore.Mvc.Filters.ActionFilterAttribute;

namespace Mozu.SiteBuilder.UX.Filters
{
    public class VisitTrackingFilterAttribute : ActionFilterAttribute
    {
        private ILogger _logger;

        public VisitTrackingFilterAttribute(ILogger<VisitTrackingFilterAttribute> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Before action: get or create a visit object.
        /// </summary>
        public override void OnActionExecuting(ActionExecutingContext actionContext)
        {
            var httpContext = actionContext.HttpContext;
            var pageContext = httpContext.RequestServices.Resolve<PageContext>();
            
            // set PageContext.Visit by loading the cookie or creating one
            pageContext.Visit = LoadVisitFromCookie(actionContext.HttpContext) ?? CreateVisit(actionContext.HttpContext);
            httpContext.Response.OnStarting(() =>
            {
                if (!httpContext.VisitorCookieExists())
                {
                    httpContext.SetVisitorCookie(pageContext.Visit.VisitorId);
                }
                var sessionCookie = httpContext.GetSessionCookie();
                var sessionCookieExpectedValue = (pageContext.Visit.IsTracked ? "y" : "n") + (pageContext.Visit.IsUserTracked ? "y" : "n");
                if (sessionCookie == null || (pageContext.Visit.IsTracked && sessionCookie.Value != sessionCookieExpectedValue))
                {
                    httpContext.SetSessionCookie(sessionCookieExpectedValue);
                }

                // always send visit cookie, setting expiration to 30 minutes from now.
                httpContext.SetVisitCookie(pageContext.Visit.VisitId);

                return Task.CompletedTask;
            });
        }

      

        private Visit LoadVisitFromCookie(HttpContext context)
        {
            // check for both an existing visit cookie and a session cookie.
            var visitCookie = context.GetVisitCookie();
            var visitorCookie = context.GetVisitorCookie();
            var sessionCookie = context.GetSessionCookie();
            var apiContext = context.RequestServices.Resolve<ISiteBuilderApiContext>();

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

        private static Visit CreateVisit(HttpContext context)
        {
            // try to parse the visitor id from the cookie.
            var visitorCookie = context.GetVisitorCookie();
            var visitorIdFromCookie = Guid.Empty;
            if (visitorCookie != null)
            {
                Guid.TryParse(visitorCookie.Value, out visitorIdFromCookie);
            }
            if (visitorIdFromCookie == Guid.Empty)
            {
                visitorIdFromCookie = Guid.NewGuid();
            }

            var visitorId = visitorIdFromCookie.ToUrlSafeString();

            var apiContext = context.RequestServices.Resolve<ISiteBuilderApiContext>();

            return new Visit
            {
                VisitId = Guid.NewGuid().ToUrlSafeString(),
                VisitorId = visitorId,
                UserId = apiContext.UserClaims != null && !apiContext.UserClaims.IsAnonymous ? apiContext.UserClaims.UserId : null,
                IsLanding = true
            };
        }
    }

    internal static class VisitHeadersContextExtensions
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

        public static CookieState GetVisitCookie(this HttpContext context)
        {
            var cp = context.RequestServices.Resolve<ICookieProvider>();
            return cp.GetRequestCookie(VISIT_COOKIE_NAME);
        }

        public static CookieState GetVisitorCookie(this HttpContext context)
        {
            var cp = context.RequestServices.Resolve<ICookieProvider>();
            return cp.GetRequestCookie(VISITOR_COOKIE_NAME);
        }

        public static CookieState GetSessionCookie(this HttpContext context)
        {
            var cp = context.RequestServices.Resolve<ICookieProvider>();
            return cp.GetRequestCookie(SESSION_COOKIE_NAME);
        }

        public static void SetVisitCookie(this HttpContext context, string content)
        {
            var cp = context.RequestServices.Resolve<ICookieProvider>();
            cp.SaveResponseCookie(VISIT_COOKIE_NAME, content, new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTimeOffset.UtcNow.AddMinutes(30),
                Path = "/"
            });
        }

        public static void SetVisitorCookie(this HttpContext context, string content)
        {
            var cp = context.RequestServices.Resolve<ICookieProvider>();
            cp.SaveResponseCookie(VISITOR_COOKIE_NAME, content, new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTimeOffset.UtcNow.AddYears(1),
                Path = "/"
            });
        }

        public static void SetSessionCookie(this HttpContext context, string content)
        {
            var cp = context.RequestServices.Resolve<ICookieProvider>();
            cp.SaveResponseCookie(SESSION_COOKIE_NAME, content, new CookieOptions
            {
                HttpOnly = true,
                Path = "/"
            });
        }

        public static bool VisitCookieExists(this HttpContext context)
        {
            var cp = context.RequestServices.Resolve<ICookieProvider>();
            return cp.CookieExists(VISIT_COOKIE_NAME);
        }

        public static bool VisitorCookieExists(this HttpContext context)
        {
            var cp = context.RequestServices.Resolve<ICookieProvider>();
            return cp.CookieExists(VISITOR_COOKIE_NAME);
        }

        public static bool SessionCookieExists(this HttpContext context)
        {
            var cp = context.RequestServices.Resolve<ICookieProvider>();
            return cp.CookieExists(SESSION_COOKIE_NAME);
        }
    }
}
