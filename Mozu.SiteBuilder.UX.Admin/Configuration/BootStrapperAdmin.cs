using System.Collections;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.ServiceModel.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Mvc;
using System.Web.Routing;
using Mozu.Core.Api;
using Mozu.Core.Logging;
using Mozu.Provisioning.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Logging;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.OpeationHandlers;
using Mozu.Tenant.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Admin.Configuration
{
    public class BootStrapperAdmin : AbstractWebApiBootstrapper
    {
        protected override void AddMessageHandlers(System.Web.Http.HttpConfiguration httpConfiguration)
        {
            base.AddMessageHandlers(httpConfiguration);
            GlobalFilters.Filters.Add(new HandleErrorAttribute());
            //  GlobalFilters.Filters.Add(new SiteBuilderAuthorizeAttribute());
       
            //configuration.Filters.Add(new ApiExceptionFilter(new ExceptionResponseBuilderCollection { IncludeExceptionDetails = true }, new ApiExceptionFilterLogger { IsErrorLoggingEnabled = false }));
          
            httpConfiguration.BindParameter(typeof(FilterCollection), new FilterCollectionRequestHandler());
            httpConfiguration.BindParameter(typeof(PagingParamaters), new PagingParamatersRequestHandlers());
            GlobalConfiguration.Configuration.Services.Replace(typeof(IHttpActionSelector), new HackApiHttpActionSelector());

        }
        protected override void ApplicationStart(System.Web.Http.HttpConfiguration httpConfiguration)
        {
            base.ApplicationStart(httpConfiguration);
        }
        public override void InitializeAutoMapperProfiles(System.Web.Http.HttpConfiguration httpConfiguration)
        {
            base.InitializeAutoMapperProfiles(httpConfiguration);
        }
        protected override void InitializeContainerFactory(Core.Configuration.AutofacContainerFactory containerFactory)
        {
            base.InitializeContainerFactory(containerFactory);
            containerFactory
                .UsingAssembly(Assembly.Load("Mozu.Core.Api"))
                .UsingAssembly(typeof(ISitesWebApiClient).Assembly)
                .UsingAssembly(typeof(IMerchantSignUpWebApiClient).Assembly)
                .UsingAssembly(typeof(IPermissionsRepository).Assembly)
                .UsingAssembly(Assembly.Load("Mozu.SiteBuilder.Mvc"))
                .UsingAssembly(Assembly.GetExecutingAssembly())
                ;

            containerFactory.ShowDebugOutput(true);
           

        }
        protected override void InitializeLoggingServiceFactory(System.Web.Http.HttpConfiguration configuration)
        {
            base.InitializeLoggingServiceFactory(configuration);

            // TODO: we really break abstraction here. base.InitializeLoggingServiceFactory should give us an object to add context providers to.

            var fac = LoggingService.LoggingServiceFactory as Log4NetServiceFactory;
            if (fac != null)
                fac.AddContextProvider(new CurrentRequestLoggingContextProvider());
        }

        protected override void PreApplicationStart(System.Web.Http.HttpConfiguration httpConfiguration)
        {
            LogStartupMessage<MvcApplication>("Mozu.SiteBuilder.Admin");
        }

        protected override void RegisterControllerRoutes(System.Web.Http.HttpConfiguration httpConfiguration)
        {
            base.RegisterControllerRoutes(httpConfiguration);
            RegisterMvcRoutes(RouteTable.Routes);
            


        }


        private void RegisterMvcRoutes(RouteCollection routes)
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
