using System;
using System.Linq;
using System.ServiceModel;
using System.Web.Mvc;
using Autofac;
using Autofac.Integration.Mvc;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Configuration;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Configuration;
using Mozu.SiteBuilder.Mvc.Mobile;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using NDjango;
using NDjango.Interfaces;
using Api = Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.User.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.MockServices;

namespace Mozu.SiteBuilder.UX.Admin.Configuration
{
    public class ConfigurationModule : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            RegisterServiceContracts(builder);
         
            RegisterOtherStuff(builder);
            RegisterServiceClients(builder);
        }

        private void RegisterServiceContracts(ContainerBuilder builder)
        {
            builder.ScanAssemblyAndRegisterTypes(ThisAssembly,
                                                 f => f.GetCustomAttributes(typeof(ServiceContractAttribute), false).Any());
        }
        void RegisterServiceClients(ContainerBuilder builder)
        {
            //var platformService = typeof(PlatformService.Contracts.Clients.ReferenceDataWebApiClient).Assembly;
            //builder.ScanAssemblyAndRegisterTypes(platformService, x => x.IsAssignableFrom(typeof(PlatformService.Contracts.Clients.IReferenceDataWebApiClient)));
            
            
            builder.RegisterType<SiteBuilderContext>().As<ISiteBuilderContext>().InstancePerLifetimeScope();

            builder.RegisterType<SiteBuilderApiContext>().As<IApiContext>().InstancePerLifetimeScope();
            builder.RegisterType<Mozu.SiteBuilder.Mvc.Security.AuthenticationHelper>().InstancePerLifetimeScope();
            builder.RegisterType<ServiceClientMessageHandler>().As<IServiceClientMessageHandler>().InstancePerDependency();
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.ProductAdmin.Contracts.Category  ).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteBuilder.Mvc.CatalogContext).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.AdminUser.Contracts.Clients.RoleWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.Content.Contracts.Clients.DocumentListWebApiClient  ).Assembly);

            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.ProductAdmin.Contracts.Clients.ShippingClassWebApiClient).Assembly);
            //builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.ProductAdmin.Contracts.Clients.ShippingRateWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteSettings.Shipping.Contracts.Clients.ShippingSettingsWebApiClient ).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.ShippingRuntime.Contracts.Clients.ShippingWebApiClient).Assembly);
            //builder.RegisterClassesMatchingInterfaceName(typeof(PlatformService.Contracts.Clients.ReferenceDataWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteSettings.Shipping.Contracts.Clients.ShippingSettingsWebApiClient ).Assembly);

            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteSettings.Order.Contracts.Clients.CheckoutSettingsWebApiClient).Assembly);

            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteSettings.General.Contracts.Clients.GeneralSettingsWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.Customer.Contracts.Clients.CustomerAccountWebApiClient).Assembly);

            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.AdminUser.Contracts.Clients.BehaviorWebApiClient).Assembly);

            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.Order.Contracts.Clients.OrderWebApiClient).Assembly);

            builder.RegisterClassesMatchingInterfaceName(typeof(Mvc.CookieProvider).Assembly);
            builder.RegisterInstance<System.Runtime.Caching.ObjectCache>(System.Runtime.Caching.MemoryCache.Default);
            builder.RegisterType<SiteBuilderContext>().As<ISiteBuilderContext>().InstancePerLifetimeScope();
            //builder.RegisterModule(new AutofacWebTypesModule());
            builder.Register<System.Web.HttpContextBase>((c, p) => new System.Web.HttpContextWrapper(System.Web.HttpContext.Current)).InstancePerDependency();

            builder.RegisterType<ServiceClientMessageHandler>().As<IServiceClientMessageHandler>();


           


            builder.RegisterType<NoOpMobileDetectionProvider>().As<IMobileDetectionProvider>().InstancePerLifetimeScope();

            builder.RegisterType<RoleWebApiClient>().As<IRoleWebApiClient>();
            builder.RegisterType<BehaviorWebApiClient>().As<IBehaviorWebApiClient>();
            // builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.ProductRuntime.Contracts.Clients.ProductRuntimeWebApiClient).Assembly);
            builder.Register(c => new ProductRuntimeWebApiClient(c.Resolve<IServiceClientMessageHandler>())).As<IProductRuntimeWebApiClient>().InstancePerLifetimeScope();
            builder.Register(c => new ProductSearchWebApiClient(c.Resolve<IServiceClientMessageHandler>())).As<IProductSearchWebApiClient>().InstancePerLifetimeScope();

            builder.RegisterType<DjangoMozuViewEngine>().As<DjangoMozuViewEngine>();
            builder.RegisterType<System.Web.Mvc.RazorViewEngine>().As<IViewEngine>();
        }




        



        private void RegisterOtherStuff(ContainerBuilder builder)
        {
            //Registers controllers and allows property injection into action filters
            builder.RegisterControllers(ThisAssembly);

            //Registers all IModelBinder implementations with MVC
            builder.RegisterModelBinders(ThisAssembly);
        }
    }
}