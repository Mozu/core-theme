using System.Net.Http;
using System.Web.Http;
using System.Linq;
using Autofac;
using Autofac.Integration.WebApi;
using Burrows.Autofac;
using Burrows.Configuration;
using Burrows.Log4Net;
using Burrows.Publishing;
using Mozu.Content.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Handlers.Message;
using Mozu.Core.Configuration;
using Mozu.Core.Logging;
using Mozu.Core.Messaging.Consume;
using Mozu.Core.Messaging.Publish;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Logging;
using Mozu.SiteBuilder.Mvc.Mobile;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.UX.Caching;
using Mozu.SiteBuilder.UX.Messaging;
using Mozu.SiteBuilder.UX.Navigation;
using Mozu.SiteSettings.General.Contracts.Clients;
using Module = Autofac.Module;

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

            builder.RegisterType<SiteBuilderApiContext>().As<Mozu.Core.IApiContext>().As<ISiteBuilderApiContext>().InstancePerApiRequest();
            // builder.RegisterType<Mozu.SiteBuilder.Mvc.Security.AuthenticationHelper>().InstancePerHttpRequest();
            builder.RegisterType<ServiceClientMessageHandler>().As<IServiceClientMessageHandler>().InstancePerApiRequest();
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


            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteSettings.Shipping.Contracts.Clients.ShippingSettingsWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteSettings.Order.Contracts.CheckoutSettings).Assembly);

            builder.RegisterType<ThemeSettingsRepository>().As<IThemeSettingsRepository>().InstancePerApiRequest();

            builder.RegisterType<FiftyOneDegreesMobileDetectionProvider>().As<IMobileDetectionProvider>().InstancePerApiRequest();


            //  builder.RegisterType<BehaviorWebApiClient>().As<IBehaviorWebApiClient>();
            builder.RegisterType<PermissionsRepository>().As<IPermissionsRepository>().InstancePerApiRequest();



            // TODO: this is an old cache implementation that needs to be deleted
            builder.RegisterType<DefaultStorefrontCache>().As<Mozu.SiteBuilder.Mvc.IStorefrontCache>().InstancePerApiRequest();
            builder.RegisterType<ServiceClientMessageHandler>().InstancePerApiRequest();

            //builder.Register(c => new GeneralSettingsWebApiClient(c.Resolve<ServiceClientMessageHandler>())).As<IGeneralSettingsWebApiClient>().InstancePerLifetimeScope();
            //builder.Register(c => new DocumentWebApiClient(c.Resolve<ServiceClientMessageHandler>())).As<IDocumentListWebApiClient>().InstancePerLifetimeScope();
            //builder.Register(c => new ProductCategoryRuntimeWebApiClient(c.Resolve<ServiceClientMessageHandler>())).As<IProductCategoryRuntimeWebApiClient>().InstancePerLifetimeScope();
            //builder.Register(c => new ProductRuntimeWebApiClient(c.Resolve<ServiceClientMessageHandler>())).As<IProductRuntimeWebApiClient>().InstancePerLifetimeScope();

            //  builder.RegisterType<MockProductCategoryRuntimeWebApiClient>().As<IProductCategoryRuntimeWebApiClient>();
            //builder.RegisterType<DjangoMozuViewEngine>().As<DjangoMozuViewEngine>().As<IViewEngine>().InstancePerLifetimeScope();

            builder.RegisterType<RuntimeCategoryTreeProvider>().As<ICategoryTreeProvider>().InstancePerApiRequest();
            builder.RegisterType<CategoryNavigationProvider>().As<ICategoryNavigationProvider>().InstancePerApiRequest();

            // builder.RegisterType<MozuServiceClientMessageHandler>().As<IServiceClientMessageHandler>();

            builder.RegisterType<DocumentListWebApiClient>().As<IDocumentListWebApiClient>().InstancePerApiRequest();
            builder.RegisterType<GeneralSettingsWebApiClient>().As<IGeneralSettingsWebApiClient>().InstancePerApiRequest();

            builder.RegisterType<DocumentListWebApiClient>().As<IDocumentListWebApiClient>().InstancePerApiRequest();
            builder.RegisterType<GeneralSettingsWebApiClient>().As<IGeneralSettingsWebApiClient>().InstancePerApiRequest();


            builder.RegisterType<PropertyTypeWebApiClient>().As<IPropertyTypeWebApiClient>().InstancePerApiRequest();
            builder.RegisterType<DocumentTypeWebApiClient>().As<IDocumentTypeWebApiClient>().InstancePerApiRequest();

            builder.RegisterType<GeneralSettingsWebApiClient>().As<IGeneralSettingsWebApiClient>().InstancePerApiRequest();

            // set up a MemoryCache just for us
            builder.Register(c => new System.Runtime.Caching.MemoryCache("sfcache")).Named<System.Runtime.Caching.ObjectCache>("sfcache").SingleInstance();
            // builder.RegisterType<Mozu.SiteBuilder.UX.Caching.StorefrontCache>()
            //     .WithParameter(
            //         // when parameter is a type of ObjectCache
            //         (p,c) => p.ParameterType.IsSubclassOf(typeof(System.Runtime.Caching.ObjectCache)),
            //         // resolve it using this named service
            //         (p,c) => c.ResolveNamed<System.Runtime.Caching.ObjectCache>("sfcache")
            //     )
            //     .InstancePerApiRequest()
            // ;

            // add these two logging context providers for loggers provided by the DI framework.
            builder.RegisterType<CurrentRequestLoggingContextProvider>().As<ILoggingContextProvider>().InstancePerLifetimeScope();
            builder.RegisterType<ApplicationNameLoggingContextProvider>().As<ILoggingContextProvider>().WithParameter("applicationName", ApplicationConstants.APPLICATION_NAME).InstancePerLifetimeScope();

            builder.RegisterType<VisitEventPublisher>().AsSelf().InstancePerApiRequest();
            builder.RegisterType<CacheItemsInvalidConsumer>().AsSelf();

            // Register a MassTransit/Burrows IPublisher for visits.
            // The rabbitMQ connectionstring is used to recieve control messages sent to our application by MassTransit.
            builder.Register(c => c.Resolve<ISettings>().CreatePublisher("SiteBuilderOutgoingMessageQueue", "Mozu.SiteBuilder.UX")).As<IPublisher>().SingleInstance();

            // Register a MassTransit/Burrows Consumer for cache invalidation.
            //builder
            //    .Register(c => ServiceBusFactory.New(
            //        sbc => c.Resolve<ISettings>()
            //            .ConfigureConsumer("SiteBuilderIncomingMessageQueue", sbc, subs => subs.LoadFrom(c.Resolve<ILifetimeScope>()))
            //            .SetConcurrentConsumerLimit(10)
            //        ))
            //    .SingleInstance()
            //    .AutoActivate();
        }
    }
}
