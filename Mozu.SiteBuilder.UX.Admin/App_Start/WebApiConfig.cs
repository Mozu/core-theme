using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.ServiceModel.Web;
using System.Web.Http;
using System.Web.Http.Routing;
using System.Web.Routing;
using Mozu.Core.Api;
using Mozu.SiteBuilder.UX.Admin.Api;

namespace Mozu.SiteBuilder.UX.Admin.App_Start
{
    public static class WebApiConfig
    {
        // Added this to help out when debugging route issues.
        private static readonly Diagnostics diagnostics = new Diagnostics();

        public static void Register(HttpConfiguration config)
        {
            typeof(IApiController).Assembly.GetTypes().Where(t => typeof(IApiController).IsAssignableFrom(t) && !t.IsInterface).ToList()
                .ForEach(t =>
                {
                    var name = t.Name.ToLower();
                    var routePrefix = "app/" + name.Substring(0, name.LastIndexOf("controller", StringComparison.OrdinalIgnoreCase));
                    //wMozu.Core.Api.HttpRequestMessageExtensions.
                    Mozu.Core.Api2.HttpRouteCollectionExtensions.MapHttpRoute(config.Routes, t, routePrefix, false);
                    //throw new ApplicationException("fuck");
                   //  Mozu.Core.Api.HttpRouteCollectionExtensions.MapHttpRoute(config.Routes, t, routePrefix, false );
                });

            //diagnostics.BuildHtmlFile(confiHttpRouteCollectionExtensionsg);
        }
    }


}




namespace Mozu.Core.Api2
{
    public static class HttpRouteCollectionExtensions
    {
        public static void MapHttpRoute(this HttpRouteCollection routes, Type type, string prefix)
        {
            routes.MapHttpRoute(type, prefix, true);
        }

        public static void MapHttpRoute(this HttpRouteCollection routes, Type type, string prefix, bool registerMetaData)
        {
            if (!typeof(ApiController).IsAssignableFrom(type))
                throw new ArgumentException("type must be of ApiController");

            //register Controller for Descriptor Controller
            //if(registerMetaData)
            //    Descriptor.ApiMetaData.RegisterResource(prefix, type);

            var routeMembers = type.GetMethods().Where(m => m.IsPublic && !m.IsStatic);

            List<RouteBuilder> routeBuilders = new List<RouteBuilder>();

            var lastIndexOfCtrl = type.Name.LastIndexOf("Controller");

            if (lastIndexOfCtrl == -1 || lastIndexOfCtrl + "Controller".Length != type.Name.Length)
                throw new Exception(type.Name + " must end in the literal 'Controller'.");

            string controllerName = type.Name.Substring(0, lastIndexOfCtrl);

            foreach (MethodInfo method in routeMembers)
            {
                var mozuRouteAtt = method.GetCustomAttributes(false).OfType<Mozu.Core.Api.Routing.MozuRouteAttribute>().FirstOrDefault();

                var wia = method.GetCustomAttributes(false).OfType<WebInvokeAttribute>().FirstOrDefault();

                var wga = method.GetCustomAttributes(false).OfType<WebGetAttribute>().FirstOrDefault();

                //var contextLevelsScopedAttribute = method.GetCustomAttributes(false).OfType<ContextLevelsAttribute>().FirstOrDefault();

                if (wia != null || wga != null)
                {
                    routeBuilders.Add(new RouteBuilder(prefix, controllerName, method, mozuRouteAtt, wga, wia));
                }

                //if (contextLevelsScopedAttribute != null)
                //{
                //    //TODO: Determine how to create attribute and add it to method, plus get constructor or property injection to work
                //}
            }

            routeBuilders.Sort((a, b) => a.order.CompareTo(b.order));

            RouteBuilder.ReconcileCollisions(routeBuilders);

            routeBuilders.ForEach(r => r.MapHttpRoute(routes));
        }

        public static void MapHttpRoute<T>(this HttpRouteCollection routes, string prefix) where T : ApiController
        {
            MapHttpRoute(routes, typeof(T), prefix);
        }

        public static void MapHttpRoute<T>(this HttpRouteCollection routes, string prefix, bool registerMetaData)
            where T : ApiController
        {
            MapHttpRoute(routes, typeof(T), prefix, registerMetaData);
        }

