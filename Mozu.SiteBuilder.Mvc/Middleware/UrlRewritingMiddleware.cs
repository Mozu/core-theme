using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.AspNetCore.Routing;
using Mozu.Core.Configuration;
using Mozu.Core.Extensions;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using IRedirectHandler = Mozu.SiteBuilder.Mvc.SEO.IRedirectHandler;
using RedirectHandler = Mozu.SiteBuilder.Mvc.SEO.RedirectHandler;
using Microsoft.Extensions.DependencyInjection;

namespace Mozu.SiteBuilder.Mvc.Middleware
{
    public static class UrlRewritingMiddleware
    {
        public const string IsSeoRewrite = "IsSeoRewrite";
        public const string OriginalUri = "OriginalUri";
        public const string MzPreCleanedUri = "MzPreCleanedUri";
        // look in the source code for HttpRoute.cs in asp.net for this.  it's internal there, so we can't just use it.
        internal const string MS_HTTP_RoutingContextKey = "MS_RoutingContext";

        public static IRedirectHandler Redirecter { get; set; } = RedirectHandler.Instance;

        public static void RewriteIncomingUrl(RewriteContext context)
        {
            var services = context.HttpContext.RequestServices;

            var apiContext = services.Resolve<ISiteBuilderApiContext>();
            if (!apiContext.SiteId.HasValue) return;

            var siteContext = services.Resolve<ISiteContext>();
            var pageContext = services.Resolve<PageContext>();
            var navContext = services.Resolve<NavigationContext>(); 
            Uri requestUri;

            if (context.HttpContext.Items.TryGetValue(OriginalUri, out var temp))
            {
                requestUri = (Uri) temp;
            }
            else
            {
                requestUri = context.HttpContext.GetRequestUri();
            }


            if (RewriteHomePage(requestUri, apiContext ,navContext, out string homepage))
            {
                RewriteCurrentRequest(context.HttpContext, homepage);
                return;
            }
            
            
            // try redirects
            var redirect = Redirecter.GetRedirectForRequestUri(services.Resolve<IRedirectRepository>(), requestUri);
            if (redirect == null) return;
            // we short-circuit the rewrite if this request has already been rewritten this go around.
            if (redirect.IsRewrite.GetValueOrDefault(false) && context.HttpContext.Items.ContainsKey(IsSeoRewrite))
            {
                return;
            }

            if (redirect.IsRewrite.GetValueOrDefault(false))
            {
                RewriteCurrentRequest(context.HttpContext, redirect.Destination);
                //services.Resolve<IRouteConfig>().RouteIncomingSystemRouteRequest(context.HttpContext);
                return;
            }

            if (!apiContext.IsEditMode)
            {
                RedirectTo(
                    redirect.Destination,
                    redirect.IsTemporary.GetValueOrDefault(false),
                    siteContext?.GeneralSettings?.EnforceSitewideSSL.GetValueOrDefault(false) == true,
                    pageContext.IsSecure,
                    pageContext.SecureHost,
                    context
                );
            }
        }


        static bool RewriteHomePage(Uri uri , ISiteBuilderApiContext apiContext , NavigationContext navContext  , out string rewrite)
        {
            rewrite = null;
            if (uri.GetComponents(UriComponents.Path, UriFormat.Unescaped) != "") return false;
            
            if (!apiContext.SiteId.HasValue) return false;
           
            var tree = navContext.Tree;
            if (tree == null) return false;
            var homeLink = tree.FirstOrDefault(x => x.IsHomePage);
            if (homeLink == null || homeLink.Url.Length <= 1) return false;
            rewrite =homeLink.Url;
            return true;

        }
        
        private static void RedirectTo(string location, bool isTemporary, bool enforceSsl, bool isSecureRequest, string secureHost, RewriteContext context)
        {
            var resp = context.HttpContext.Response;
            resp.StatusCode = isTemporary ? StatusCodes.Status302Found : StatusCodes.Status301MovedPermanently;

            var redirectUri = new Uri(location, UriKind.RelativeOrAbsolute);
            if (!redirectUri.IsAbsoluteUri)
            {
                if (!location.StartsWith("/"))
                {
                    location = "/" + location;
                    redirectUri = new Uri(location, UriKind.RelativeOrAbsolute);
                }

                if (enforceSsl && !isSecureRequest)
                {
                    redirectUri = new Uri(secureHost + location);
                }
            }

            resp.GetTypedHeaders().Location = redirectUri;
            context.Result = RuleResult.EndResponse;
        }

        /// <summary>
        /// rewriting the request just means hard-setting the URI to the new location, and then magically erasing some state that webapi stuffs into the request context for routing purposes.
        /// </summary>
        private static void RewriteCurrentRequest(HttpContext context, string destination)
        {
            context.Items[IsSeoRewrite] = true;
            var uri = new Uri("http://localhost/" + destination.TrimStart('/'));

            // set new uri and clear out the old request context, which was built off of that old uri
            context.Request.Path = uri.LocalPath;
            context.Request.QueryString = new QueryString(uri.Query);
            context.Items[MS_HTTP_RoutingContextKey] = null;
        }
    }
}
