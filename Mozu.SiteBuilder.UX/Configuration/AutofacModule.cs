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
using System.Net.Http;
using Microsoft.AspNetCore.StaticFiles;
using Mozu.SiteBuilder.Mvc.Middleware;
using Mozu.SiteBuilder.UX.Areas.Misc.Controllers;

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
            
            
            configure.AddMozuBus("SiteBuilderMessageQueue", (configurator, settings, registration, serviceBussConfig) =>
            { 
                //concat the host name of the machine to the queue name to make it unique
                var queueName = settings.QueueName + "_dnc6";
                                
                configurator.ReceiveEndpoint(queueName, e =>
                {   
                    e.ConfigureConsumeTopology = false;
                    e.Bind("siteBuilder_fanOut_exchange",x =>
                    {
                        x.ExchangeType = "fanout";
                        x.RoutingKey = "";
                    });
                    e.Durable = false;
                    e.AutoDelete = true; 
                    e.SetQueueArgument("x-message-ttl", 30000);
                    e.Consumer<SiteBuilderContextInvalidatorConsumer>(registration);
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
            configure.AddScoped<ContentFetcher>();
            configure.AddHttpClient<ContentFetcher>()
                .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler()
                {
                    AllowAutoRedirect = false,
                    UseDefaultCredentials = true
                });

        }
    }
}
