using System.Collections;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Reflection;
using System.ServiceModel.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

using System.Web.Routing;
using Autofac.Integration.WebApi;
using Mozu.Core.Api;
using Mozu.Core.Api.ErrorHandler;
using Mozu.Core.Logging;
using Mozu.Provisioning.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Logging;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.Mvc.MessageHandler;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.OpeationHandlers;
using Mozu.SiteBuilder.UX.Admin.MessageHandlers;
using Mozu.Tenant.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Admin.Configuration
{
    public class BootStrapperAdmin : AbstractWebApiBootstrapper
    {
        private const string APPLICATION_NAME = "Mozu.SiteBuilder.Admin";
     
        protected override void AddMessageHandlers(HttpConfiguration httpConfiguration, IHttpMessageHandlerErrorHandler messageErrorHandler)
        {
            
            base.AddMessageHandlers(httpConfiguration, messageErrorHandler);

            httpConfiguration.MessageHandlers.Insert( 0,new HttpContextInjectingMessageHandler());
            httpConfiguration.MessageHandlers.Add( new AuthRedirectMessageHandler());
            //todo:hypr add filters back

            //GlobalFilters.Filters.Add(new AddCorrelationHeaderFilterAttribute());
            //GlobalFilters.Filters.Add(new HandleAllTheMvcErrorsFilter());

            //  GlobalFilters.Filters.Add(new SiteBuilderAuthorizeAttribute());
       
            //configuration.FiltdFilterdsers.Add(new ApiExceptionFilter(new ExceptionResponseBuilderCollection { IncludeExceptionDetails = true }, new ApiExceptionFilterLogger { IsErrorLoggingEnabled = false }));
          
            httpConfiguration.BindParameter(typeof(FilterCollection), new FilterCollectionRequestHandler());
            httpConfiguration.BindParameter(typeof(PagingParamaters), new PagingParamatersRequestHandlers());
          //  GlobalConfiguration.Configuration.Services.Replace(typeof(IHttpActionSelector), new HackApiHttpActionSelector());

            

        }
        protected override void AddFilters(HttpConfiguration httpConfiguration, Core.Api.Filters.Exception.ApiExceptionFilter exceptionFilter, Core.Api.Routing.ReflectedControllerIndex controllers)
        {
            httpConfiguration.Filters.Add(exceptionFilter);

        }
        protected override void ApplicationStart(System.Web.Http.HttpConfiguration httpConfiguration)
        {
            new RouteConfig().Register( httpConfiguration.Routes );
            AddFormatters(httpConfiguration.Formatters);
            base.ApplicationStart(httpConfiguration);
        }

        private void AddFormatters(MediaTypeFormatterCollection formatters )
        {
            formatters.Insert(0, new HtmlActionResultMediaTypeFormatter());
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
            {
                fac.AddContextProvider(new CurrentRequestLoggingContextProvider());
                fac.AddContextProvider(new ApplicationNameLoggingContextProvider(APPLICATION_NAME));
            }
        }

        protected override void PreApplicationStart(System.Web.Http.HttpConfiguration httpConfiguration)
        {
            LogStartupMessage<MvcApplication>(APPLICATION_NAME);
        }




      

       
    }
}
