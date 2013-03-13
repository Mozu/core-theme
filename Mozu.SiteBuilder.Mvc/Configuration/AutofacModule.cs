using System;
using System.Web.Mvc;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.Reference.Contracts.Clients;
using Mozu.ShippingRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Themes.Factories;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteSettings.Shipping.Contracts.Clients;
using Mozu.UspsShippingAdmin.Contracts.Clients;
using NDjango;
using NDjango.Interfaces;

namespace Mozu.SiteBuilder.Mvc.Configuration
{
    using Autofac;
    using Mozu.Core.Logging;
    using Mozu.SiteBuilder.Mvc;
    using Mozu.SiteBuilder.Mvc.Logging;
    using Mozu.SiteBuilder.Mvc.Models.CMS;
    using Mozu.SiteBuilder.Mvc.Security;
    using Mozu.SiteBuilder.Mvc.Themes.Providers;
    using Mozu.SiteBuilder.Mvc.Themes.Repositories;
    using Mozu.SiteBuilder.Mvc.ViewEngine;
    using Module = Autofac.Module;
   
    public class AutofacModule : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            

            builder.RegisterType<MozuVirtualPathProvider>();
            builder.RegisterType<WidgetProvider>().As<IWidgetProvider>();
            builder.RegisterType<Document>();
           // builder.RegisterType<WidgetInstanceData >();
            builder.RegisterType<CmsProperty>();
            builder.RegisterType<Blog >();
            builder.RegisterType<Post >();
            builder.RegisterType<AuthenticationHelper>().InstancePerLifetimeScope();
            builder.RegisterType<CatalogContext>().As<ICatalogContext>().InstancePerLifetimeScope();

            builder.RegisterType<ThemeMetadataProvider>().As<IThemeMetaDataProvider>().InstancePerLifetimeScope();
            builder.RegisterType<ThemeRepository>().As<IThemeRepository>().InstancePerLifetimeScope();

            builder.RegisterType<RoleWebApiClient>().As<IRoleWebApiClient>();
            builder.RegisterType<BehaviorWebApiClient>().As<IBehaviorWebApiClient>();
            builder.RegisterType<PermissionsRepository>().As<IPermissionsRepository>();

            builder.RegisterType<ReferenceDataWebApiClient>().As<IReferenceDataWebApiClient>();

            builder.RegisterType<RoutableShippingWebApiClient>().As<IShippingWebApiClient>();
            builder.RegisterType<ShippingClassWebApiClient>().As<IShippingClassWebApiClient>();
           // builder.RegisterType<ShippingRateWebApiClient>().As<IShippingRateWebApiClient>();
            builder.RegisterType<ShippingSettingsWebApiClient>().As<IShippingSettingsWebApiClient>();
            builder.RegisterType<UspsShippingSharedWebApiClient>().As<IUspsShippingSharedWebApiClient>();
            builder.RegisterType<UspsShippingInstanceWebApiClient>().As<IUspsShippingInstanceWebApiClient>();
            builder.RegisterType<SiteBuilderApiContext>().As<IApiContext>();

            builder.RegisterType<NullLoggingService>().As<ILoggingService>();

            builder.Register(c => new TemplateManagerProvider()
                          .WithLibrary(typeof(NDjango.FiltersCS.AddFilter).Assembly)
                          .WithLibrary(typeof(DjangoMozuViewEngine).Assembly)
                          .WithLibrary(typeof(AutofacModule).Assembly)
                          .WithSetting("settings.DEFAULT_AUTOESCAPE", false)
                          .WithLoader(c.Resolve<ITemplateLoader>())).As<TemplateManagerProvider>().SingleInstance();


            builder.Register(c => c.Resolve<TemplateManagerProvider>().GetNewManager()).As<ITemplateManager>();

            builder.RegisterType<ThemeFactory>().InstancePerLifetimeScope();


            // builder.RegisterType<DjangoMozuViewEngine>().As<DjangoMozuViewEngine>().As<IViewEngine>().InstancePerLifetimeScope();

        }
    }
}
