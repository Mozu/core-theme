using System.Net.Http.Formatting;
using System.Reflection;
using System.Web.Http;
using Autofac;
using Mozu.Core.Api;
using Mozu.Core.Api.Routing;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.Logging;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.Mvc.MessageHandler;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.OpeationHandlers;
using Mozu.SiteBuilder.UX.Admin.MessageHandlers;
using Newtonsoft.Json.Serialization;
using Mozu.SiteBuilder.Mvc.Themes;

namespace Mozu.SiteBuilder.UX.Admin.Configuration
{
    public class BootStrapperAdmin : AbstractWebApiBootstrapper
    {
        protected override void AddMessageHandlers(HttpConfiguration httpConfiguration)
        {           
            base.AddMessageHandlers(httpConfiguration);

            httpConfiguration.MessageHandlers.Insert( 0,new HttpContextInjectingMessageHandler());
            httpConfiguration.MessageHandlers.Insert(0, new FormEncodingRewriter());

            httpConfiguration.MessageHandlers.Add(new AuthRedirectMessageHandler());
            if (Mozu.Core.Settings.MozuConfigurationManager.Settings.CoreSettings.IsSSLValidationEnabled)
            {
                httpConfiguration.MessageHandlers.Add(new SslRedirectMessageHandler());
            }
            
            httpConfiguration.BindParameter(typeof(FilterCollection), new FilterCollectionRequestHandler());
            httpConfiguration.BindParameter(typeof(PagingParamaters), new PagingParamatersRequestHandlers());
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

        protected override void AddFilters(HttpConfiguration httpConfiguration, ReflectedControllerIndex controllers)
        {
            return;
        }

        protected override void ApplicationStart(System.Web.Http.HttpConfiguration httpConfiguration)
        {
            new RouteConfig().Register( httpConfiguration.Routes );
            AddFormatters(httpConfiguration.Formatters);
            base.ApplicationStart(httpConfiguration);
            this.Container.Resolve<INfsConnectionWarmer>().Start();
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
                .UsingAssembly(Assembly.Load("Mozu.Tenant.Contracts"))
                .UsingAssembly(Assembly.Load("Mozu.ProductAdmin.Contracts"))
                .UsingAssembly(Assembly.Load("Mozu.AdminUser.Contracts"))
                .UsingAssembly(Assembly.Load("Mozu.Content.Contracts"))
                .UsingAssembly(Assembly.Load("Mozu.ShippingAdmin.Contracts"))
                .UsingAssembly(Assembly.Load("Mozu.ScheduledEvent.Contracts"))
                .UsingAssembly(Assembly.Load("Mozu.InstalledApplications.Contracts"))
                .UsingAssembly(Assembly.Load("Mozu.ShippingRuntime.Contracts"))
                .UsingAssembly(Assembly.Load("Mozu.MZDB.Contracts"))
                .UsingAssembly(Assembly.Load("Mozu.SiteSettings.Order.Contracts"))
                .UsingAssembly(Assembly.Load("Mozu.SiteSettings.General.Contracts"))
                .UsingAssembly(Assembly.Load("Mozu.SiteSettings.Shipping.Contracts"))
                .UsingAssembly(Assembly.Load("Mozu.Customer.Contracts"))
                .UsingAssembly(Assembly.Load("Mozu.Location.Contracts"))
                .UsingAssembly(Assembly.Load("Mozu.CommerceRuntime.Contracts"))
                .UsingAssembly(Assembly.Load("Mozu.Provisioning.Contracts"))
                .UsingAssembly(Assembly.Load("Mozu.AppDev.Contracts"))
                .UsingAssembly(Assembly.Load("Mozu.ProductRuntime.Contracts"))
				.UsingAssembly(Assembly.Load("Mozu.Event.Contracts"))
				.UsingAssembly(Assembly.Load("Mozu.SiteBuilder.Mvc")) //typeof preferred
                .UsingAssembly(Assembly.GetExecutingAssembly())      
                ;


            //SubstituteAggregationExceptionResponseBuilder(containerFactory);
           // containerFactory.ShowDebugOutput(true);         
        }

        //todo: Can enable in R5. - Greg Murray on 2014-04-07 
        //private void SubstituteAggregationExceptionResponseBuilder(AutofacContainerFactory containerFactory)
        //{
        //    containerFactory.UsingBuildAction(builder =>
        //    {
        //        var myBuilders = new List<IExceptionResponseBuilder>();
        //        foreach (var exceptionResponseBuilder in ExceptionResponseBuilderCollection.GetDefaultBuilders())
        //        {
        //            myBuilders.Add(exceptionResponseBuilder.GetType() == typeof (AggregateExceptionResponseBuilder)
        //                ? new FriendlyAggregateExceptionResponseBuilder()
        //                : exceptionResponseBuilder);
        //        }
        //        builder.Register(c => new ExceptionResponseBuilderCollection(myBuilders))
        //            .As<IExceptionResponseBuilderCollection>()
        //            .SingleInstance();
        //    });
        //}

        protected override ILoggingServiceFactory InitializeLoggingServiceFactory(System.Web.Http.HttpConfiguration configuration)
        {
           var ret= base.InitializeLoggingServiceFactory(configuration);

            // TODO: we really break abstraction here. base.InitializeLoggingServiceFactory should give us an object to add context providers to.

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
    }
}
