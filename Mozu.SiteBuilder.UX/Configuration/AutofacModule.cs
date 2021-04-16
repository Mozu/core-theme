using dotless.Core.Input;
using MassTransit;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Mozu.Core;
using Mozu.Core.Configuration;
using Mozu.Core.Logging;
using Mozu.Core.Messaging.Consume;
using Mozu.Core.Messaging.Contracts.Product.Events;
using Mozu.Core.Messaging.Contracts.Search.Events;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Logging;
using Mozu.SiteBuilder.Mvc.Mobile;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.UX.Areas.Misc;
using Mozu.SiteBuilder.UX.Messaging;
using System;
using Microsoft.AspNetCore.StaticFiles;
using Mozu.SiteBuilder.Mvc.Middleware;

namespace Mozu.SiteBuilder.UX.Configuration
{
    public class AutofacModule : IDependencyConfigurator
    {
        public void Configure(IServiceCollection configure)
        {
            SiteBuilderSessionMessageHandler.ReplaceMozuCoreSessionManagerHandler(configure);
            configure.AddScoped<EnforceSiteWideSsLMiddleware>();
            configure.AddCoreExpressionEvaluation();
            configure.AddSingleton<IContentTypeProvider, FileExtensionContentTypeProvider>();
            configure.AddScoped<IApiContext>(c=> c.GetService<IApiContextAccessor>().ApiContext);
            configure.AddScoped<ISiteBuilderApiContext>(c => (ISiteBuilderApiContext)c.GetService<IApiContextAccessor>().ApiContext);
            configure.AddScoped<IApiContextFactory, SiteBuilderApiContextBuilder>();
            configure.AddScoped<IThemeSettingsRepository, ThemeSettingsRepository>();
            configure.AddScoped<IMobileDetectionProvider, NoOpMobileDetectionProvider>();
            configure.AddScoped<IMobileDetectionProvider, FiftyOneDegreesMobileDetectionProvider>();
            configure.AddScoped<IPermissionsRepository, PermissionsRepository>();
            configure.AddScoped<ICategoryTreeProvider, RuntimeCategoryTreeProvider>();
            configure.AddMemoryCache();
            configure.AddScoped<ILoggingContextProvider, CurrentRequestLoggingContextProvider>();
            configure.AddScoped<VisitEventPublisher>();
            configure.AddMozuBus("SiteBuilderMessageQueue", (cfg, host, connectionSettings, provider) =>
            {
                cfg.ReceiveEndpoint(host, connectionSettings.QueueName +"_UCP" , ep =>
                {
                    ep.Consumer<SiteBuilderContextInvalidatorConsumer>(provider);
                });
            });
            configure.AddScoped<AMDModuleProvider>();
            configure.AddScoped<LessLogger>();
            configure.AddScoped<LessTransFormer>();
            configure.AddScoped<MyLessFileReader>();
            configure.AddScoped<IFileReader, MyLessFileReader>();
            configure.AddScoped<TemplateInheritanceHandler>();
            configure.AddScoped<ITemplateInheritanceHandler, TemplateInheritanceHandler>();
            configure.AddSingleton<SiteBuilderContextInvalidatorConsumer>();
            configure.AddSingleton<BusService>();
            configure.AddHostedService<BusService>();

        }
    }
}
