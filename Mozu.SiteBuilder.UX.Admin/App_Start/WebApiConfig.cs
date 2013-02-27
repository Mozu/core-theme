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

                    
                    Mozu.Core.Api.HttpRouteCollectionExtensions.MapHttpRoute(config.Routes, t, routePrefix, false );
                });

            //diagnostics.BuildHtmlFile(confiHttpRouteCollectionExtensionsg);
        }
    }


}