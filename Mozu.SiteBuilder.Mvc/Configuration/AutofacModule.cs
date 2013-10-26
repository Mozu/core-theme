using System;
using System.Linq;
using System.Reflection;
using Autofac;
using Autofac.Integration.WebApi;
using Mozu.Core;
using Mozu.Reference.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.Mvc.Themes.Factories;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models;
using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;
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
            builder.RegisterType<MozuVirtualPathProvider>().InstancePerApiRequest();
            //   builder.RegisterType<WidgetProvider>().As<IWidgetProvider>();
            builder.RegisterType<Document>();
            // builder.RegisterType<WidgetInstanceData >();
            builder.RegisterType<CmsProperty>();
            builder.RegisterType<Blog>();
            builder.RegisterType<Post>();


            builder.RegisterType<Mozu.SiteBuilder.Mvc.Contexts.ClientApiContext>().InstancePerApiRequest();
            builder.RegisterType<Mozu.SiteBuilder.Mvc.Contexts.NavigationContext>().InstancePerApiRequest();
            builder.RegisterType<Mozu.SiteBuilder.Mvc.Contexts.PageContext>().InstancePerApiRequest();
            builder.RegisterType<Mozu.SiteBuilder.Mvc.Contexts.SiteContext>().InstancePerApiRequest();
            builder.RegisterType<Mozu.SiteBuilder.Mvc.Contexts.PageContext>().As<IEditableContext>().InstancePerApiRequest();


            // builder.RegisterType<AuthenticationHelper>().InstancePerLifetimeScope();
            builder.RegisterType<CatalogContext>().As<ICatalogContext>().InstancePerApiRequest();

            builder.RegisterType<ThemeMetadataProvider>().As<IThemeMetaDataProvider>().SingleInstance();
            builder.RegisterType<ThemeRepository>().As<IThemeRepository>().SingleInstance();
            builder.RegisterType<ThemeFactory>().SingleInstance();



            builder.RegisterType<HyprViewEngine>().InstancePerApiRequest();

            //  builder.RegisterType<RoleWebApiClient>().As<IMultiScopeRoleWebApiClient>();
            //   builder.RegisterType<BehaviorWebApiClient>().As<IBehaviorWebApiClient>();
            builder.RegisterType<PermissionsRepository>().As<IPermissionsRepository>().InstancePerApiRequest();

            builder.RegisterType<ReferenceDataWebApiClient>().As<IReferenceDataWebApiClient>().InstancePerApiRequest();

            //     builder.RegisterType<RoutableShippingWebApiClient>().As<IShippingWebApiClient>();

            // builder.RegisterType<ShippingRateWebApiClient>().As<IShippingRateWebApiClient>();
            builder.RegisterType<ShippingSettingsWebApiClient>().As<IShippingSettingsWebApiClient>().InstancePerApiRequest();
            builder.RegisterType<UspsShippingSharedWebApiClient>().As<IUspsShippingSharedWebApiClient>().InstancePerApiRequest();
            builder.RegisterType<UspsShippingInstanceWebApiClient>().As<IUspsShippingInstanceWebApiClient>().InstancePerApiRequest();
            builder.RegisterType<SiteBuilderApiContext>().As<IApiContext>().InstancePerApiRequest();


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


            


            builder.RegisterType<NavigationRepository>().As<INavigationRepository>().InstancePerApiRequest();

            builder.RegisterType<NavigationGandalf>().InstancePerLifetimeScope().InstancePerApiRequest();

            builder.RegisterType<RuntimeCategoryTreeProvider>().As<ICategoryTreeProvider>().InstancePerApiRequest();

            builder.RegisterType<CmsServiceWrapper2>().As<ICmsServiceWrapper>().InstancePerDependency();
            builder.RegisterType<CmsTypeHelper>().As<ICmsTypeHelper>().InstancePerDependency();
            builder.RegisterType<ThemeEntityDefinitionProvider>().As<IThemeEntityDefinitionProvider>().InstancePerDependency();

        }
    }
}