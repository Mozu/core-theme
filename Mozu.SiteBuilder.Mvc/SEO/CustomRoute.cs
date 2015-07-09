using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http.Routing;
using Autofac;
using Mozu.Core;
using Mozu.Core.Api.Client;
using System.Runtime.Caching;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.UX.Models.Navigation;
using System.Web.Http;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.Contexts;

namespace Mozu.SiteBuilder.Mvc.SEO
{


    public class CustomRoute : HttpRoute
    {
        
        string Template { get; set; }
        FancyRoute InternalRoute { get; set; }
        bool IsCanonical { get; set; }
        IDictionary<IRouteDataMapping, string[]> Mappings { get; set; }

        public CustomRoute(string template, FancyRoute internalRoute, bool isCanonical, IDictionary<string, object> defaults, IDictionary<ICustomRouteConstraint, string[]> constraints, IDictionary<IRouteDataMapping, string[]> mappings) :
            base(template, defaults.ToRouteDictionary())
        {
          
            Template = template;
            InternalRoute = internalRoute;
            IsCanonical = isCanonical;

            Mappings = mappings;


            object temp;
            if (constraints == null)
            {
                return;
            }
            foreach ( var kvp in constraints)
            {
                var paramNames = kvp.Value == null || kvp.Value.Length ==0 ? new string[]{"*"}: kvp.Value;
                foreach( var paramName in paramNames)
                {
                    if ( !this.Constraints.TryGetValue( paramName, out temp))
                    {
                        temp = new CustomRouteConstraintGroup();
                        this.Constraints[paramName] = temp;
                    }
                   ((CustomRouteConstraintGroup)temp).Constrains.Add(kvp.Key);
                }
                
            }
        
        }


        /// <summary>
        /// Applies any route mappings that are attached to this route to the provided set of route data
        /// </summary>
        /// <param name="values"></param>
        /// <returns></returns>
        public IDictionary<string, object> RewriteRouteData(HttpRequestMessage requestMessage, IDictionary<string, object> values)
        {
            values = Mappings.Aggregate(values, (dict, mapEntry) => {
               var paramNames = mapEntry.Value == null || mapEntry.Value.Length ==0 ? new string[]{"*"}: mapEntry.Value;
               foreach (var parameterName in paramNames)
                {
                    mapEntry.Key.Map(requestMessage, dict, parameterName);
                }
                return values;
            });
            //todo removeHack.
           
            return values;
        }

        public bool IsCanonicalFor(FancyRoute route)
        {
            return IsCanonical && InternalRoute == route;
        }

       
    }

    #region Interfaces
    public interface INotCrappyHttpRouteData : IHttpRouteData
    {
        new IDictionary<string, object> Values { get; set; }
    }

    public interface ICustomRouteConstraintFactory
    {
        ICustomRouteConstraint BuildConstraint(Validator validator);
    }

    public interface IRouteDataMappingFactory
    {
        IRouteDataMapping BuildMapping(Mapping mapping);
    }

    public interface ICanInit
    {
        Task<bool> Initialize();
    }

    /// <summary>
    /// think of these as a func (dict => dict) where we add mapped keys with the same values if present
    /// </summary>
    public interface IRouteDataMapping : ICanInit
    {
        IDictionary<string, object> Map(HttpRequestMessage requestMessage, IDictionary<string, object> values, string parameterName);
    }

    public interface ICustomRouteConstraint : ICanInit, IHttpRouteConstraint
    {
        bool DoMatch(HttpRequestMessage request, IHttpRoute route, string parameterName, IDictionary<string, object> values, HttpRouteDirection routeDirection);
    }

    public class CustomRouteConstraintGroup : ICustomRouteConstraint
    {
        public List<ICustomRouteConstraint> Constrains = new List<ICustomRouteConstraint>();
        public bool DoMatch(HttpRequestMessage request, IHttpRoute route, string parameterName, IDictionary<string, object> values, HttpRouteDirection routeDirection)
        {
            if ( Constrains.Count ==0)
            {
                return Constrains[0].DoMatch(request, route,parameterName,values,routeDirection );
            }
            foreach( var constraint in Constrains)
            {
                if ( !constraint.DoMatch(request, route, parameterName, values, routeDirection))
                {
                    return false;
                }
            }
            return true;
        }

        Task<bool> ICanInit.Initialize()
        {
            if ( Constrains.Count ==0)
            {
                return Constrains[0].Initialize();
            }
            var tasks = Constrains.Select(x => x.Initialize());
            return Task.WhenAll(tasks).ContinueWith( x=>  true);
            
        }

        bool IHttpRouteConstraint.Match(HttpRequestMessage request, IHttpRoute route, string parameterName, IDictionary<string, object> values, HttpRouteDirection routeDirection)
        {
            return DoMatch(request, route, parameterName, values, routeDirection);
        }
    }
    #endregion

}
