using System.Net.Http.Formatting;
using System.Reflection;
using System.Web.Http;

using Mozu.Core.Api;
using Mozu.Core.Api.ErrorHandler;
using Mozu.Core.Logging;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Logging;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.Mvc.MessageHandler;
using Mozu.SiteBuilder.Mvc.Users;

using Mozu.SiteBuilder.UX.Filters;
using Mozu.Tenant.Contracts.Clients;
using Newtonsoft.Json.Serialization;
using Mozu.SiteBuilder.UX.MessageHandlers;

namespace Mozu.SiteBuilder.UX.Configuration
{
    public  class BootStrapperUX : AbstractWebApiBootstrapper
    {
        protected override void AddMessageHandlers(HttpConfiguration httpConfiguration)
        {
            base.AddMessageHandlers(httpConfiguration);
            httpConfiguration.MessageHandlers.Insert(0, new HttpContextInjectingMessageHandler());
            httpConfiguration.MessageHandlers.Add(new SeoDelegatingHandler());
            httpConfiguration.MessageHandlers.Add(new FourHundredMessageHandler());
            
            httpConfiguration.Formatters.JsonFormatter.SerializerSettings.ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver();

        }
        protected override void ApplicationStart(System.Web.Http.HttpConfiguration httpConfiguration)
        {
            this.AddFormatters(httpConfiguration.Formatters);
            new RouteConfig().Register(httpConfiguration.Routes);


            var settings = Mozu.Core.Settings.MozuConfigurationManager.Settings;

            var minThreadIO = settings.AppSettingsAsNullableInt("MinThreadIO");
            var minThreadWorker = settings.AppSettingsAsNullableInt("MinThreadWorker");
            if (minThreadIO != null && minThreadWorker != null && minThreadIO > 0 && minThreadWorker > 0)
                System.Threading.ThreadPool.SetMinThreads(minThreadWorker.Value, minThreadIO.Value);


            
        }

        protected override void InitializeFormatters(HttpConfiguration httpConfiguration)
        {
            base.InitializeFormatters(httpConfiguration);
            var jSerSettings = httpConfiguration.Formatters.JsonFormatter.SerializerSettings;
            jSerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();

            jSerSettings.Converters.Insert(0, new Newtonsoft.Json.Converters.StringEnumConverter()
            {
                CamelCaseText = true
            });

        }


        public override void InitializeAutoMapperProfiles(System.Web.Http.HttpConfiguration httpConfiguration)
        {
            base.InitializeAutoMapperProfiles(httpConfiguration);
        }
        protected override void AddFilters(HttpConfiguration httpConfiguration,  Core.Api.Routing.ReflectedControllerIndex controllers)
        {

            httpConfiguration.Filters.Add(new EditModeCacheInvalidatorFilter());
            httpConfiguration.Filters.Add(new AnonymousShopperFilterAttribute());
            httpConfiguration.Filters.Add(new VisitTrackingFilterAttribute());
            

            // handle exceptions with a pretty screen
         //   httpConfiguration.Filters.Add(new StorefrontErrorFilterAttribute(exceptionFilter));

            //todo:hyprlive add as webapi filteres
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
            containerFactory
               .UsingAssembly(Assembly.Load("Mozu.Core.Api"))
               .UsingAssembly(typeof(ISitesWebApiClient).Assembly)
               //.UsingAssembly(typeof(IStartUpTask).Assembly)
               .UsingAssembly(typeof(IPermissionsRepository).Assembly)
               .UsingAssembly(Assembly.Load("Mozu.SiteBuilder.Mvc"))
               .UsingAssembly(Assembly.Load("Mozu.Core.Messaging"))
               .UsingAssembly(Assembly.GetExecutingAssembly())
               ;

        }
        protected override ILoggingServiceFactory InitializeLoggingServiceFactory(System.Web.Http.HttpConfiguration configuration)
        {
            var ret=base.InitializeLoggingServiceFactory(configuration);
            
            // TODO: we really break abstraction here.
            var fac = LoggingService.LoggingServiceFactory as Log4NetServiceFactory;
            if (fac != null)
            {
                fac.AddContextProvider(new CurrentRequestLoggingContextProvider());
                fac.AddContextProvider(new ApplicationNameLoggingContextProvider(ApplicationConstants.APPLICATION_NAME));
            }
            return ret;
        }

        protected override void PreApplicationStart(System.Web.Http.HttpConfiguration httpConfiguration)
        {
            LogStartupMessage<MvcApplication>(ApplicationConstants.APPLICATION_NAME);
        }



        void AddFormatters(MediaTypeFormatterCollection formatters)
        {
            formatters.Insert(0, new HtmlActionResultMediaTypeFormatter());
            formatters.Add(new HtmlErrorMediaTypeHyperFormatter());
        }
       

    }
}
