using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Configuration;
using Mozu.Core.Settings;
using Mozu.Customer.Contracts.Clients;
using Mozu.Location.Contracts.Clients;
using Mozu.MZDB.Contracts.Clients;
using Mozu.ProductAdmin.Contracts;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.Reference.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ActionConstraints;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.Mvc.Middleware;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers;
using Mozu.SiteBuilder.UX.Configuration;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.SiteBuilder.UX.Providers;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.SiteSettings.Order.Contracts.Clients;
using Mozu.Tenant.Contracts.Clients;

namespace Mozu.SiteBuilder.UX
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public virtual void ConfigureServices(IServiceCollection services)
        {
            services
                .AddTransient<IStartupFilter,SbStartupFilter>()
                .AddMozuMvc()
                .AddMozuMapping()
                .AddSwaggerGenForMozu("Kibo Content Service")
                .ConfigureMozuServices(factory =>
                {
                    factory.UseDefault();
                    factory
                        .UsingAssembly(typeof(ISitesWebApiClient).Assembly)
                        .UsingAssembly(typeof(ILocationRuntimeWebApiClient).Assembly)
                        .UsingAssembly(typeof(IPermissionsRepository).Assembly)
                        .UsingAssembly(typeof(CustomerAccountWebApiClient).Assembly)
                        .UsingAssembly(typeof(IMultiScopeInvitationWebApiClient).Assembly)
                        .UsingAssembly(typeof(Category).Assembly)
                        .UsingAssembly(typeof(ProductRuntimeWebApiClient).Assembly)
                        .UsingAssembly(typeof(CartWebApiClient).Assembly)
                        .UsingAssembly(typeof(CheckoutSettingsWebApiClient).Assembly)
                        .UsingAssembly(typeof(IGeneralSettingsWebApiClient).Assembly)
                        .UsingAssembly(typeof(ReferenceDataWebApiClient).Assembly)
                        .UsingAssembly(typeof(IEntityListsWebApiClient).Assembly)
                        .UsingAssembly(typeof(IDocumentListWebApiClient).Assembly)
                        .UsingAssembly(typeof(Kibo.Fulfillment.Contracts.Api.FulfillmentControllerApiClient).Assembly)
                        .UsingAssembly(typeof(Mozu.Core.Messaging.Configuration.AutofacModule).Assembly)
                        .UsingAssembly(typeof(Mozu.SiteBuilder.Mvc.Configuration.AutofacModule).Assembly)
                        .UsingAssembly(typeof(Mozu.SiteBuilder.UX.Configuration.AutofacModule).Assembly);

                })
                .UseAlternateUrlPrefix("mozu.content.webapi")
                .AddMvc(opt =>
                {
                    opt.Conventions.Add(new AcceptHeaderConvention());
                    opt.OutputFormatters.Insert(0, new HtmlActionResultMediaTypeFormatter());
                    opt.OutputFormatters.Add(new HtmlErrorMediaTypeHyperFormatter());
                    opt.OutputFormatters.Insert(0, new JsonpOutputFormatter(opt));
                    var duration = Configuration.GetValue("mozu:appsettings:clientCacheHeaderLength:default", "1209700");
                    opt.CacheProfiles.Add("default", new CacheProfile()
                    {
                        Duration = int.Parse(duration),
                        Location = ResponseCacheLocation.Any
                    });
                    //
                })
                .SetCompatibilityVersion(CompatibilityVersion.Latest);
            services.AddControllers(options =>
                {
                    //var rem = options.Filters.Where(x => 
                    //(x is TypeFilterAttribute && ((TypeFilterAttribute) x).ImplementationType == typeof(Core.Actions.GlobalActionExtensionFilter)) 
                    //|| x is Core.Actions.GlobalActionExtensionFilter
                    //).FirstOrDefault();
                    //if ( rem != null)
                    //{
                    //    options.Filters.Remove(rem);
                    //}
                    options.Filters.Add(typeof(EditModeCacheInvalidatorFilter));
                    options.Filters.Add(typeof(AnonymousShopperFilterAttribute));
                    options.Filters.Add(typeof(VisitTrackingFilterAttribute));
                  //  options.Filters.Add(typeof(Core.Actions.GlobalActionExtensionFilter));
                    options.Filters.Add(typeof(HttpResponseExceptionFilter));
                });
            services.Configure<IISServerOptions>(opt => { opt.AllowSynchronousIO = true; });

            services.AddHttpClient("apilocaltest", c =>
            {
                c.MaxResponseContentBufferSize = int.MaxValue;
                c.Timeout = new TimeSpan(0, 1, 3, 0);
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            
            app.UseStaticFiles(new StaticFileOptions()
            {
                FileProvider =
                    new CaseInsensitivePhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(),
                        "wwwroot"))
            });
            var rewriteOptions = new RewriteOptions().Add(UrlRewritingMiddleware.RewriteIncomingUrl);
            app.UseMiddleware<RedisHealthCheckMiddleware>()
                .UseMiddleware<SessionMiddleware>()
                .UseMiddleware<MzUnderscoreRequestCleanerMiddleware>()
                .UseMiddleware<SiteContextInitializationMiddleware>()
                .UseRewriter(rewriteOptions)
                .UseMvc(RouteConfig.Register)
                .UseMiddleware<FourHundredMiddleware>()
                .UseMiddleware<DeepPagingLimitingMiddleware>()
               
                ;
            //  .UseMiddleware<PageContextCookieMiddleware>();

        }
        public class SbStartupFilter : IStartupFilter
        {
            public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next)
            {
                return (app) =>
                {
                    app
                        .UseMiddleware<CaseCookieCleaner>()
                        .UseMiddleware<ResponseHeaderAppenderMiddleware>()
                        .UseMiddleware<PageContextCookieMiddleware>();
                    next(app);
                };
            }
        }
    }
}
