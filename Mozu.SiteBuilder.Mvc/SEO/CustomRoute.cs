using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http.Routing;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using Mozu.Core.Extensions;

namespace Mozu.SiteBuilder.Mvc.SEO
{
    public class CustomRoute : HttpRoute
    {
        string Template { get; set; }
        public FancyRoute InternalRoute { get; set; }
        bool IsCanonical { get; set; }

        //todo possible support for qstring in url gen.
        NameValueCollection QueryString { get; set; }
        IDictionary<IRouteDataMapping, string[]> PreMappings { get; set; }
        IDictionary<IRouteDataMapping, string[]> PostMappings { get; set; }

        public CustomRoute(string template, string queryString,  FancyRoute internalRoute, bool isCanonical, IDictionary<string, object> defaults, IDictionary<ICustomRouteConstraint, string[]> constraints, IDictionary<IRouteDataMapping, string[]> mappings) :
            base(template, defaults.ToRouteDictionary())
        {
          
            Template = template;
            InternalRoute = internalRoute;
            IsCanonical = isCanonical;
            if ( !string.IsNullOrWhiteSpace(queryString))
            {
                QueryString = System.Web.HttpUtility.ParseQueryString(queryString);
            }
            

            PreMappings = mappings.Where(x => x.Key.Settings.beforeRouting.GetValueOrDefault(false)).ToDictionary(x=>x.Key, y=> y.Value );
            PostMappings = mappings.Where(x => !x.Key.Settings.beforeRouting.GetValueOrDefault(false)).ToDictionary(x => x.Key, y => y.Value);


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
        public IDictionary<string, object> RewriteRouteData(HttpRequestMessage requestMessage, IDictionary<string, object> values )
        {
            return DoRewriteRouteData(requestMessage, values, PostMappings);
           
        }


        static IDictionary<string, object> DoRewriteRouteData(HttpRequestMessage requestMessage, IDictionary<string, object> values, IDictionary<IRouteDataMapping, string[]> mappings)
        {
            values = mappings.Aggregate(values, (dict, mapEntry) =>
            {
                var paramNames = mapEntry.Value == null || mapEntry.Value.Length == 0 ? new string[] { "*" } : mapEntry.Value;
                foreach (var parameterName in paramNames)
                {
                    mapEntry.Key.Map(requestMessage, dict, parameterName);
                    if ( mapEntry.Key.Settings != null && mapEntry.Key.Settings.mapTo != null)
                    {
                        object newVal;
                        if ( values.TryGetValue( parameterName, out newVal))
                        {
                            values[mapEntry.Key.Settings.mapTo] = newVal;
                        }
                        
                    }
                }
                return values;
            });


            return values;
        }

        protected override bool ProcessConstraint(HttpRequestMessage request, object constraint, string parameterName, HttpRouteValueDictionary values, HttpRouteDirection routeDirection)
        {
            var origional = values;
            if( this.PreMappings.Count > 0 )
            {
                values= new HttpRouteValueDictionary( values);
                DoRewriteRouteData(request, values, PreMappings);
            }
            var ret=  base.ProcessConstraint(request, constraint, parameterName, values, routeDirection);
            if (ret && !object.Equals( origional,values ))
            {
                origional.Clear();
                origional.AddRange(values);
            }
            
            //todo: should pre mappings persist?
            return ret;
            
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
        Mapping Settings { get; set; }
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
