using System;
using System.Linq;
using System.Reflection;
using Autofac;
using Mozu.Core;
using Mozu.Reference.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.Mvc.Themes.Factories;
using Mozu.SiteBuilder.Mvc.Themes.Providers;
using Mozu.SiteBuilder.Mvc.Themes.Repositories;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteSettings.Shipping.Contracts.Clients;
using Mozu.UspsShippingAdmin.Contracts.Clients;
using NDjango;
using NDjango.FiltersCS;
using NDjango.Interfaces;
using Module = Autofac.Module;

namespace Mozu.SiteBuilder.Mvc.Configuration
{
    public class AutofacModule : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            builder.RegisterType<MozuVirtualPathProvider>().InstancePerLifetimeScope();
            //   builder.RegisterType<WidgetProvider>().As<IWidgetProvider>();
            builder.RegisterType<Document>();
            // builder.RegisterType<WidgetInstanceData >();
            builder.RegisterType<CmsProperty>();
            builder.RegisterType<Blog>();
            builder.RegisterType<Post>();
            // builder.RegisterType<AuthenticationHelper>().InstancePerLifetimeScope();
            builder.RegisterType<CatalogContext>().As<ICatalogContext>().InstancePerLifetimeScope();

            builder.RegisterType<ThemeMetadataProvider>().As<IThemeMetaDataProvider>().InstancePerLifetimeScope();
            builder.RegisterType<ThemeRepository>().As<IThemeRepository>().InstancePerLifetimeScope();

            builder.RegisterType<HyprViewEngine>().InstancePerLifetimeScope();

            //  builder.RegisterType<RoleWebApiClient>().As<IMultiScopeRoleWebApiClient>();
            //   builder.RegisterType<BehaviorWebApiClient>().As<IBehaviorWebApiClient>();
            builder.RegisterType<PermissionsRepository>().As<IPermissionsRepository>();

            builder.RegisterType<ReferenceDataWebApiClient>().As<IReferenceDataWebApiClient>();

            //     builder.RegisterType<RoutableShippingWebApiClient>().As<IShippingWebApiClient>();

            // builder.RegisterType<ShippingRateWebApiClient>().As<IShippingRateWebApiClient>();
            builder.RegisterType<ShippingSettingsWebApiClient>().As<IShippingSettingsWebApiClient>();
            builder.RegisterType<UspsShippingSharedWebApiClient>().As<IUspsShippingSharedWebApiClient>();
            builder.RegisterType<UspsShippingInstanceWebApiClient>().As<IUspsShippingInstanceWebApiClient>();
            builder.RegisterType<SiteBuilderApiContext>().As<IApiContext>();


            TemplateManagerProvider tmp = new TemplateManagerProvider()
                .WithLibrary(typeof (AddFilter).Assembly)
                .WithLibrary(typeof (HyprViewEngine).Assembly)
                .WithLibrary(typeof (AutofacModule).Assembly)
                .WithLoader(new TemplateLoader())
                
                .WithSetting("settings.DEFAULT_AUTOESCAPE", false);


            Assembly ass = AppDomain.CurrentDomain.GetAssemblies().FirstOrDefault(x => new AssemblyName(x.FullName).Name == "Mozu.SiteBuilder.UX");
            if (ass != null)
            {
                tmp = tmp.WithLibrary(ass);
            }


            builder.Register(c => tmp)
                   .As<TemplateManagerProvider>()
                   .As<ITemplateManagerProvider>()
                   .SingleInstance();

            NDjango.Interfaces.ResolverConfig.Resolver = new CaseInsensitiveMemberResolver();
            ITemplateManager tm = tmp.GetNewManager();

            builder.Register(c => new HyprTemplateManager(tm, c.Resolve<MozuVirtualPathProvider>())).As<ITemplateManager>().InstancePerLifetimeScope();


            builder.RegisterType<ThemeFactory>().InstancePerLifetimeScope();


            builder.RegisterType<NavigationRepository>().As<INavigationRepository>();

            builder.RegisterType<NavigationGandalf>().InstancePerLifetimeScope();

            builder.RegisterType<RuntimeCategoryTreeProvider>().As<ICategoryTreeProvider>();
        }
    }
}