using System.Net.Http;
using System.Web.Http;
using System.Web.Routing;
using Mozu.SiteBuilder.Mvc.ActionResults;


namespace Mozu.SiteBuilder.UX.Admin.Configuration
{
    public class RouteConfig
    {
    


        public void Register(HttpRouteCollection routes)
        {
            routes.MapHttpRoute("img", "img/{collection}/{documentId}",
                                new { action = "Index", controller = "img" });

            routes.MapHttpRoute("adminTest", "test/{action}",
                                new { action = "Index", controller = "test" });

            routes.MapHttpRoute("download", "download/{collection}/{documentId}",
                                new { action = "Download", controller = "img" });


            routes.MapHttpRoute("authticket", "auth/ticket",
                                new { action = "LoginTicket", controller = "auth" });

            routes.MapHttpRoute("auth", "auth/{action}",
                                new { action = "Index", controller = "auth" });

            routes.MapHttpRoute("authpants", "auth/pants",
                                new { action = "Index", controller = "auth" });

            routes.MapHttpRoute("login", "auth",
                                new { action = "Index", controller = "auth" });


            routes.Add("scripts/{*.pathInfo}", new IgnoreRoute("scripts/{*.pathInfo}"));
            routes.Add("{file}.txt", new IgnoreRoute("{file}.txt"));
            routes.Add("{file}.htm", new IgnoreRoute("{file}.htm"));
            routes.Add("favicon.ico", new IgnoreRoute("favicon.ico"));
            routes.Add("{resource}.axd/{*pathInfo}", new IgnoreRoute("{resource}.axd/{*pathInfo}"));


            routes.MapHttpRoute("RIA", "{*url}",
                                new {action = "Index", controller = "home"},
                                new {url = @"^((?!api|\.).)*$", httpMethod = new HttpMethodConstraint(HttpMethod.Get.ToString())});


            
        }

     

    }
}