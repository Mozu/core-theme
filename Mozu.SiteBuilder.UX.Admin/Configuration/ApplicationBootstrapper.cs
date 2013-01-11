using System;
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
            typeof(IApiController).Assembly.GetTypes().Where(t => typeof(IApiController).IsAssignableFrom(t) && !t.IsInterface).ToList()
                .ForEach(t =>
                {
                    
                 

                    var name = t.Name.ToLower();
                    var routeMembers = t.GetMethods().Where(m => m.IsPublic);

                    foreach (var method in routeMembers)
                    {
                        var wia = method.GetCustomAttributes(false).OfType<WebInvokeAttribute>().FirstOrDefault();

                        if (wia != null)
                        {
                            var controllerName = name.Substring(0, name.LastIndexOf("controller"));
                            var routeTemplate = string.Join("/", "app", controllerName, LocalPathFromRelativeUri(wia.UriTemplate));

                            routes.MapHttpRoute(method.Name + "-" + controllerName, routeTemplate,
                                new { controller = controllerName, action = method.Name },
                                new { httpMethod = new System.Web.Http.Routing.HttpMethodConstraint(HttpMethod.Post) });
                        }

                        var wga = method.GetCustomAttributes(false).OfType<WebGetAttribute>().FirstOrDefault();

                        if (wga != null)
                        {
                            var controllerName = name.Substring(0, name.LastIndexOf("controller"));
                            var routeTemplate = string.Join("/", "app", controllerName, LocalPathFromRelativeUri(wga.UriTemplate));

                            routes.MapHttpRoute(method.Name + "-" + controllerName, routeTemplate,
                                new { controller = controllerName, action = method.Name },
                                new { httpMethod = new System.Web.Http.Routing.HttpMethodConstraint(HttpMethod.Get) });
                        }
                    }
                });

            /*File.WriteAllLines(@"C:\routes.html", new[] { "<html><body><table>" }.Concat(routes.Select(x =>
                {
                    var uri = @"http://65.vnextdev.com:666/admin/" + x.RouteTemplate;

                    return string.Format(@"<tr><td><a href=""{0}"">{0}</a></td><td>{1}</td><td>{2}</td></tr>",
                        uri,
                        string.Join(", ", x.Defaults.Select(d => d.Key + "=" + d.Value)),
                        string.Join(", ", x.Constraints.Select(c => c.Key + "=" + string.Join(";", (c.Value as System.Web.Http.Routing.HttpMethodConstraint).AllowedMethods)))
                        );

                })).Concat(new [] { "</table></body></html>"}));*/


            GlobalConfiguration.Configuration.Filters.Add(new GlobalErrorHandler());

            GlobalConfiguration.Configuration.BindParameter(typeof(FilterCollection), new FilterCollectionRequestHandler());
            GlobalConfiguration.Configuration.BindParameter(typeof(PagingParamaters), new PagingParamatersRequestHandlers());

            //GlobalConfiguration.Configuration.Filters.Add(new TenantSiteHeadersResolverActionFilter());

            //var apiBootStrapper = _container.Resolve<Mozu.Core.Api.APIBootStrapper>();
            //var config = apiBootStrapper.Init(_container);

            //config.EnableTestClient = true;
            //config.EnableHelpPage = true;
            //config.ErrorHandlers = (handlers, endpoint, descriptions) => handlers.Add(new GlobalErrorHandler());
            //var apiRequestHandler = config.RequestHandlers ;
            //var parentCi = config.CreateInstance;

            //    config.RequestHandlers =  ( col, endpoint, operationDesc )=>{
            //        apiRequestHandler(col, endpoint, operationDesc);
            //        col.Add(new FilterCollectionRequestHandler());
            //        col.Add(new PagingParamatersRequestHandlers());


            //        var authorizeAttribute = operationDesc.Attributes.OfType<ApiAuthorizeAttribute>().FirstOrDefault();
            //        if (authorizeAttribute != null)
            //        {
            //            col.Add(new AuthOperationHandler(authorizeAttribute));
            //        }
            //        else
            //        {
            //            if( !operationDesc.DeclaringContract.ContractType.GetCustomAttributes(false ).OfType< AllowAnonymousAttribute>().Any())
            //            {
            //                col.Add(new AuthOperationHandler(new ApiAuthorizeAttribute()));
            //            }
            //        }
            //    };

            //    config.TrailingSlashMode = TrailingSlashMode.Ignore;
            //    config.MaxReceivedMessageSize = 1024 * 1024 * 10;
            //    config.TransferMode = System.ServiceModel.TransferMode.Streamed;
            //    config.Formatters.Remove(config.Formatters.XmlFormatter);

            //    RouteTable.Routes.SetDefaultHttpConfiguration(config);

            //    typeof(IApiController).Assembly.GetTypes().Where(t => typeof(IApiController).IsAssignableFrom(t) && !t.IsInterface).ToList()
            //        .ForEach(t => {
            //            var routePrefix = "app/" + t.Name.ToLower().Replace("api", "");
            //            var webApiRoute = new WebApiRoute(routePrefix, new HttpServiceHostFactory { Configuration = config }, t);
            //            RouteTable.Routes.Add(webApiRoute);
            //        });

            //    // Non conventional routes - File names or paths could be changed to be nicer
            //    RouteTable.Routes.MapServiceRoute<OptionsApi>("app/option", config);
            //    RouteTable.Routes.MapServiceRoute<ProductOptionsApi>("app/productOption", config);
            //    RouteTable.Routes.MapServiceRoute<FileManagementApi>("app/fileMangment", config);
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
