using System;
using System.Linq;
using System.Reflection;
using Autofac;
using Autofac.Integration.WebApi;
using Mozu.Core;
using Mozu.Core.Configuration;
using Mozu.Location.Contracts.Clients;
using Mozu.Reference.Contracts.Clients;
using Mozu.ShippingRuntime.Contracts.Clients;
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

using NDjango;
using NDjango.FiltersCS;
using NDjango.Interfaces;
using Module = Autofac.Module;
using Mozu.SiteBuilder.Mvc.Logging;

namespace Mozu.SiteBuilder.Mvc.Configuration
{
    public class AutofacModule : Module
    {
        protected override void Load(ContainerBuilder builder)
        {


            builder.RegisterClassesMatchingInterfaceName(typeof(IShippingWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(ILocationRuntimeWebApiClient).Assembly);
             
            builder.RegisterType<MozuVirtualPathProvider>().InstancePerRequest();
            //   builder.RegisterType<WidgetProvider>().As<IWidgetProvider>();
            //builder.RegisterType<Document>();
            //// builder.RegisterType<WidgetInstanceData >();
            //builder.RegisterType<CmsProperty>();
            //builder.RegisterType<Blog>();
            //builder.RegisterType<Post>();


            builder.RegisterType<Mozu.SiteBuilder.Mvc.Contexts.ClientApiContext>().InstancePerRequest();
            builder.RegisterType<Mozu.SiteBuilder.Mvc.Contexts.NavigationContext>().InstancePerRequest();
            builder.RegisterType<Mozu.SiteBuilder.Mvc.Contexts.PageContext>().InstancePerRequest();
            builder.RegisterType<Mozu.SiteBuilder.Mvc.Contexts.SiteContext>().InstancePerRequest();
            builder.RegisterType<Mozu.SiteBuilder.Mvc.Contexts.PageContext>().As<IEditableContext>().InstancePerRequest();
        
            // builder.RegisterType<AuthenticationHelper>().InstancePerLifetimeScope();
            

            builder.RegisterType<ThemeMetadataProvider>().As<IThemeMetaDataProvider>().SingleInstance();
            builder.RegisterType<ThemeRepository>().As<IThemeRepository>().SingleInstance();
            builder.RegisterType<ThemeFactory>().SingleInstance();



            builder.RegisterType<HyprViewEngine>().InstancePerRequest();

            //  builder.RegisterType<RoleWebApiClient>().As<IMultiScopeRoleWebApiClient>();
            //   builder.RegisterType<BehaviorWebApiClient>().As<IBehaviorWebApiClient>();
            builder.RegisterType<PermissionsRepository>().As<IPermissionsRepository>().InstancePerRequest();

            builder.RegisterType<ReferenceDataWebApiClient>().As<IReferenceDataWebApiClient>().InstancePerRequest();

            //     builder.RegisterType<RoutableShippingWebApiClient>().As<IShippingWebApiClient>();

            // builder.RegisterType<ShippingRateWebApiClient>().As<IShippingRateWebApiClient>();
            builder.RegisterType<ShippingSettingsWebApiClient>().As<IShippingSettingsWebApiClient>().InstancePerRequest();

            builder.RegisterType<SiteBuilderApiContext>().As<IApiContext>().InstancePerRequest();





            TemplateManagerProvider tmp = new TemplateManagerProvider()
                .WithLibrary(typeof (AddFilter).Assembly)
                .WithLibrary(typeof (HyprViewEngine).Assembly)
                .WithLibrary(typeof (AutofacModule).Assembly)
                .WithLoader(new TemplateLoader())
                
                .WithSetting("settings.DEFAULT_AUTOESCAPE", true);


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
            NDjango.Interfaces.EscaperConfig.Escaper = new SafeEscaper();
            ITemplateManager tm = tmp.GetNewManager();

            builder.Register(c => new HyprTemplateManager(tm, c.Resolve<MozuVirtualPathProvider>())).As<ITemplateManager>().InstancePerLifetimeScope();



            builder.RegisterType<CmsHelper>().InstancePerRequest();

            builder.RegisterType<NavigationRepository>().As<INavigationRepository>().InstancePerRequest();

            builder.RegisterType<NavigationGandalfTheWhite>().As<INavigationGandalf>().InstancePerLifetimeScope().InstancePerRequest();

            builder.RegisterType<RuntimeCategoryTreeProvider>().As<ICategoryTreeProvider>().InstancePerRequest();

            builder.RegisterType<CmsServiceWrapper2>().As<ICmsServiceWrapper>().InstancePerDependency();
            builder.RegisterType<CmsTypeHelper>().As<ICmsTypeHelper>().InstancePerDependency();
            builder.RegisterType<ThemeEntityDefinitionProvider>().As<IThemeEntityDefinitionProvider>().InstancePerDependency();

            builder.RegisterType<ExceptionContextLogWrapper>();

            //builder.Register(c => System.Runtime.Caching.MemoryCache.Default).As<System.Runtime.Caching.ObjectCache>();
        }
    }
}