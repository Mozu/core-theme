using Autofac;
using Mozu.Core;
using Mozu.Core.Configuration;
using Mozu.Core.Expressions;
using Mozu.Core.Settings;
using Mozu.Location.Contracts.Clients;
using Mozu.Reference.Contracts.Clients;
using Mozu.ShippingRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Caching;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Context;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Helpers;
using Mozu.SiteBuilder.Mvc.Logging;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;
using NDjango;
using NDjango.FiltersCS;
using NDjango.Interfaces;
using System;
using System.Linq;
using System.Reflection;
using Module = Autofac.Module;

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
            builder.RegisterType<UrlHelper>().InstancePerRequest();


            builder.RegisterType<PageContext>().As<PageContext>().As<IPageContext>().InstancePerRequest();
            builder.RegisterType<SiteContext>().As<SiteContext>().As<ISiteContext>().InstancePerRequest();
            
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
            builder.RegisterType<ContentRetriever>().As<IThemeContentRetriever>().SingleInstance();

            builder.RegisterType<ExceptionContextLogWrapper>();
            builder.RegisterType<LiveModeOnlyCacheInternal>().As<ILiveModeOnlyCache>().InstancePerRequest();
            builder.RegisterType<DataViewModeFinderOuter>().AsImplementedInterfaces().InstancePerRequest();
            builder.RegisterType<EditModeFinderOuter>().AsImplementedInterfaces().InstancePerRequest();         
            builder.RegisterTypes(typeof(SEO.Constraints.ConstraintFactory), typeof(SEO.Mappings.RouteMappingFactory)).AsImplementedInterfaces().AsSelf().InstancePerRequest();
            builder.RegisterType<SEO.CustomRouteValidator>().AsImplementedInterfaces().AsSelf();
            builder.RegisterType<SEO.CustomRouteRepository>().AsImplementedInterfaces().AsSelf();

            builder.RegisterType<StorefrontCacheControlImpl>().As<IStorefrontCacheControl>().SingleInstance();

            builder.RegisterType<StorefrontCache>().As<IStorefrontCache>().InstancePerRequest();
            builder.RegisterType<ThemeCache>().As<IThemeCache>().SingleInstance();
            builder.RegisterType<SitebuilderContextCacheRepository>().As<ISitebuilderContextCacheRepository>().SingleInstance();

            builder.RegisterType<StorageGatewayConnectionWarmer>().As<INfsConnectionWarmer>().SingleInstance();

            //Rule based page stuff
            //static property provider
            builder.RegisterType<StaticMetadataProvider<CmsPageRuleContext>>().AsSelf().SingleInstance();

            //dynamic property provider
            builder.RegisterType<CmsPageRuleDynamicMetadataProvider>()  //todo: update when we add customer attributes
                .As<IDynamicContextPropertyMetadataProvider<CmsPageRuleContext>>()
                .InstancePerLifetimeScope();

            //metadata provider facade
            builder.RegisterType<ExpressionContextMetadataProvider<CmsPageRuleContext>>()
                .As<IExpressionContextMetadataProvider<CmsPageRuleContext>>()
                .InstancePerLifetimeScope();

            builder.RegisterType<CmsPageRuleContextFactory>()
                .As<IExpressionContextFactory<CmsPageRuleContext>>()
                .InstancePerLifetimeScope();

            //expression evaluator visitor
            builder.RegisterType<ExpressionEvaluatorVisitor<CmsPageRuleContext>>()
                .AsSelf()
                .AsImplementedInterfaces()
                .InstancePerLifetimeScope();

            //evaluator
            builder.RegisterType<CmsPageRelationalExpressionEvaluator>()
                .As<IRelationalExpressionEvaluator<CmsPageRuleContext>>()
                .InstancePerLifetimeScope();
            
            //expression validator visitor
            builder.RegisterType<CmsPageRuleExpressionValidator>()
                .AsSelf()
                .AsImplementedInterfaces()
                .InstancePerLifetimeScope();

            builder.RegisterType<CmsPageRuleRelationalExpressionValidator>().AsSelf()
                .InstancePerLifetimeScope();
        }

        private static void RegisterThemeInfrastructure(ContainerBuilder builder)
        {
            builder.RegisterType<ThemeMetadataProvider>().As<IThemeMetaDataProvider>().SingleInstance();
            builder.RegisterType<ThemeRepository>().As<IThemeRepository>().SingleInstance();
            builder.RegisterType<HyprViewEngine>().InstancePerRequest();

         

            builder.Register(c =>
            {
            var tmp = new TemplateManagerProvider()
                    .WithLibrary(typeof(AddFilter).Assembly)
                    .WithLibrary(typeof(HyprViewEngine).Assembly)
                    .WithLibrary(typeof(AutofacModule).Assembly)
                    .WithLoader(new TemplateLoader(c.Resolve<Lazy<IThemeRepository>>(),
                    c.Resolve < Lazy<ISettings>>(),
                    c.Resolve<Lazy<IThemeContentRetriever>>()
                   ))
                .WithSetting("settings.DEFAULT_AUTOESCAPE", true);

            var ass = AppDomain.CurrentDomain.GetAssemblies().FirstOrDefault(x => new AssemblyName(x.FullName).Name == "Mozu.SiteBuilder.UX");
            if (ass != null)
            {
                tmp = tmp.WithLibrary(ass);
            }
            
                return tmp;
            })
                .As<TemplateManagerProvider>()
                .As<ITemplateManagerProvider>()
                .SingleInstance();

            ResolverConfig.Resolver = new JsonCleaningCaseInsensitiveMemberResolver();
            EscaperConfig.Escaper = new SafeEscaper();
            Utilities.UtilConfig.Comparer = new DjangoComparer();
            Utilities.UtilConfig.VirtualPathFunc = new DjangoUtilHelper();
       
           // var tm = tmp.GetNewManager();

            builder.Register(c => {
                var tm = c.Resolve<TemplateManagerProvider>().GetNewManager();
                return new HyprTemplateManager(tm, c.Resolve<IMozuVirtualPathProvider>());
            })
                .As<ITemplateManager>()
                .InstancePerLifetimeScope();
        }
    }
}