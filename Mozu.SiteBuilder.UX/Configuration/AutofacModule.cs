using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Web.Http;
using Autofac;
using Autofac.Core;
using Autofac.Core.Lifetime;
using Autofac.Core.Resolving;
using Autofac.Integration.WebApi;
using Burrows.Autofac;
using Burrows.Configuration;
using Burrows.Publishing;
using Mozu.Content.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Configuration;
using Mozu.Core.Logging;
using Mozu.Core.Messaging.Publish;
using Mozu.Core.Settings;
using Mozu.MZDB.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Caching;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Logging;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.Mvc.Mobile;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.Mvc.Users;

using Mozu.SiteBuilder.UX.Messaging;
using Mozu.SiteSettings.General.Contracts.Clients;
using Module = Autofac.Module;
using Mozu.SiteBuilder.UX.Areas.Misc;

namespace Mozu.SiteBuilder.UX.Configuration
{
    public class AutofacModule : Module
    {
        public string ApiBaseUri { get; set; }
        class SbApiContextBuilder : IApiContextBuilder
        {

            public IApiContext BuildApiContext(IApiContext apiContext, System.Net.Http.HttpRequestMessage request)
            {
                return (IApiContext)request.GetDependencyScope().GetService(typeof(IApiContext));

            }
        }
        protected override void Load(ContainerBuilder builder)
        {

            builder.RegisterHttpRequestMessage(GlobalConfiguration.Configuration);

            builder.RegisterType<SiteBuilderApiContext>().As<Mozu.Core.IApiContext>().As<ISiteBuilderApiContext>().InstancePerRequest();
            // builder.RegisterType<Mozu.SiteBuilder.Mvc.Security.AuthenticationHelper>().InstancePerHttpRequest();
            builder.RegisterType<ServiceClientMessageHandler>().As<IServiceClientMessageHandler>().InstancePerRequest();
            builder.RegisterType<SbApiContextBuilder>().As<IApiContextBuilder>();

        //    builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteBuilder.Mvc.Customers.CustomerRepository).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.Customer.Contracts.Clients.CustomerAccountWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.AdminUser.Contracts.Clients.IMultiScopeInvitationWebApiClient).Assembly);
            // builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.Content.Contracts.Clients.DocumentListWebApiClient    ).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.ProductAdmin.Contracts.Category).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.ProductRuntime.Contracts.Clients.ProductRuntimeWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.CommerceRuntime.Contracts.Clients.CartWebApiClient).Assembly);

            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteSettings.Order.Contracts.Clients.CheckoutSettingsWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.Reference.Contracts.Clients.ReferenceDataWebApiClient).Assembly);


            
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteSettings.Order.Contracts.CheckoutSettings).Assembly);

            builder.RegisterType<ThemeSettingsRepository>().As<IThemeSettingsRepository>().InstancePerRequest();

            builder.RegisterType<FiftyOneDegreesMobileDetectionProvider>().As<IMobileDetectionProvider>().InstancePerRequest();
            builder.RegisterClassesMatchingInterfaceName(typeof(IEntityListsWebApiClient).Assembly);

            //  builder.RegisterType<BehaviorWebApiClient>().As<IBehaviorWebApiClient>();
            builder.RegisterType<PermissionsRepository>().As<IPermissionsRepository>().InstancePerRequest();



            // TODO: this is an old cache implementation that needs to be deleted
          //builder.RegisterType<DefaultStorefrontCache>().As<Mozu.SiteBuilder.Mvc.IStorefrontCache>().InstancePerRequest();
            builder.RegisterType<ServiceClientMessageHandler>().InstancePerRequest();
            //builder.Register(c => new GeneralSettingsWebApiClient(c.Resolve<ServiceClientMessageHandler>())).As<IGeneralSettingsWebApiClient>().InstancePerLifetimeScope();
            //builder.Register(c => new DocumentWebApiClient(c.Resolve<ServiceClientMessageHandler>())).As<IDocumentListWebApiClient>().InstancePerLifetimeScope();
            //builder.Register(c => new ProductCategoryRuntimeWebApiClient(c.Resolve<ServiceClientMessageHandler>())).As<IProductCategoryRuntimeWebApiClient>().InstancePerLifetimeScope();
            //builder.Register(c => new ProductRuntimeWebApiClient(c.Resolve<ServiceClientMessageHandler>())).As<IProductRuntimeWebApiClient>().InstancePerLifetimeScope();

            //  builder.RegisterType<MockProductCategoryRuntimeWebApiClient>().As<IProductCategoryRuntimeWebApiClient>();
            //builder.RegisterType<DjangoMozuViewEngine>().As<DjangoMozuViewEngine>().As<IViewEngine>().InstancePerLifetimeScope();

            // TODO: is this necessary
            builder.RegisterType<RuntimeCategoryTreeProvider>().As<ICategoryTreeProvider>().InstancePerRequest();

            // builder.RegisterType<MozuServiceClientMessageHandler>().As<IServiceClientMessageHandler>();

            builder.RegisterType<DocumentListWebApiClient>().As<IDocumentListWebApiClient>().InstancePerRequest();
            builder.RegisterType<GeneralSettingsWebApiClient>().As<IGeneralSettingsWebApiClient>().InstancePerRequest();

            builder.RegisterType<DocumentListWebApiClient>().As<IDocumentListWebApiClient>().InstancePerRequest();
            builder.RegisterType<GeneralSettingsWebApiClient>().As<IGeneralSettingsWebApiClient>().InstancePerRequest();


            builder.RegisterType<PropertyTypeWebApiClient>().As<IPropertyTypeWebApiClient>().InstancePerRequest();

            //builder.Register(c =>
            //{
            //    var handler = c.Resolve<IServiceClientMessageHandler>();
            //    var docClient = new DocumentTypeWebApiClient(handler);
            //    docClient.Options.DisableCache = true;
            //    return docClient;
            //}  ).As<IDocumentTypeWebApiClient>().InstancePerRequest();
            builder.RegisterType<DocumentTypeWebApiClient>().As<IDocumentTypeWebApiClient>().InstancePerRequest();

            builder.RegisterType<GeneralSettingsWebApiClient>().As<IGeneralSettingsWebApiClient>().InstancePerRequest();

            // set up a MemoryCache just for us
            builder.Register(c => new System.Runtime.Caching.MemoryCache("sfcache")).Named<System.Runtime.Caching.ObjectCache>("sfcache").SingleInstance();
            // builder.RegisterType<Mozu.SiteBuilder.UX.Caching.StorefrontCache>()
            //     .WithParameter(
            //         // when parameter is a type of ObjectCache
            //         (p,c) => p.ParameterType.IsSubclassOf(typeof(System.Runtime.Caching.ObjectCache)),
            //         // resolve it using this named service
            //         (p,c) => c.ResolveNamed<System.Runtime.Caching.ObjectCache>("sfcache")
            //     )
            //     .InstancePerRequest()
            // ;

            // add these two logging context providers for loggers provided by the DI framework.
            builder.RegisterType<CurrentRequestLoggingContextProvider>().As<ILoggingContextProvider>().InstancePerLifetimeScope();
            builder.RegisterType<ApplicationNameLoggingContextProvider>().As<ILoggingContextProvider>().WithParameter("applicationName", ApplicationConstants.APPLICATION_NAME).InstancePerLifetimeScope();

            builder.RegisterType<VisitEventPublisher>().AsSelf().InstancePerRequest();
            builder.RegisterType<CacheItemsInvalidConsumer>().AsSelf().SingleInstance();
           // builder.RegisterType<CacheItemsInvalidConsumer2>().AsSelf();

            // Register a MassTransit/Burrows IPublisher for visits.
            // The rabbitMQ connectionstring is used to recieve control messages sent to our application by MassTransit.
            builder.Register(c => c.Resolve<ISettings>().CreatePublisher("SiteBuilderOutgoingMessageQueue", "Mozu.SiteBuilder.UX")).As<IPublisher>().SingleInstance();
            builder.Register(c => System.Runtime.Caching.MemoryCache.Default).As<System.Runtime.Caching.ObjectCache>().SingleInstance();
            builder.RegisterType<SiteBuilderHttpErrorResponseGenerator>().As<IHttpErrorResponseGenerator>();
            builder.RegisterType<HttpErrorResponseGenerator>();
            builder.RegisterType<StorefrontCacheControlImpl>().As<IStorefrontCacheControl>().SingleInstance();;

            builder.RegisterType<AMDModuleProvider>().AsImplementedInterfaces().AsSelf();
            builder.RegisterType<LessLogger>().AsImplementedInterfaces().AsSelf();
            builder.RegisterType<LessTransFormer>().AsImplementedInterfaces().AsSelf();
            builder.RegisterType<MyLessFileReader>().AsImplementedInterfaces().AsSelf();
            builder.RegisterType<TemplateInheritanceHandler>().AsImplementedInterfaces().AsSelf();

            builder
              .Register(c =>
              {
                  var format = c.Resolve<ISettings>().ConnectionStrings("SiteBuilderIncomingMessageQueueFormatString");
                  var conString = string.Format(format.Value, Guid.NewGuid().ToString("N"));
                  var cacheInvalidator = c.Resolve<CacheItemsInvalidConsumer>();
                  var lifeTimeScope = c.Resolve<ILifetimeScope>();
                  var burrowsScope = new BurrowsConumerScope() { Thing = cacheInvalidator , ComponentRegistry= lifeTimeScope.ComponentRegistry };
                 
                  var factory = ServiceBusFactory.New(sbc => sbc
                  .Configure(conString, subs => subs.LoadFrom(burrowsScope))
                  .SetConcurrentConsumerLimit(10));
                  return factory;
              }
              )
               .SingleInstance()
              .AutoActivate();




        }



       

        class BurrowsConumerScope : ILifetimeScope , IDisposer
        {
            public object Thing { get; set; }
            public object ResolveComponent(IComponentRegistration registration, IEnumerable<Parameter> parameters)
            {
                return Thing;
            }

            public IComponentRegistry ComponentRegistry { get; set; }
            public void Dispose()
            {
             
            }

            public void AddInstanceForDisposal(IDisposable instance)
            {
                
            }

            public ILifetimeScope BeginLifetimeScope()
            {
                return this;
            }

            public ILifetimeScope BeginLifetimeScope(object tag)
            {
                return this;
            }

            public ILifetimeScope BeginLifetimeScope(Action<ContainerBuilder> configurationAction)
            {
                return this;
            }

            public ILifetimeScope BeginLifetimeScope(object tag, Action<ContainerBuilder> configurationAction)
            {
                return this;
            }

            public IDisposer Disposer
            {
                get
                {
                    return this;
                }
            }
            public object Tag { get; set; }
            public event EventHandler<LifetimeScopeBeginningEventArgs> ChildLifetimeScopeBeginning;
            public event EventHandler<LifetimeScopeEndingEventArgs> CurrentScopeEnding;
            public event EventHandler<ResolveOperationBeginningEventArgs> ResolveOperationBeginning;
        }


    }
}
