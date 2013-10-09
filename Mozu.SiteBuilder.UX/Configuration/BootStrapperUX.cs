using System.Net.Http.Formatting;
using System.Reflection;
using System.Web.Http;

using System.Web.Routing;
using Mozu.Core.Api;
using Mozu.Core.Api.ErrorHandler;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Logging;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.Mvc.MessageHandler;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.UX.ActionFilters;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.Tenant.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Configuration
{
    public  class BootStrapperUX : AbstractWebApiBootstrapper
    {
        private const string APPLICATION_NAME = "Mozu.SiteBuilder.UX";

        protected override void AddMessageHandlers(HttpConfiguration httpConfiguration, IHttpMessageHandlerErrorHandler messageErrorHandler)
        {
            base.AddMessageHandlers(httpConfiguration, messageErrorHandler);
            httpConfiguration.MessageHandlers.Insert(0, new HttpContextInjectingMessageHandler());
           
           
        }
        protected override void ApplicationStart(System.Web.Http.HttpConfiguration httpConfiguration)
        {
            this.AddFormatters(httpConfiguration.Formatters);
            new RouteConfig().Register(httpConfiguration.Routes);
        }
        public override void InitializeAutoMapperProfiles(System.Web.Http.HttpConfiguration httpConfiguration)
        {
            base.InitializeAutoMapperProfiles(httpConfiguration);
        }
        protected override void AddFilters(HttpConfiguration httpConfiguration, Core.Api.Filters.Exception.ApiExceptionFilter exceptionFilter, Core.Api.Routing.ReflectedControllerIndex controllers)
        {
         
            httpConfiguration.Filters.Add( new AnonymousShopperFilterAttribute());
            httpConfiguration.Filters.Add(new ErrorFilterAttribute());


            //todo:hyperlive add as webapi filteres
            // httpConfiguration.Filters.Add(new NotFoundActionHttpFilter());
            //GlobalFilters.Filters.Add(new AddCorrelationHeaderFilterAttribute());
            //GlobalFilters.Filters.Add(new PreserveApiContextFilterAttribute());
            //GlobalFilters.Filters.Add(new HandleAllTheMvcErrorsFilter());
            //httpConfiguration.Filters.Add(new NotFoundActionHttpFilter());



            //base.AddFilters(httpConfiguration, exceptionFilter, controllers);
        }
        protected override void InitializeContainerFactory(Core.Configuration.AutofacContainerFactory containerFactory)
        {
            base.InitializeContainerFactory(containerFactory);
            containerFactory.UsingAssembly(Assembly.Load("Mozu.Core.Api"))
               .UsingAssembly(typeof(ISitesWebApiClient).Assembly)
               //.UsingAssembly(typeof(IStartUpTask).Assembly)
               .UsingAssembly(typeof(IPermissionsRepository).Assembly)
               .UsingAssembly(Assembly.Load("Mozu.SiteBuilder.Mvc"))
               .UsingAssembly(Assembly.GetExecutingAssembly())
               ;

        }
        protected override void InitializeLoggingServiceFactory(System.Web.Http.HttpConfiguration configuration)
        {
            base.InitializeLoggingServiceFactory(configuration);
            
            // TODO: we really break abstraction here.
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



        void AddFormatters(MediaTypeFormatterCollection formatters)
        {
            formatters.Insert(0, new HtmlActionResultMediaTypeFormatter());
            formatters.Add(new HtmlErrorMediaTypeHyperFormatter());
        }
       

    }
}
