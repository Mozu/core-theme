using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.ServiceModel.Web;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Dependencies;
using System.Web.Http.Dispatcher;
using System.Web.Mvc;
using System.Web.Routing;
using AutoMapper;
using Autofac;
using Autofac.Core;
using Autofac.Integration.Mvc;
using Autofac.Integration.WebApi;
using Mozu.Core.Api.Configuration;
using Mozu.Core.Api.Descriptor;
using Mozu.Core.Api.ErrorHandler;
using Mozu.Core.Api.Filters.Exception;
using Mozu.Core.Api.Testing;
using Mozu.Core.Configuration;
using Mozu.Core.Logging;
using Mozu.PaymentService.Contracts.Clients.Public;
using Mozu.Provisioning.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.OpeationHandlers;
using Mozu.SiteBuilder.UX.Models;
using Mozu.Tenant.Contracts.Clients;
using Volusion.SiteBuilder.UX.Models;
using Mozu.Core.Api;

namespace Mozu.SiteBuilder.UX.Admin.Configuration
{
    public class ApplicationBootstrapper
    {
        private static bool _hasStarted;
        private static IContainer _container;

        public static void Bootstrap()
        {
            if (_hasStarted) return;
            RouteTable.Routes.IgnoreRoute("favicon.ico");
            InitDI();
            InitLogging();
            InitMapping();
            InitAPI();
            InitMVCStuff();
            RegisterRoutes();
            InitRiaRoutes();
            _hasStarted = true;
        }

        public static void InitRiaRoutes()
        {
            RouteTable.Routes.MapRoute("img", "img/{collection}/{documentId}",
                    new { action = "Index", controller = "img" });
            RouteTable.Routes.MapRoute("download", "download/{collection}/{documentId}",
                     new { action = "Download", controller = "img" });

            RouteTable.Routes.IgnoreRoute("scripts/{*.pathInfo}");

            RouteTable.Routes.MapRoute("auth", "auth/{action}",
                new { action = "Index", controller = "auth" });

            RouteTable.Routes.MapRoute("login", "auth",
                new { action = "Index", controller = "auth" });

            RouteTable.Routes.MapRoute("RIA", "{*url}",
                new { action = "Index", controller = "home" });           

            
        }

        public static void InitMVCStuff()
        {
            AreaRegistration.RegisterAllAreas();
           // GlobalFilters.Filters.Add ( )
            GlobalFilters.Filters.Add(new HandleErrorAttribute());
        }

        public static void InitDI()
        {
            try
            {
                var contFact = new AutofacContainerFactory()
                           .UsingAssembly(Assembly.Load("Mozu.Core.Api"))
                           .UsingAssembly(typeof(ISitesWebApiClient).Assembly)
                           .UsingAssembly(typeof(IMerchantSignUpWebApiClient).Assembly)
                           .UsingAssembly(typeof(IStartUpTask).Assembly)
                           .UsingAssembly(typeof(IPermissionsRepository).Assembly)
                           .UsingAssembly(Assembly.Load("Mozu.SiteBuilder.Mvc"))
                           .UsingAssembly(Assembly.GetExecutingAssembly())
                           ;
                _container = contFact.Build();
            }
            catch (ReflectionTypeLoadException ex)
            {
                throw ex.LoaderExceptions.First();
            }
            catch
            {
                throw;
            }
        }

        public static void InitMapping()
        {
            var resolver = new AutofacDependencyResolver(_container);

            DependencyResolver.SetResolver(resolver);

            GlobalConfiguration.Configuration.DependencyResolver = new AutofacWebApiDependencyResolver(_container);

            Mapper.Initialize(mapper =>
            {
                mapper.ConstructServicesUsing(resolver.GetService);
                typeof(ApplicationBootstrapper).Assembly.GetTypes().Concat(typeof(Mozu.SiteBuilder.Mvc.ISiteBuilderContext).Assembly.GetTypes())
                    .Where(x => x.IsSubclassOf(typeof(Profile)))
                    .Select(y => (Profile)System.Activator.CreateInstance(y)).ToList()
                    .ForEach(mapper.AddProfile);
            });
        }

        public static void InitLogging()
        {
            LoggingService.InitializeLoggingServiceFactory(new MozuLoggingServiceFactory());
            LoggingService.LoggingServiceFactory.CreateLoggingService = () => _container.Resolve<ILoggingService>();
            LoggingService.LoggerFor<ApplicationBootstrapper>().Debug("Starting up the Taco!");
        }

        private static string LocalPathFromRelativeUri(string pathAndQuery)
        {
            var qsPosition = pathAndQuery.IndexOf('?');
            string relativeUri = qsPosition > -1 ? pathAndQuery.Substring(1, qsPosition - 1) : pathAndQuery;
            return relativeUri.StartsWith("/") ? relativeUri.TrimStart('/') : relativeUri;
        }

        public static void InitAPI()
        {
            var routes = GlobalConfiguration.Configuration.Routes;
          //  Mozu.Core.Api.HttpRouteCollectionExtensions.MapHttpRoute();
            typeof(IApiController).Assembly.GetTypes().Where(t => typeof(IApiController).IsAssignableFrom(t) && !t.IsInterface).ToList()
                .ForEach(t =>
                {
                    var name = t.Name.ToLower();
                    var routePrefix = "app/" + name.Substring(0, name.LastIndexOf("controller"));
                    routes.MapHttpRoute(t, routePrefix);               
                });

            routes.MapHttpRoute<DescriptorController>("def");
            GlobalConfiguration.Configuration.Formatters.JsonFormatter.SerializerSettings.NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore;

            GlobalConfiguration.Configuration.Services.Replace(typeof(IHttpActionSelector), new HackApiHttpActionSelector());
            GlobalConfiguration.Configuration.Filters.Add(new ApiExceptionFilter(
                                                              new ExceptionResponseBuilderCollection { IncludeExceptionDetails = true },
                                                              new ApiExceptionFilterLogger { IsErrorLoggingEnabled = false  }));


            //GlobalConfiguration.Configuration.Filters.Add(new GlobalErrorHandler());

            GlobalConfiguration.Configuration.BindParameter(typeof(FilterCollection), new FilterCollectionRequestHandler());
            GlobalConfiguration.Configuration.BindParameter(typeof(PagingParamaters), new PagingParamatersRequestHandlers());

        }



        public class HackApiHttpActionSelector : ApiControllerActionSelector
        {
            private System.Collections.Hashtable _inits = new Hashtable();

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

        private static void RegisterRoutes()
        {
            RouteCollection routes = RouteTable.Routes;
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

            //routes.MapRoute(
            //    "Default", // Route name
            //    "{controller}/{action}/{id}", // URL with parameters
            //    new { controller = "Home", action = "Index", id = UrlParameter.Optional } // Parameter defaults
            //);

            //routes.MapRoute(
            //    "Locale", // Route name
            //    "{controller}/{action}", // URL with parameters
            //    new { controller = "Home", action = "Locale" } // Parameter defaults
            //);
        }
    }
}
