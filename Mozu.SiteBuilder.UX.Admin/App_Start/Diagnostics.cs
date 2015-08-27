using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Routing;
using HttpMethodConstraint = System.Web.Routing.HttpMethodConstraint;

namespace Mozu.SiteBuilder.UX.Admin.App_Start
{
    internal class Diagnostics
    {
         // Build a table of routes and their constraints
        internal void BuildHtmlFile(HttpConfiguration configuration, string fileName = @"C:\routes.html")
        {
            File.WriteAllLines(fileName, BuildFile(configuration.Routes));
        }

        private static IEnumerable<string> BuildFile(IEnumerable<IHttpRoute> routes)
        {
            yield return "<html><code><table>";
            yield return "<thead><th colspan='2'>" + DateTime.Now + "</th></thead>";
            foreach (var route in routes)
            {
                yield return BuildRoute(route);
            }
            yield return "</table></code></html>";
        }

        private static string BuildRoute(IHttpRoute route)
        {
            var constraints = route.Constraints.Select(BuildConstraint);

            return "<tr><td>" + route.RouteTemplate + "</td><td>" + string.Join(", ", constraints) + "</td></tr>";
        }

        private static string BuildConstraint(KeyValuePair<string, object> entry)
        {
            var value = entry.Value as HttpMethodConstraint;
            return string.Format("{0}={1}", entry.Key, string.Join("&", value.AllowedMethods));
        }
    }
}