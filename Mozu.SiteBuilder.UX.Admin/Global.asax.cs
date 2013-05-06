using System;
using System.Collections;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.ServiceModel.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Mvc;
using System.Web.Routing;
using AutoMapper;
using Autofac.Integration.Mvc;
using Autofac.Integration.WebApi;
using Mozu.Core.Api;
using Mozu.Core.Api.Descriptor;
using Mozu.Core.Api.ErrorHandler;
using Mozu.Core.Api.Filters.Exception;
using Mozu.Core.Api.Testing;
using Mozu.Core.Configuration;
using Mozu.Provisioning.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.OpeationHandlers;
using Mozu.SiteBuilder.UX.Admin.App_Start;
using Mozu.SiteBuilder.UX.Admin.Configuration;
using Mozu.Tenant.Contracts.Clients;


namespace Mozu.SiteBuilder.UX.Admin
{
    public class MvcApplication :  WebApiApplicationBase
    {
        private BootStrapperAdmin _bsa;


        protected void Application_Start()
        {
            if (_bsa != null)
            {
                return;
                
            }
            _bsa = new BootStrapperAdmin();
            _bsa.Bootstrap(GlobalConfiguration.Configuration);


            var resolver = new AutofacDependencyResolver(_bsa.Container );
            DependencyResolver.SetResolver(resolver);
            GlobalConfiguration.Configuration.DependencyResolver = new AutofacWebApiDependencyResolver(_bsa.Container);


            AreaRegistration.RegisterAllAreas();
            WebApiConfig.Register(GlobalConfiguration.Configuration);

            RegisterMvcRoutes(RouteTable.Routes);
        }

        private void RegisterMvcRoutes(RouteCollection routes)
        {


            RouteTable.Routes.MapRoute("img", "img/{collection}/{documentId}",
                   new { action = "Index", controller = "img" });
            RouteTable.Routes.MapRoute("download", "download/{collection}/{documentId}",
                     new { action = "Download", controller = "img" });

            RouteTable.Routes.IgnoreRoute("scripts/{*.pathInfo}");

            RouteTable.Routes.MapRoute("authticket", "auth/ticket",
                new { action = "LoginTicket", controller = "auth" });

            RouteTable.Routes.MapRoute("auth", "auth/{action}",
                new { action = "Index", controller = "auth" });

            RouteTable.Routes.MapRoute("login", "auth",
                new { action = "Index", controller = "auth" });

            RouteTable.Routes.MapRoute("RIA", "{*url}",
                new { action = "Index", controller = "home" });

            routes.IgnoreRoute("{file}.txt");
            routes.IgnoreRoute("{file}.htm");
            routes.IgnoreRoute("{file}.html");
            //routes.IgnoreRoute("{file}.js");
            routes.Ignore("favicon.ico ");
            // Ignore axd files such as assest, image, sitemap etc
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute("img3", "img/{collection}/{documentId}",
                    new { action = "Index", controller = "img" });

            //routes.Insert(0, new Route("apitest/index", new TestClientIndexRouteHandler()));
        }

    }
}