using dotless.Core.Input;
using MassTransit;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Mozu.Core;
using Mozu.Core.Configuration;
using Mozu.Core.Logging;
using Mozu.Core.Messaging.Consume;
using Mozu.Core.Messaging.Contracts.Product.Events;
using Mozu.Core.Messaging.Contracts.Search.Events;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Logging;
using Mozu.SiteBuilder.Mvc.Mobile;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.UX.Areas.Misc;
using Mozu.SiteBuilder.UX.Messaging;
using System;
using Microsoft.AspNetCore.StaticFiles;

namespace Mozu.SiteBuilder.UX.Configuration
{
    public class AutofacModule : IDependencyConfigurator
    {
        public string ApiBaseUri { get; set; }
        //class SbApiContextBuilder : IApiContextBuilder
        //{

        //    public IApiContext BuildApiContext(IApiContext apiContext, System.Net.Http.HttpRequestMessage request)
        //    {
        //        return (IApiContext)request.GetDependencyScope().GetService(typeof(IApiContext));

        //    }
        //}

        //class BurrowsConumerScope : ILifetimeScope , IDisposer
        //{
        //    public object Thing { get; set; }
        //    public object ResolveComponent(IComponentRegistration registration, IEnumerable<Parameter> parameters)
        //    {
        //        return Thing;
        //    }

        //    public IComponentRegistry ComponentRegistry { get; set; }
        //    public void Dispose()
        //    {
             
        //    }

        //    public void AddInstanceForDisposal(IDisposable instance)
        //    {
                
        //    }

        //    public ILifetimeScope BeginLifetimeScope()
        //    {
        //        return this;
        //    }

        //    public ILifetimeScope BeginLifetimeScope(object tag)
        //    {
        //        return this;
        //    }

        //    public ILifetimeScope BeginLifetimeScope(Action<ContainerBuilder> configurationAction)
        //    {
        //        return this;
        //    }

        //    public ILifetimeScope BeginLifetimeScope(object tag, Action<ContainerBuilder> configurationAction)
        //    {
        //        return this;
        //    }

        //    public IDisposer Disposer => this;
        //    public object Tag { get; set; }
        //    public event EventHandler<LifetimeScopeBeginningEventArgs> ChildLifetimeScopeBeginning;
        //    public event EventHandler<LifetimeScopeEndingEventArgs> CurrentScopeEnding;
        //    public event EventHandler<ResolveOperationBeginningEventArgs> ResolveOperationBeginning;
        //}


