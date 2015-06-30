using System;
using System.Collections.Generic;
using System.Linq;
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

namespace Mozu.SiteBuilder.Mvc.SEO
{


    public class CustomRoute : HttpRoute
    {
        string Template { get; set; }
        FancyRoute InternalRoute { get; set; }
        bool IsCanonical { get; set; }
        IEnumerable<IRouteDataMapping> Mappings { get; set; }

        public CustomRoute(string template, FancyRoute internalRoute, bool isCanonical, IDictionary<string, object> defaults, IDictionary<string, ICustomRouteConstraint> constraints, IEnumerable<IRouteDataMapping> mappings) :
            base(template, defaults.ToRouteDictionary(), constraints.ToRouteDictionary())
        {
            Template = template;
            InternalRoute = internalRoute;
            IsCanonical = isCanonical;
            Mappings = mappings;
        }

        /// <summary>
        /// Applies any route mappings that are attached to this route to the provided set of route data
        /// </summary>
        /// <param name="values"></param>
        /// <returns></returns>
        public IDictionary<string, object> RewriteRouteData(IDictionary<string, object> values)
        {
            values = Mappings.Aggregate(values, (dict, m) => m.Map(dict));
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
        IDictionary<string, object> Map(IDictionary<string, object> values);
    }

    public interface ICustomRouteConstraint : ICanInit {
        bool Match(string parameterName, IDictionary<string, object> routeData);
    }
    #endregion

}
