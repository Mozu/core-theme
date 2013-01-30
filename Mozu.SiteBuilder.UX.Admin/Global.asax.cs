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
using Volusion.SiteBuilder.UX.Models;

namespace Mozu.SiteBuilder.UX.Admin
{
    public class MvcApplication : WebApiApplicationBase
    {
        protected override void PreApplicationStart()
        {
            LogStartupMessage<MvcApplication>("Mozu.SiteBuilder.Admin");
        }

        protected override void InitializeLoggingServiceFactory()
        {
            // No additional hooks needed here, just use base implementation
            base.InitializeLoggingServiceFactory();
        }

        protected override void InitializeAutoMapperProfiles()
        {
            // No additional hooks needed here, just use base implementation
            base.InitializeAutoMapperProfiles();
        }

        protected override void InitializeContainerFactory(AutofacContainerFactory containerFactory)
        {
            containerFactory
                .UsingAssembly(Assembly.Load("Mozu.Core.Api"))
                .UsingAssembly(typeof(ISitesWebApiClient).Assembly)
                .UsingAssembly(typeof(IMerchantSignUpWebApiClient).Assembly)
                .UsingAssembly(typeof(IStartUpTask).Assembly)
                .UsingAssembly(typeof(IPermissionsRepository).Assembly)
                .UsingAssembly(Assembly.Load("Mozu.SiteBuilder.Mvc"))
                .UsingAssembly(Assembly.GetExecutingAssembly())
                ;

            containerFactory.ShowDebugOutput(true);
        }

        protected override void AddMessageHandlers()
        {
            base.AddMessageHandlers();

            GlobalFilters.Filters.Add(new HandleErrorAttribute());

            var configuration = GlobalConfiguration.Configuration;

            configuration.Filters.Add(new ApiExceptionFilter(new ExceptionResponseBuilderCollection { IncludeExceptionDetails = true }, new ApiExceptionFilterLogger { IsErrorLoggingEnabled = false }));

            configuration.BindParameter(typeof(FilterCollection), new FilterCollectionRequestHandler());
            configuration.BindParameter(typeof(PagingParamaters), new PagingParamatersRequestHandlers());
        }

        protected override void RegisterControllerRoutes()
        {
            GlobalConfiguration.Configuration.Services.Replace(typeof(IHttpActionSelector), new HackApiHttpActionSelector());

            var resolver = new AutofacDependencyResolver(Container);
            DependencyResolver.SetResolver(resolver);
            GlobalConfiguration.Configuration.DependencyResolver = new AutofacWebApiDependencyResolver(Container);
        }

        protected override void ApplicationStart()
        {
            var configuration = GlobalConfiguration.Configuration;

            WebApiConfig.Register(configuration);

            RegisterMvcRoutes(RouteTable.Routes);
        }

        private void RegisterMvcRoutes(RouteCollection routes)
        {
            // Ignore text, html, files.
            routes.IgnoreRoute("{file}.txt");
            routes.IgnoreRoute("{file}.htm");
            routes.IgnoreRoute("{file}.html");
            //routes.IgnoreRoute("{file}.js");
            routes.Ignore("favicon.ico ");
            // Ignore axd files such as assest, image, sitemap etc
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute("img3", "img/{collection}/{documentId}",
                    new { action = "Index", controller = "img" });

            routes.Insert(0, new Route("apitest/index", new TestClientIndexRouteHandler()));

            routes.MapRoute(
                "Default", // Route name
                "{controller}/{action}/{id}", // URL with parameters
                new { controller = "Home", action = "Index", id = UrlParameter.Optional } // Parameter defaults
            );

            routes.MapRoute(
                "Locale", // Route name
                "{controller}/{action}", // URL with parameters
                new { controller = "Home", action = "Locale" } // Parameter defaults
            );
        }

        class HackApiHttpActionSelector : ApiControllerActionSelector
        {
            private Hashtable _inits = new Hashtable();

            public override HttpActionDescriptor SelectAction(HttpControllerContext controllerContext)
            {
                if (!_inits.Contains(controllerContext.ControllerDescriptor))
                {
                    lock (_inits)
                    {
                        if (!_inits.Contains(controllerContext.ControllerDescriptor))
                        {
                            var all = this.GetActionMapping(controllerContext.ControllerDescriptor).SelectMany(x => x).ToList();


                            foreach (var item in all)
                            {
                                var wge = item.GetCustomAttributes<WebGetAttribute>().FirstOrDefault();
                                if (wge != null)
                                {
                                    if (!item.SupportedHttpMethods.Any(x => x.Method == "GET"))
                                    {
                                        item.SupportedHttpMethods.Add(HttpMethod.Get);
                                    }
                                }
                                var wie = item.GetCustomAttributes<WebInvokeAttribute>().FirstOrDefault();
                                if (wie != null)
                                {
                                    var meth = wie.Method;
                                    meth = string.IsNullOrEmpty(meth) ? "POST" : meth;
                                    if (!item.SupportedHttpMethods.Any(x => x.Method == meth))
                                    {
                                        item.SupportedHttpMethods.Add(new HttpMethod(meth));
                                    }
                                }
                            }
                            _inits.Add(controllerContext.ControllerDescriptor, true);
                        }
                    }
                }

                return base.SelectAction(controllerContext);
            }
        }
    }
}