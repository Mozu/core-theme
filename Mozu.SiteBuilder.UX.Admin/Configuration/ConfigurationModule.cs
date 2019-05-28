using System.Linq;
using System.ServiceModel;
using System.Web.Http;
using Autofac;
using Autofac.Integration.WebApi;
using Burrows.Publishing;
using Mozu.Core;
using Mozu.Core.Api.ErrorHandler;
using Mozu.Core.Configuration;
using Mozu.Core.Logging;
using Mozu.Core.Messaging.Publish;
using Mozu.Core.Settings;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Logging;
using Mozu.SiteBuilder.Mvc.Mobile;
using Mozu.SiteBuilder.Mvc.Caching;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.SiteBuilder.UX.Admin.Api.ErrorHandlers;
using Mozu.SiteBuilder.UX.Admin.Helpers.SearchTuningHelpers;
using System;
using Burrows.Configuration;
using Mozu.SiteBuilder.UX.Admin.Misc;
using Autofac.Core;
using Autofac.Core.Lifetime;
using Autofac.Core.Resolving;
using System.Collections.Generic;

namespace Mozu.SiteBuilder.UX.Admin.Configuration
{
    public class ConfigurationModule : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            RegisterServiceContracts(builder);


            RegisterServiceClients(builder);
        }

        private void RegisterServiceContracts(ContainerBuilder builder)
        {
            builder.ScanAssemblyAndRegisterTypes(ThisAssembly,
                f => f.GetCustomAttributes(typeof(ServiceContractAttribute), false).Any());
        }

        void RegisterServiceClients(ContainerBuilder builder)
        {
            builder.RegisterHttpRequestMessage(GlobalConfiguration.Configuration);

            builder.RegisterType<SiteBuilderApiContext>().As<IApiContext>().As<ISiteBuilderApiContext>()
                .InstancePerLifetimeScope()
                .WithProperty("CmsDraftState", "latest");

            builder.RegisterType<NavigationController.AdminRouteConfig>().As<IRouteConfig>().SingleInstance();

            builder.RegisterInstance<System.Runtime.Caching.ObjectCache>(System.Runtime.Caching.MemoryCache.Default);

            builder.RegisterType<NoOpMobileDetectionProvider>().As<IMobileDetectionProvider>()
                .InstancePerLifetimeScope();

            builder.RegisterType<ApplicationNameLoggingContextProvider>().As<ILoggingContextProvider>()
                .WithParameter("applicationName", ApplicationConstants.APPLICATION_NAME).InstancePerLifetimeScope();

            //todo: remove once core updated.
            //remove web.config setting.
            builder.RegisterType<FriendlyExceptionResponseBuilderCollection>()
                .As<IExceptionResponseBuilderCollection>()
                .WithParameter("settings", MozuConfigurationManager.Settings)
                .SingleInstance();

            builder.RegisterType<ProductCategoryRuntimeWebApiClient>();
            builder.Register(c =>
            {
                var pcrc = c.Resolve<ProductCategoryRuntimeWebApiClient>();
                pcrc.Options.EnableDirtyCacheRead = false;
                return pcrc;
            }).As<IProductCategoryRuntimeWebApiClient>();

            builder.Register(c =>
                    c.Resolve<ISettings>()
                        .CreatePublisher("SiteBuilderOutgoingMessageQueue", "Mozu.SiteBuilder.UX.Admin"))
                .As<IPublisher>().SingleInstance();

            builder.RegisterType<SearchTuningRuleFilterBuilder>().As<ISearchTuningRuleFilterBuilder>().SingleInstance();

            builder.RegisterType<AdminStorefrontCache>().As<IStorefrontCache>();
            builder.RegisterInstance(AdminCache.Instace).SingleInstance();

            builder
                .Register(c =>
                {
                    var format = c.Resolve<ISettings>()
                        .ConnectionStrings("SiteBuilderIncomingMessageQueueFormatString");
                    var conString = string.Format(format.Value, Guid.NewGuid().ToString("N"));
                    var cacheInvalidator = new AdminCacheItemsInvalidConsumer();
                    var lifeTimeScope = c.Resolve<ILifetimeScope>();
                    var burrowsScope = new BurrowsConumerScope()
                    {
                        Thing = cacheInvalidator,
                        ComponentRegistry = lifeTimeScope.ComponentRegistry
                    };

                    var factory = ServiceBusFactory.New(sbc =>
                        sbc
                            .Configure(conString,
                                subs => subs.Consumer<AdminCacheItemsInvalidConsumer>(() => cacheInvalidator))
                            .SetConcurrentConsumerLimit(2)
                    );
                    return factory;
                })
                .AutoActivate();
        }

        class BurrowsConumerScope : ILifetimeScope, IDisposer
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
                get { return this; }
            }

            public object Tag { get; set; }
            public event EventHandler<LifetimeScopeBeginningEventArgs> ChildLifetimeScopeBeginning;
            public event EventHandler<LifetimeScopeEndingEventArgs> CurrentScopeEnding;
            public event EventHandler<ResolveOperationBeginningEventArgs> ResolveOperationBeginning;
        }
    }
}