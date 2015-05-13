using System.Linq;
using System.ServiceModel;
using System.Web.Http;
using Autofac;
using Autofac.Integration.WebApi;
using Burrows.Publishing;
using Mozu.Core;
using Mozu.Core.Api;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.ErrorHandler;
using Mozu.Core.Api.Handlers.Message;
using Mozu.Core.Behaviors;
using Mozu.Core.Configuration;
using Mozu.Core.Logging;
using Mozu.Core.Messaging.Publish;
using Mozu.Core.Settings;
using Mozu.MZDB.Contracts.Clients;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Logging;
using Mozu.SiteBuilder.Mvc.Mobile;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.InstalledApplications.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.ErrorHandlers;

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
            //var platformService = typeof(PlatformService.Contracts.Clients.ReferenceDataWebApiClient).Assembly;
            //builder.ScanAssemblyAndRegisterTypes(platformService, x => x.IsAssignableFrom(typeof(PlatformService.Contracts.Clients.IReferenceDataWebApiClient)));
            
            builder.RegisterHttpRequestMessage(GlobalConfiguration.Configuration);
            
            builder.RegisterType<SiteBuilderApiContext>().As<IApiContext>().As<ISiteBuilderApiContext>().InstancePerLifetimeScope()
                .WithProperty("CmsDraftState", "latest");
          //  builder.RegisterType<Mozu.SiteBuilder.Mvc.Security.AuthenticationHelper>().InstancePerLifetimeScope();
            builder.RegisterType<ServiceClientMessageHandler>().As<IServiceClientMessageHandler>().InstancePerDependency();
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.ProductAdmin.Contracts.Category  ).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteBuilder.Mvc.ISiteBuilderApiContext ).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.AdminUser.Contracts.Clients.IMultiScopeInvitationWebApiClient ).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.Content.Contracts.Clients.DocumentListWebApiClient  ).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.ShippingAdmin.Contracts.CarrierConfiguration).Assembly);

            builder.RegisterClassesMatchingInterfaceName(typeof(IApplicationsWebApiClient).Assembly);
            //builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.ProductAdmin.Contracts.Clients.ShippingRateWebApiClient).Assembly);
          //  builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteSettings.Shipping.Contracts.Clients.ShippingSettingsWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.ShippingRuntime.Contracts.Clients.ShippingWebApiClient).Assembly);
            //builder.RegisterClassesMatchingInterfaceName(typeof(PlatformService.Contracts.Clients.ReferenceDataWebApiClient).Assembly);
         //   builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteSettings.Shipping.Contracts.Clients.ShippingSettingsWebApiClient ).Assembly);


            builder.RegisterClassesMatchingInterfaceName(typeof (IEntityListsWebApiClient).Assembly);

            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteSettings.Order.Contracts.Clients.CheckoutSettingsWebApiClient).Assembly);
            

            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteSettings.General.Contracts.Clients.GeneralSettingsWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.Customer.Contracts.Clients.CustomerAccountWebApiClient).Assembly);

            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.Location.Contracts.Clients.ILocationAdminWebApiClient).Assembly);

            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.CommerceRuntime.Contracts.Products.Product ).Assembly);

            builder.RegisterClassesMatchingInterfaceName(typeof(Mvc.CookieProvider).Assembly);
            builder.RegisterInstance<System.Runtime.Caching.ObjectCache>(System.Runtime.Caching.MemoryCache.Default);
            
            //builder.RegisterModule(new AutofacWebTypesModule());
           // builder.Register<System.Web.HttpContextBase>((c, p) => new System.Web.HttpContextWrapper(System.Web.HttpContext.Current)).InstancePerDependency();

            builder.RegisterType<ServiceClientMessageHandler>().As<IServiceClientMessageHandler>();

            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.Provisioning.Contracts.Clients.IProvisioningWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof (Mozu.AppDev.Contracts.Clients.IAppsWebApiClient).Assembly);


            builder.RegisterType<NoOpMobileDetectionProvider>().As<IMobileDetectionProvider>().InstancePerLifetimeScope();

           // builder.RegisterType<RoleWebApiClient>().As<IMultiScopeRoleWebApiClient>();
        
            // builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.ProductRuntime.Contracts.Clients.ProductRuntimeWebApiClient).Assembly);
            builder.Register(c => new ProductRuntimeWebApiClient(c.Resolve<IServiceClientMessageHandler>())).As<IProductRuntimeWebApiClient>().InstancePerLifetimeScope();
            builder.Register(c => new ProductSearchWebApiClient(c.Resolve<IServiceClientMessageHandler>())).As<IProductSearchWebApiClient>().InstancePerLifetimeScope();

            

            builder.RegisterType<ApplicationNameLoggingContextProvider>().As<ILoggingContextProvider>().WithParameter("applicationName", ApplicationConstants.APPLICATION_NAME).InstancePerLifetimeScope();

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


            builder.Register(c => c.Resolve<ISettings>().CreatePublisher("SiteBuilderOutgoingMessageQueue", "Mozu.SiteBuilder.UX.Admin"))
                .As<IPublisher>().SingleInstance();
        }
    }
}