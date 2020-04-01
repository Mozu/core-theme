using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Configuration;
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
                        .UsingAssembly(Assembly.Load("Mozu.SiteBuilder.Mvc"))
                        .UsingAssembly(Assembly.Load("Mozu.Core.Messaging"))
                        .UsingAssembly(Assembly.GetExecutingAssembly());

                })
                .UseAlternateUrlPrefix("mozu.content.webapi")
                .AddMvc(opt =>
                {
                    opt.Conventions.Add(new AcceptHeaderConvention());
                    opt.OutputFormatters.Insert(0, new HtmlActionResultMediaTypeFormatter());
                    opt.OutputFormatters.Add(new HtmlErrorMediaTypeHyperFormatter());
                })
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_2);
            services.AddControllers(options =>
                options.Filters.Add(new HttpResponseExceptionFilter()));

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            var rewriteOptions = new RewriteOptions().Add(UrlRewritingMiddleware.RewriteIncomingUrl);

            app.UseMiddleware<RedisHealthCheckMiddleware>()
                .UseMiddleware<SessionMiddleware>()
                .UseMiddleware<MzUnderscoreRequestCleanerMiddleware>()
                .UseMiddleware<SiteContextInitializationMiddleware>()
                .UseRewriter(rewriteOptions)
                .UseMvc(RouteConfig.Register)
                .UseMiddleware<FourHundredMiddleware>()
                .UseMiddleware<DeepPagingLimitingMiddleware>()
                .UseMiddleware<ResponseHeaderAppenderMiddleware>()
                .UseMiddleware<PageContextCookieMiddleware>();
        }
    }
}
