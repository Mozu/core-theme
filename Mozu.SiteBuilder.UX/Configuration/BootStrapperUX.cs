using Autofac;
using AutoMapper;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api;
using Mozu.Core.Logging;
using Mozu.Core.Settings;
using Mozu.Customer.Contracts.Clients;
using Mozu.Location.Contracts.Clients;
using Mozu.MZDB.Contracts.Clients;
using Mozu.ProductAdmin.Contracts;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.Reference.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Logging;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.Mvc.MessageHandler;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.SiteSettings.Order.Contracts.Clients;
using Mozu.Tenant.Contracts.Clients;
using Newtonsoft.Json.Serialization;
using System.Net.Http.Formatting;
using System.Reflection;
using System.Web.Http;
using System.Web.WebPages;

//using Mozu.SiteBuilder.UX.MessageHandlers;

namespace Mozu.SiteBuilder.UX.Configuration
{
    public  class BootStrapperUX : AbstractWebApiBootstrapper
    {
        protected override void AddMessageHandlers(HttpConfiguration httpConfiguration)
        {

            if (System.Configuration.ConfigurationManager.AppSettings["sitebuilder.EnableSystemDiagnosticsTracing"] == "true")
            {
                var traceWriter = httpConfiguration.EnableSystemDiagnosticsTracing();
                traceWriter.IsVerbose = true;
                traceWriter.MinimumLevel = System.Web.Http.Tracing.TraceLevel.Debug;
            }

            base.AddMessageHandlers(httpConfiguration);
            httpConfiguration.MessageHandlers.Insert(0, new HttpContextInjectingMessageHandler());
            httpConfiguration.MessageHandlers.Insert(0, new RedisHelthCheckMessageHandler());
            
            
            httpConfiguration.MessageHandlers.Add( new SessionHandler());
            
            httpConfiguration.MessageHandlers.Add(new MzUnderscoreRequestCleaner());
            httpConfiguration.MessageHandlers.Add(new SiteContextInitializationHandler());




            httpConfiguration.MessageHandlers.Add(new HomePageTransferHandler());
            httpConfiguration.MessageHandlers.Add(new SeoDelegatingHandler());
            
            
            httpConfiguration.MessageHandlers.Add(new FourHundredMessageHandler());

            httpConfiguration.MessageHandlers.Add(new DeepPagingLimitingRequestHandler());
            httpConfiguration.MessageHandlers.Add(new ResponseHeaderAppenderMessagHandler());
            httpConfiguration.MessageHandlers.Add(new PageContextCookieHandler());

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


            FixupDisplayMode();

            
            this.Container.Resolve<INfsConnectionWarmer>().Start();
        }

        void FixupDisplayMode()
        {
            DisplayModeProvider.Instance.Modes.Clear();

            DisplayModeProvider.Instance.Modes.Add(new PathErrorWorkaroundDisplayMode()
            {
                ContextCondition = context => context.GetOverriddenBrowser().IsMobileDevice
            });
            DisplayModeProvider.Instance.Modes.Add(new DefaultDisplayMode());
        }

        class PathErrorWorkaroundDisplayMode : DefaultDisplayMode
        {
            //used to fault if the virutal path wasnt a valid Path ( using System.Path ) 
            protected override string TransformPath(string virtualPath, string suffix)
            {
                try
                {
                   return base.TransformPath(virtualPath, suffix);
                }
                catch
                {
                    return base.TransformPath(virtualPath, null);
                }
            }
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

        /// <inheritdoc />
        public override void InitializeAutoMapperProfiles(IMapperConfigurationExpression exp)
        {
            base.InitializeAutoMapperProfiles(exp);
        }

        protected override void AddFilters(HttpConfiguration httpConfiguration,  Core.Api.Routing.ReflectedControllerIndex controllers)
        {

            httpConfiguration.Filters.Add(new EditModeCacheInvalidatorFilter());
            httpConfiguration.Filters.Add(new AnonymousShopperFilterAttribute());
            httpConfiguration.Filters.Add(new VisitTrackingFilterAttribute());
            httpConfiguration.Filters.Add(new Mozu.Core.Actions.GlobalActionExtensionFilter());

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
               .UsingAssembly(typeof(ISitesWebApiClient).Assembly)
               .UsingAssembly(typeof(ILocationRuntimeWebApiClient).Assembly)
               .UsingAssembly(typeof(IPermissionsRepository).Assembly)
               .UsingAssembly(typeof(CustomerAccountWebApiClient).Assembly)
               .UsingAssembly(typeof(IMultiScopeInvitationWebApiClient).Assembly)
               .UsingAssembly(typeof(Category).Assembly)
               .UsingAssembly(typeof(ProductRuntimeWebApiClient).Assembly)
               .UsingAssembly(typeof(CartWebApiClient).Assembly)
               .UsingAssembly(typeof(CheckoutSettingsWebApiClient).Assembly)
               .UsingAssembly(typeof(IGeneralSettingsWebApiClient).Assembly)
               .UsingAssembly(typeof(ReferenceDataWebApiClient).Assembly)
               .UsingAssembly(typeof(IEntityListsWebApiClient).Assembly)
               .UsingAssembly(typeof(IDocumentListWebApiClient).Assembly)
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
