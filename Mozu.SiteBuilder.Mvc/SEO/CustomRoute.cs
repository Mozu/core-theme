using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http.Routing;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Mozu.Core.Configuration;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using Mozu.Core.Extensions;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.OAF;
using IInlineConstraintResolver = Microsoft.AspNetCore.Routing.IInlineConstraintResolver;
using Route = Microsoft.AspNetCore.Routing.Route;

namespace Mozu.SiteBuilder.Mvc.SEO
{
    public sealed class CustomRoute : Route
    {
        public enum Scheme
        {
            Http,
            Https
        }

        string Template { get; set; }
        public FancyRoute InternalRoute { get; set; }
        bool IsCanonical { get; set; }

        //todo possible support for qstring in url gen.
        NameValueCollection QueryString { get; set; }
        public IDictionary<IRouteDataMapping, string[]> PreMappings { get; set; }
        IDictionary<IRouteDataMapping, string[]> PostMappings { get; set; }
        public Scheme? UrlScheme { get; set; }

        public CustomRoute(IRouter defaultHandler,
            string name,
            string template,
            string queryString,
            FancyRoute internalRoute,
            bool isCanonical,
            RouteValueDictionary defaults,
            IDictionary<ICustomRouteConstraint, string[]> constraints,
            IDictionary<IRouteDataMapping, string[]> mappings,
            //string functionId,
            Scheme? scheme,
            IInlineConstraintResolver constraintResolver) :
            base(defaultHandler,
                name,
                template,
                defaults,
                null,
                null,
                constraintResolver)
        {
            Template = template;
            InternalRoute = internalRoute;
            IsCanonical = isCanonical;
            UrlScheme = scheme;

            if (!string.IsNullOrWhiteSpace(queryString))
            {
                QueryString = System.Web.HttpUtility.ParseQueryString(queryString);
            }

            PreMappings = mappings.Where(x => x.Key.Settings.beforeRouting.GetValueOrDefault(false)).ToDictionary(x => x.Key, y => y.Value);
            PostMappings = mappings.Where(x => !x.Key.Settings.beforeRouting.GetValueOrDefault(false)).ToDictionary(x => x.Key, y => y.Value);

            if (constraints == null)
            {
                return;
            }
            foreach (var (key, value) in constraints)
            {
                var paramNames = value == null || value.Length == 0 ? new[] { "*" } : value;
                foreach (var paramName in paramNames)
                {
                    if (!Constraints.TryGetValue(paramName, out var temp))
                    {
                        temp = new CustomRouteConstraintGroup();
                        Constraints[paramName] = temp;
                    }
                    ((CustomRouteConstraintGroup)temp).Constrains.Add(key);
                }
            }
        }

        public override Task RouteAsync(RouteContext context)
        {
            RewriteRouteData(context.HttpContext, context.RouteData.Values);

            return base.RouteAsync(context);
        }

        /// <summary>
        /// Applies any route mappings that are attached to this route to the provided set of route data
        /// </summary>
        /// <param name="values"></param>
        /// <returns></returns>
        public IDictionary<string, object> RewriteRouteData(HttpContext context, IDictionary<string, object> values)
        {
            return DoRewriteRouteData(context, values, PostMappings);
        }

        public IDictionary<string, object> RewritePreMappingRouteData(HttpContext context, IDictionary<string, object> values)
        {
            return DoRewriteRouteData(context, values, PreMappings);
        }

        public static IDictionary<string, object> DoRewriteRouteData(HttpContext context, IDictionary<string, object> values, IDictionary<IRouteDataMapping, string[]> mappings)
        {
            values = mappings.Aggregate(values, (dict, mapEntry) =>
            {
                var paramNames = mapEntry.Value == null || mapEntry.Value.Length == 0 ? new [] { "*" } : mapEntry.Value;
                foreach (var parameterName in paramNames)
                {
                    mapEntry.Key.Map(context, dict, parameterName);
                    if (mapEntry.Key.Settings?.mapTo == null) continue;

                    if (values.TryGetValue(parameterName, out var newVal))
                    {
                        values[mapEntry.Key.Settings.mapTo] = newVal;
                    }
                }
                return values;
            });

            return values;
        }

        //protected override bool ProcessConstraint(HttpRequestMessage request, object constraint, string parameterName, HttpRouteValueDictionary values, HttpRouteDirection routeDirection)
        //{
        //    var origional = values;
        //    if (PreMappings.Count > 0)
        //    {
        //        values = new HttpRouteValueDictionary(values);
        //        DoRewriteRouteData(request, values, PreMappings);
        //    }
        //    var ret = base.ProcessConstraint(request, constraint, parameterName, values, routeDirection);
        //    if (ret && !Equals(origional, values))
        //    {
        //        origional.Clear();
        //        origional.AddRange(values);
        //    }
        //    //todo: should pre mappings persist?
        //    return ret;
        //}

        public bool IsCanonicalFor(FancyRoute route)
        {
            return IsCanonical && InternalRoute == route;
        }
    }

    public class NonSystemRoute : Route
    {
        private readonly IInlineConstraintResolver _inlineConstraintResolver;
        private readonly IRouter _target;

        private const string ROUTE_TEMPLATE = "{*url}";

        public HttpMessageHandler Handler => null;

        public new string RouteTemplate => ROUTE_TEMPLATE;