        public void Configure(IServiceCollection configure)
        {
            configure.AddCoreExpressionEvaluation();
            configure.AddSingleton<IContentTypeProvider, FileExtensionContentTypeProvider>();
            //configure.RegisterHttpRequestMessage(GlobalConfiguration.Configuration);

            configure.AddScoped<IApiContext>(c=> c.GetService<IApiContextAccessor>().ApiContext);
            configure.AddScoped<ISiteBuilderApiContext>(c => (ISiteBuilderApiContext)c.GetService<IApiContextAccessor>().ApiContext);
            configure.AddScoped<IApiContextFactory, SiteBuilderApiContextBuilder>();
       

            //configure.AddScoped<IApiContextBuilder, SbApiContextBuilder>();
            //builder.RegisterType<Mozu.SiteBuilder.Mvc.Security.AuthenticationHelper>().InstancePerHttpRequest();
            //builder.RegisterType<ServiceClientMessageHandler>().As<IServiceClientMessageHandler>().InstancePerRequest();

            //builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteBuilder.Mvc.Customers.CustomerRepository).Assembly);
            //builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.Customer.Contracts.Clients.CustomerAccountWebApiClient).Assembly);
            //builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.AdminUser.Contracts.Clients.IMultiScopeInvitationWebApiClient).Assembly);
            //builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.Content.Contracts.Clients.DocumentListWebApiClient    ).Assembly);
            //builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.ProductAdmin.Contracts.Category).Assembly);
            //builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.ProductRuntime.Contracts.Clients.ProductRuntimeWebApiClient).Assembly);
            //builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.CommerceRuntime.Contracts.Clients.CartWebApiClient).Assembly);
            //builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteSettings.Order.Contracts.Clients.CheckoutSettingsWebApiClient).Assembly);
            //builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.Reference.Contracts.Clients.ReferenceDataWebApiClient).Assembly);
            //builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteSettings.Order.Contracts.CheckoutSettings).Assembly);

            configure.AddScoped<IThemeSettingsRepository, ThemeSettingsRepository>();
            // todo:cole revisit for mobile detection No Op wont due 
            //builder.RegisterType<FiftyOneDegreesMobileDetectionProvider>().As<IMobileDetectionProvider>().InstancePerRequest();
            configure.AddScoped<IMobileDetectionProvider, NoOpMobileDetectionProvider>();
            configure.AddScoped<IPermissionsRepository, PermissionsRepository>();
            //builder.RegisterClassesMatchingInterfaceName(typeof(IEntityListsWebApiClient).Assembly);
            //  builder.RegisterType<BehaviorWebApiClient>().As<IBehaviorWebApiClient>();

            // TODO: this is an old cache implementation that needs to be deleted
            //builder.RegisterType<DefaultStorefrontCache>().As<Mozu.SiteBuilder.Mvc.IStorefrontCache>().InstancePerRequest();
            //builder.RegisterType<ServiceClientMessageHandler>().InstancePerRequest();
            //builder.Register(c => new GeneralSettingsWebApiClient(c.Resolve<ServiceClientMessageHandler>())).As<IGeneralSettingsWebApiClient>().InstancePerLifetimeScope();
            //builder.Register(c => new DocumentWebApiClient(c.Resolve<ServiceClientMessageHandler>())).As<IDocumentListWebApiClient>().InstancePerLifetimeScope();
            //builder.Register(c => new ProductCategoryRuntimeWebApiClient(c.Resolve<ServiceClientMessageHandler>())).As<IProductCategoryRuntimeWebApiClient>().InstancePerLifetimeScope();
            //builder.Register(c => new ProductRuntimeWebApiClient(c.Resolve<ServiceClientMessageHandler>())).As<IProductRuntimeWebApiClient>().InstancePerLifetimeScope();

            //  builder.RegisterType<MockProductCategoryRuntimeWebApiClient>().As<IProductCategoryRuntimeWebApiClient>();
            //builder.RegisterType<DjangoMozuViewEngine>().As<DjangoMozuViewEngine>().As<IViewEngine>().InstancePerLifetimeScope();

            // TODO: is this necessary
            configure.AddScoped<ICategoryTreeProvider, RuntimeCategoryTreeProvider>();

            // builder.RegisterType<MozuServiceClientMessageHandler>().As<IServiceClientMessageHandler>();

            //builder.RegisterType<DocumentListWebApiClient>().As<IDocumentListWebApiClient>().InstancePerRequest();
            //builder.RegisterType<GeneralSettingsWebApiClient>().As<IGeneralSettingsWebApiClient>().InstancePerRequest();
            //builder.RegisterType<PropertyTypeWebApiClient>().As<IPropertyTypeWebApiClient>().InstancePerRequest();

            //builder.Register(c =>
            //{
            //    var handler = c.Resolve<IServiceClientMessageHandler>();
            //    var docClient = new DocumentTypeWebApiClient(handler);
            //    docClient.Options.DisableCache = true;
            //    return docClient;
            //}  ).As<IDocumentTypeWebApiClient>().InstancePerRequest();
            //builder.RegisterType<DocumentTypeWebApiClient>().As<IDocumentTypeWebApiClient>().InstancePerRequest();

            //builder.RegisterType<GeneralSettingsWebApiClient>().As<IGeneralSettingsWebApiClient>().InstancePerRequest();

            // set up a MemoryCache just for us
            configure.AddMemoryCache();
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
            configure.AddScoped<ILoggingContextProvider, CurrentRequestLoggingContextProvider>();
            //builder.RegisterType<ApplicationNameLoggingContextProvider>().As<ILoggingContextProvider>().WithParameter("applicationName", ApplicationConstants.APPLICATION_NAME).InstancePerLifetimeScope();

            configure.AddScoped<VisitEventPublisher>();
            configure.AddSingleton<CacheItemsInvalidConsumer>();
            // builder.RegisterType<CacheItemsInvalidConsumer2>().AsSelf();



            configure.AddMozuBus("SiteBuilderMessageQueue", (cfg, host, connectionSettings, provider) =>
            {
                cfg.ReceiveEndpoint(host, connectionSettings.QueueName+"_" + System.Environment.MachineName , ep =>
                {
                    ep.AutoDelete = true;
                    ep.Durable = false;
                    ep.Consumer<CacheItemsInvalidConsumer>(provider);
                    ep.Consumer<SiteBuilderContextInvalidatorConsumer>(provider);
                });
            });


            //configure.AddScoped<IHttpErrorResponseGenerator, SiteBuilderHttpErrorResponseGenerator>();
            //builder.RegisterType<HttpErrorResponseGenerator>();
            configure.AddScoped<AMDModuleProvider>();
            configure.AddScoped<LessLogger>();
            //configure.AddScoped<ILogger, LessLogger>();
            configure.AddScoped<LessTransFormer>();
            configure.AddScoped<MyLessFileReader>();
            configure.AddScoped<IFileReader, MyLessFileReader>();
            configure.AddScoped<TemplateInheritanceHandler>();
            configure.AddScoped<ITemplateInheritanceHandler, TemplateInheritanceHandler>();
            configure.AddSingleton<LoggingConsumer, CacheItemsInvalidConsumer>();
            configure.AddSingleton<IConsumer<IProductEvent>, CacheItemsInvalidConsumer>();
            configure.AddSingleton<IConsumer<ICategoryEvent>, CacheItemsInvalidConsumer>();
            configure.AddSingleton<IConsumer<IDiscountEvent>, CacheItemsInvalidConsumer>();
            configure.AddSingleton<IConsumer<ISearchIndexUpdated>, CacheItemsInvalidConsumer>();
            configure.AddSingleton<IConsumer<IFacetEvent>, CacheItemsInvalidConsumer>();
            configure.AddSingleton<IConsumer<ISearchTuningRuleEvent>, CacheItemsInvalidConsumer>();
            configure.AddSingleton<IConsumer<ISearchSettingsEvent>, CacheItemsInvalidConsumer>();
            configure.AddSingleton<SiteBuilderContextInvalidatorConsumer>();
            //builder
            //  .Register(c =>
            //  {
            //      var format = c.Resolve<ISettings>().ConnectionStrings("SiteBuilderIncomingMessageQueueFormatString");
            //      var conString = string.Format(format, Guid.NewGuid().ToString("N"));
            //      var cacheInvalidator = c.Resolve<CacheItemsInvalidConsumer>();
            //      //var lifeTimeScope = c.Resolve<ILifetimeScope>();
            //      //var burrowsScope = new BurrowsConumerScope() { Thing = cacheInvalidator, ComponentRegistry = lifeTimeScope.ComponentRegistry };

            //      var factory = ServiceBusFactory.New(sbc =>
            //      sbc
            //        .Configure(conString, subs => subs.Consumer<CacheItemsInvalidConsumer>(() => cacheInvalidator))
            //        .SetConcurrentConsumerLimit(2)

            //      );


            //      return factory;
            //  })

            //  .AutoActivate();
            //builder
            //.Register(c =>
            //{
            //    var consumer = c.Resolve<SiteBuilderContextInvalidatorConsumer>();
            //    var settings = c.Resolve<ISettings>();
            //    return settings.CreatePublisher("SiteBuilderMessageQueue", "Mozu.Sitebuilder.Mvc", subscriptionSource =>
            //    {
            //        subscriptionSource.Consumer<SiteBuilderContextInvalidatorConsumer>(() => consumer);
            //        // subscriptionSource.Consumer<>
            //    }, new MessageBusSettings() { ConcurrentConsumerLimit = 2 });


            //}).AutoActivate();
        }
    }
}
