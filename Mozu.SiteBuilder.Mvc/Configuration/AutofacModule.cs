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
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Mozu.Core.Api.Health;
using Mozu.Core.Exceptions;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.SEO.Constraints;
using Mozu.SiteBuilder.Mvc.SEO.Mappings;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.Mvc.OAF;

namespace Mozu.SiteBuilder.Mvc.Configuration
{
    public class AutofacModule : IDependencyConfigurator
    {
        void IDependencyConfigurator.Configure(IServiceCollection builder)
        {
            builder.RegisterClassesMatchingInterfaceName(typeof(IShippingWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(ILocationRuntimeWebApiClient).Assembly);

            builder.AddScoped<IMozuVirtualPathProvider, MozuVirtualPathProvider>();
            
            //contexts
            builder.AddScoped<ClientApiContext>();
            builder.AddScoped<NavigationContext>();
            builder.AddScoped<UrlHelper>();


            builder.AddScoped<PageContext>();
            builder.AddScoped<IPageContext>(cfg => cfg.GetService<PageContext>());
            builder.AddScoped<SiteContext>();
            builder.AddScoped<ISiteContext>(cfg => cfg.GetService<SiteContext>());

            builder.AddScoped<IEditableContext, PageContext>();
            builder.AddScoped<IApiContext, SiteBuilderApiContext>();

            builder.AddScoped<IPermissionsRepository, PermissionsRepository>();
            builder.AddScoped<IReferenceDataWebApiClient, ReferenceDataWebApiClient>();
            
            RegisterThemeInfrastructure(builder);

            builder.AddScoped<CmsHelper>();

            builder.AddScoped<INavigationRepository, NavigationRepository>();

            builder.AddScoped<INavigationGandalf, NavigationGandalfTheWhite>();

            builder.AddScoped<ICategoryTreeProvider, RuntimeCategoryTreeProvider>();

            builder.AddTransient<ICmsServiceWrapper, CmsServiceWrapper>();
            builder.AddTransient<IThemeEntityDefinitionProvider, ThemeEntityDefinitionProvider>();
            builder.AddSingleton<IThemeContentRetriever, ContentRetriever>();

            builder.AddScoped<ExceptionContextLogWrapper>();
            builder.AddScoped<ILiveModeOnlyCache, LiveModeOnlyCacheInternal>();
            builder.RegisterAllImplementedInterfaces<DataViewModeFinderOuter>(ServiceLifetime.Scoped);
            builder.RegisterAllImplementedInterfaces<EditModeFinderOuter>(ServiceLifetime.Scoped);
            builder.AddScoped(typeof(ConstraintFactory), typeof(RouteMappingFactory));
            builder.AddScoped<ICustomRouteConstraintFactory, ConstraintFactory>();
            builder.AddScoped<IRouteDataMappingFactory, RouteMappingFactory>();
            builder.AddScoped<CustomRouteValidator>();
            builder.RegisterAllImplementedInterfaces<SEO.CustomRouteValidator>(ServiceLifetime.Scoped);
            builder.AddScoped<CustomRouteRepository>();
            builder.RegisterAllImplementedInterfaces<SEO.CustomRouteRepository>(ServiceLifetime.Scoped);

            builder.AddSingleton<IStorefrontCacheControl, StorefrontCacheControlImpl>();

            builder.AddScoped<IStorefrontCache, StorefrontCache>();
            builder.AddSingleton<IThemeCache, ThemeCache>();
            builder.AddSingleton<ISitebuilderContextCacheRepository, SitebuilderContextCacheRepository>();

          
            //Rule based page stuff
            //static property provider
            builder.AddSingleton<StaticMetadataProvider<CmsPageRuleContext>>();

            //dynamic property provider
            builder.AddScoped<IDynamicContextPropertyMetadataProvider<CmsPageRuleContext>, CmsPageRuleDynamicMetadataProvider>();  //todo: update when we add customer attributes

            //metadata provider facade
            builder.AddScoped<IExpressionContextMetadataProvider<CmsPageRuleContext>, ExpressionContextMetadataProvider<CmsPageRuleContext>>();

            builder.AddScoped<IExpressionContextFactory<CmsPageRuleContext>, CmsPageRuleContextFactory>();

            //expression evaluator visitor
            builder.AddScoped<ExpressionEvaluatorVisitor<CmsPageRuleContext>>();
            builder.RegisterAllImplementedInterfaces<ExpressionEvaluatorVisitor<CmsPageRuleContext>>(ServiceLifetime.Scoped);

            //evaluator
            builder.AddScoped<IRelationalExpressionEvaluator<CmsPageRuleContext>, CmsPageRelationalExpressionEvaluator>();
            
            //expression validator visitor
            builder.AddScoped<CmsPageRuleExpressionValidator>();
            builder.RegisterAllImplementedInterfaces<CmsPageRuleExpressionValidator>(ServiceLifetime.Scoped);

            builder.AddScoped<CmsPageRuleRelationalExpressionValidator>();
            //builder.AddSingleton<HtmlActionResultMediaTypeFormatter>();
            builder.AddHttpClient();
           // builder.AddScoped<IApiContextAccessor, SBAPiContextAccessor>();

           builder.AddSingleton<IOutOfMemoryExceptionsHandler, OutOfMemoryHandler>();



        }

        private static void RegisterThemeInfrastructure(IServiceCollection builder)
        {
            builder.AddSingleton<IThemeMetaDataProvider, ThemeMetadataProvider>();
            builder.AddSingleton<IThemeRepository, ThemeRepository>();
            builder.AddScoped<HyprViewEngine>()
                .AddSingleton<SbApiActionExtensionFilter>();



            builder.AddSingleton(c =>
            {
                var tmp = new TemplateManagerProvider()
                    .WithLibrary(typeof(AddFilter).Assembly)
                    .WithLibrary(typeof(HyprViewEngine).Assembly)
                    .WithLibrary(typeof(AutofacModule).Assembly)
                    .WithLoader(new TemplateLoader(c.Resolve<Lazy<IThemeRepository>>(),
                        c.Resolve<Lazy<ISettings>>(),
                        c.Resolve<Lazy<IThemeContentRetriever>>()
                    ))
                    .WithSetting("settings.DEFAULT_AUTOESCAPE", true);

                var ass = AppDomain.CurrentDomain.GetAssemblies()
                    .FirstOrDefault(x => new AssemblyName(x.FullName).Name == "Mozu.SiteBuilder.UX");
                if (ass != null)
                {
                    tmp = tmp.WithLibrary(ass);
                }

                return tmp;
            });
            builder.AddSingleton<ITemplateManagerProvider, TemplateManagerProvider>();

            ResolverConfig.Resolver = new JsonCleaningCaseInsensitiveMemberResolver();
            EscaperConfig.Escaper = new SafeEscaper();
            Utilities.UtilConfig.Comparer = new DjangoComparer();
            Utilities.UtilConfig.VirtualPathFunc = new DjangoUtilHelper();
       
           // var tm = tmp.GetNewManager();

           builder.AddScoped<ITemplateManager>(c =>
           {
               var tm = c.Resolve<TemplateManagerProvider>().GetNewManager();
               return new HyprTemplateManager(tm, c.Resolve<IMozuVirtualPathProvider>());
           });
        }
    }
}