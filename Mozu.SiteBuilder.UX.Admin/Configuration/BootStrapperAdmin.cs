using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Reflection;
using System.ServiceModel.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using System.Web.Routing;
using Autofac;
using Autofac.Integration.WebApi;
using Mozu.Core.Api;
using Mozu.Core.Api.ErrorHandler;
using Mozu.Core.Api.Routing;
using Mozu.Core.Configuration;
using Mozu.Core.Logging;
using Mozu.Provisioning.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Logging;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.Mvc.MessageHandler;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.UX.Admin.Api.ErrorHandlers;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.OpeationHandlers;
using Mozu.SiteBuilder.UX.Admin.MessageHandlers;
using Mozu.Tenant.Contracts.Clients;
using Newtonsoft.Json.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Configuration
{
    public class BootStrapperAdmin : AbstractWebApiBootstrapper
    {
        protected override void AddMessageHandlers(HttpConfiguration httpConfiguration)
        {
            
            base.AddMessageHandlers(httpConfiguration);

            //todo: replace per Wayne - Greg Murray on 2014-04-04 
            httpConfiguration.MessageHandlers.Insert( 0,new HttpContextInjectingMessageHandler());

            httpConfiguration.MessageHandlers.Add(new AuthRedirectMessageHandler());
            if (Mozu.Core.Settings.MozuConfigurationManager.Settings.CoreSettings.IsSSLValidationEnabled)
            {
                httpConfiguration.MessageHandlers.Add(new SslRedirectMessageHandler());
            }

            //todo:hypr add filters back

            //GlobalFilters.Filters.Add(new AddCorrelationHeaderFilterAttribute());
            //GlobalFilters.Filters.Add(new HandleAllTheMvcErrorsFilter());

            //  GlobalFilters.Filters.Add(new SiteBuilderAuthorizeAttribute());
       
            //configuration.FiltdFilterdsers.Add(new ApiExceptionFilter(new ExceptionResponseBuilderCollection { IncludeExceptionDetails = true }, new ApiExceptionFilterLogger { IsErrorLoggingEnabled = false }));
          
            httpConfiguration.BindParameter(typeof(FilterCollection), new FilterCollectionRequestHandler());
            httpConfiguration.BindParameter(typeof(PagingParamaters), new PagingParamatersRequestHandlers());
          //  GlobalConfiguration.Configuration.Services.Replace(typeof(IHttpActionSelector), new HackApiHttpActionSelector());

            

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
                //.UsingAssembly(Assembly.Load("Mozu.Core.Api")) //per Wayne not needed.
                .UsingAssembly(typeof(ISitesWebApiClient).Assembly)
                .UsingAssembly(typeof(IPermissionsRepository).Assembly)
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