        //TODO: we will next replace WebGetAttribute and WebInvokeAttribute with MozuRouteAttribute
        private class RouteBuilder
        {
            public RouteBuilder(string servicePrefix, string controllerName, MethodInfo method, Mozu.Core.Api.Routing.MozuRouteAttribute mozuAtt, WebGetAttribute getAtt, WebInvokeAttribute invokeAtt)
            {
                if (getAtt == null && invokeAtt == null) throw new ArgumentException("Get or Invoke attribute must be provided");
                if (getAtt != null && invokeAtt != null) throw new ArgumentException("Only Get OR Invok attribute may be provided. Not both.");
                if(string.IsNullOrWhiteSpace(servicePrefix)) throw new ArgumentException("ServicePrefix must not be null.");

                name = method.Name + "-" + controllerName;
                defaults = new { controller = controllerName, action = method.Name };                

                if (getAtt != null)
                {
                    CreateRouteTemplate(servicePrefix, getAtt.UriTemplate);
                    httpMethod = HttpMethod.Get;
                }
                else
                {
					CreateRouteTemplate(servicePrefix, invokeAtt.UriTemplate);
	                httpMethod = string.IsNullOrEmpty(invokeAtt.Method) ? HttpMethod.Post : new HttpMethod(invokeAtt.Method);
                }

                /* so putting anon type in routevaluedictionary for now because the eventual goal is to merge this httpMethod constraint with any other constraints provided...
                 * but there is currently no way to provide more because you can't put complex and especially anon types on an attribute.
                 */
				constraints = new HttpRouteValueDictionary(new { httpMethod = new System.Web.Http.Routing.HttpMethodConstraint(httpMethod) });

                order = 100;// mozuAtt != null && mozuAtt.HasOrder ? mozuAtt.Order : 100;
            }

            void CreateRouteTemplate(string servicePrefix, string uriTemplate)
            {
                routeTemplate = string.Join("/", servicePrefix, StripQs(uriTemplate));
            }

            public string name;
            public string routeTemplate;
            public object defaults;
			public readonly HttpRouteValueDictionary constraints;
            public readonly int order;
            private readonly HttpMethod httpMethod;

            public void MapHttpRoute(HttpRouteCollection routeCollection)
            {
                routeCollection.MapHttpRoute(name, routeTemplate, defaults, constraints);
            }

            //this isn't used yet...intented to allow ROUTE constraints to be merged
			HttpRouteValueDictionary MergeConstraints(object o, Dictionary<string, object> methodConstraints)
            {
				HttpRouteValueDictionary dict = o == null ? new HttpRouteValueDictionary() : new HttpRouteValueDictionary(o);

                foreach (var keyVal in methodConstraints)
                    dict[keyVal.Key] = keyVal.Value;

                return dict;
            }

            string StripQs(string s)
            {
                int qPos = s.IndexOf('?');
                if (qPos > -1)
                {
                    return s.Substring(0, qPos);
                }
                return s;
            }

            public static void ReconcileCollisions(List<RouteBuilder> routes)
            {
                //if any Routes collide (meaning the route template AND HTTP verb are identical), then remove the Action default
                //this will allow WebApi to select from ANY of the Actions that have the colliding routes using querystring params as a further guide (during Action resolution)
                List<int> matches = new List<int>();

                for (int i = 0; i < routes.Count; i++)
                {
                    if (matches.Contains(i))
                        continue;

                    var currMatches = OffsetsOfMatch(routes, i).ToList();

                    if (currMatches.Count > 0)
                    {
                        RemoveActionConstraint(routes[i]);
                        //could remove these as they are redundant...
                        currMatches.ForEach(c => RemoveActionConstraint(routes[c]));
                        matches.AddRange(currMatches);
                    }
                }
            }

            static IEnumerable<int> OffsetsOfMatch(List<RouteBuilder> routes, int location)
            {
                var route = routes[location];

                for (int i = location + 1; i < routes.Count; i++)
                {
                    var currRoute = routes[i];

                    if (currRoute.httpMethod.Equals(route.httpMethod) && currRoute.routeTemplate.Equals(route.routeTemplate))
                        yield return i;
                }
            }

            static void RemoveActionConstraint(RouteBuilder route)
            {
                RouteValueDictionary dict = route.defaults as RouteValueDictionary;

                if (dict == null)
                {
                    dict = new RouteValueDictionary(route.defaults);
                    route.defaults = dict;
                }                
                
                dict.Remove("action");
            }
        }
    }
}
