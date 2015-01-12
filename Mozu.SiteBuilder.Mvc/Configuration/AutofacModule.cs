using System;
using System.Linq;
using System.Reflection;
using Autofac;
using Mozu.Core;
using Mozu.Core.Configuration;
using Mozu.Location.Contracts.Clients;
using Mozu.Reference.Contracts.Clients;
using Mozu.ShippingRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Caching;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models;
using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;

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
             
            builder.RegisterType<MozuVirtualPathProvider>().As<IMozuVirtualPathProvider>().InstancePerRequest();
            
            //contexts
            builder.RegisterType<ClientApiContext>().InstancePerRequest();
            builder.RegisterType<NavigationContext>().InstancePerRequest();
            builder.RegisterType<PageContext>().InstancePerRequest();
            builder.RegisterType<SiteContext>().InstancePerRequest();
            builder.RegisterType<PageContext>().As<IEditableContext>().InstancePerRequest();
            builder.RegisterType<SiteBuilderApiContext>().As<IApiContext>().InstancePerRequest();

            builder.RegisterType<PermissionsRepository>().As<IPermissionsRepository>().InstancePerRequest();
            builder.RegisterType<ReferenceDataWebApiClient>().As<IReferenceDataWebApiClient>().InstancePerRequest();
            
            RegisterThemeInfrastructure(builder);

            builder.RegisterType<CmsHelper>().InstancePerRequest();

            builder.RegisterType<NavigationRepository>().As<INavigationRepository>().InstancePerRequest();

            builder.RegisterType<NavigationGandalfTheWhite>().As<INavigationGandalf>().InstancePerLifetimeScope().InstancePerRequest();

            builder.RegisterType<RuntimeCategoryTreeProvider>().As<ICategoryTreeProvider>().InstancePerRequest();

            builder.RegisterType<CmsServiceWrapper>().As<ICmsServiceWrapper>().InstancePerDependency();
            builder.RegisterType<ThemeEntityDefinitionProvider>().As<IThemeEntityDefinitionProvider>().InstancePerDependency();
            builder.RegisterType<FileSystemContentRetriever>().As<IThemeContentRetriever>();

            builder.RegisterType<ExceptionContextLogWrapper>();

            builder.Register(
                c =>
                    new LiveModeOnlyCache(c.Resolve<IApiContext>(), c.Resolve<PageContext>(), () => GetEnablePartialCache(c.Resolve<SiteContext>()), c.Resolve<IStorefrontCache>()))
                .As<ILiveModeOnlyCache>();
        }

        private static bool GetEnablePartialCache(SiteContext ctx)
        {
            var val = ctx.ThemeSettings["enablePartialCaching"];
            return Convert.ToBoolean(val);
        }

        private static void RegisterThemeInfrastructure(ContainerBuilder builder)
        {
            builder.RegisterType<ThemeMetadataProvider>().As<IThemeMetaDataProvider>().SingleInstance();
            builder.RegisterType<ThemeRepository>().As<IThemeRepository>().SingleInstance();
            builder.RegisterType<HyprViewEngine>().InstancePerRequest();

            var tmp = new TemplateManagerProvider()
                .WithLibrary(typeof (AddFilter).Assembly)
                .WithLibrary(typeof (HyprViewEngine).Assembly)
                .WithLibrary(typeof (AutofacModule).Assembly)
                .WithLoader(new TemplateLoader())
                .WithSetting("settings.DEFAULT_AUTOESCAPE", true);

            var ass = AppDomain.CurrentDomain.GetAssemblies().FirstOrDefault(x => new AssemblyName(x.FullName).Name == "Mozu.SiteBuilder.UX");
            if (ass != null)
            {
                tmp = tmp.WithLibrary(ass);
            }
            
            builder.Register(c => tmp)
                .As<TemplateManagerProvider>()
                .As<ITemplateManagerProvider>()
                .SingleInstance();

            ResolverConfig.Resolver = new CaseInsensitiveMemberResolver();
            EscaperConfig.Escaper = new SafeEscaper();
            Utilities.UtilConfig.Comparer = new DjangoComparer();
            Utilities.UtilConfig.VirtualPathFunc = new DjangoUtilHelper();

            var tm = tmp.GetNewManager();
            
            builder.Register(c => new HyprTemplateManager(tm, c.Resolve<IMozuVirtualPathProvider>()))
                .As<ITemplateManager>()
                .InstancePerLifetimeScope();
        }
    }
}