        public NonSystemRoute(IRouter target, IInlineConstraintResolver inlineConstraintResolver) : base(target, ROUTE_TEMPLATE, inlineConstraintResolver)
        {
            _target = target;
            _inlineConstraintResolver = inlineConstraintResolver;
        }

        public override async Task RouteAsync(RouteContext context)
        {
            var services = context.HttpContext.RequestServices;
            var routeHandler = services.Resolve<ICustomRouteHandler>();
            if (routeHandler == null) return;

            context.HttpContext.Items["DefaultRouter"] = _target;
            context.HttpContext.Items["ConstraintResolver"] = _inlineConstraintResolver;

            var found = routeHandler.RouteIncomingRequest(context);

            if (!found)
            {
                services.Resolve<IRouteConfig>().RouteIncomingDefaultRouteRequest(context);
            }

            if (!HandleReroutedRequest(context, services)) await base.RouteAsync(context);
        }

        private static bool HandleReroutedRequest(RouteContext context, IServiceProvider services)
        {
            var pageContext = services.Resolve<IPageContext>();
            var siteContext = services.Resolve<ISiteContext>();
            var sslValidationEnabled = services.Resolve<ISettings>().CoreSettings.IsSSLValidationEnabled;

            if (context.HttpContext.Request.Method != HttpMethod.Get.Method ||
                pageContext.IsEditMode ||
                !pageContext.HandledByProxy ||
                !sslValidationEnabled)
            {
                return false;
            }

            var customRoute = context.HttpContext.GetRouteData().Routers.Last() as CustomRoute;
            var currentUrl = new Uri(pageContext.Url);


            if (customRoute?.UrlScheme.HasValue == true)
            {
                if (customRoute.UrlScheme.Value.ToStringQuickly().EqualsIgnoreCase(currentUrl.Scheme))
                {
                    return false;
                }
            }
            else if (!siteContext.GeneralSettings.EnforceSitewideSSL.GetValueOrDefault(false))
            {
                return false;
            }
            else if (currentUrl.Scheme.EqualsIgnoreCase("https"))
            {
                return false;
            }

            var scheme = customRoute?.UrlScheme.HasValue == true ? customRoute.UrlScheme.Value.ToStringQuickly() : "https";

            var builder = new UriBuilder(scheme, currentUrl.Host)
            {
                Path = currentUrl.AbsolutePath,
                Query = currentUrl.Query?.TrimStart(new[] { '?' })
            };

            RedirectTo(builder.Uri.ToString(),
                false,
                false,
                pageContext.IsSecure,
                pageContext.SecureHost,
                context);

            return true;
        }

        private static void RedirectTo(string location, bool isTemporary, bool enforceSsl, bool isSecureRequest, string secureHost, RouteContext context)
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
        }
    }

    #region Interfaces
    public interface INotCrappyHttpRouteData : IHttpRouteData
    {
        new IDictionary<string, object> Values { get; set; }
    }

    public interface ICustomRouteConstraintFactory
    {
        ICustomRouteConstraint BuildConstraint(string key, Validator validator);
    }

    public interface IRouteDataMappingFactory
    {
        IRouteDataMapping BuildMapping(string key, Mapping mapping);
    }

    public interface ICanInit
    {
        bool Initialize();
    }

    /// <summary>
    /// think of these as a func (dict => dict) where we add mapped keys with the same values if present
    /// </summary>
    public interface IRouteDataMapping : ICanInit
    {
        Mapping Settings { get; set; }
        IDictionary<string, object> Map(HttpContext context, IDictionary<string, object> values, string parameterName);
    }

    public interface ICustomRouteConstraint : ICanInit, IRouteConstraint
    {
        bool DoMatch(HttpContext httpContext, IRouter route, string routeKey, RouteValueDictionary values, RouteDirection routeDirection);
    }

    public class CustomRouteConstraintGroup : ICustomRouteConstraint
    {
        public List<ICustomRouteConstraint> Constrains = new List<ICustomRouteConstraint>();
        public bool DoMatch(HttpContext httpContext, IRouter route, string routeKey, RouteValueDictionary values, RouteDirection routeDirection)
        {
            if (Constrains.Count == 0)
            {
                // why try to execute the 0th index when our count is zero?
                // return Constrains[0].DoMatch(request, route, parameterName, values, routeDirection);
                return true;
            }

            return Constrains.All(constraint =>
            {
                var original = values;
                if (route is CustomRoute cr && cr.PreMappings.Count > 0)
                {
                    values = new RouteValueDictionary(values);
                    cr.RewritePreMappingRouteData(httpContext, values);
                }
                var ret = constraint.DoMatch(httpContext, route, routeKey, values, routeDirection);

                if (!ret || Equals(original, values)) return ret;

                original.Clear();
                original.AddRange(values);
                //todo: should pre mappings persist?
                return true;
            });
        }

        bool ICanInit.Initialize()
        {
            if (Constrains.Count == 0)
            {
                return true;
            }
            Constrains.Each(x => x.Initialize());

            return true;
            //return Task.WhenAll(tasks).ContinueWith( x=>  true);

        }

        public bool Match(HttpContext httpContext, IRouter route, string routeKey, RouteValueDictionary values,
            RouteDirection routeDirection)
        {
            return DoMatch(httpContext, route, routeKey, values, routeDirection);
        }
    }
    #endregion

}