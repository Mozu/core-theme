using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using Autofac;
using Autofac.Integration.WebApi;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Content.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Handlers.Message;
using Mozu.Core.Configuration;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Mobile;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.Mvc.TempMocks;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models;
using Mozu.SiteBuilder.UX.Navigation;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.User.Contracts.Clients;
using NDjango;
using NDjango.Interfaces;
using Module = Autofac.Module;


namespace Mozu.SiteBuilder.UX.Configuration
{
	public class AutofacModule : Module
	{
		public string ApiBaseUri { get; set; }
        class SbApiContextBuilder : IApiContextBuilder
        {

            public IApiContext BuildApiContext(IApiContext apiContext, System.Net.Http.HttpRequestMessage request)
            {
                return (IApiContext)request.GetDependencyScope().GetService(typeof(IApiContext));
             
            }
        }
		protected override void Load(ContainerBuilder builder)
		{












            builder.RegisterHttpRequestMessage(GlobalConfiguration.Configuration);

            builder.RegisterType<SiteBuilderApiContext>().As<Mozu.Core.IApiContext>().As<ISiteBuilderApiContext>().InstancePerApiRequest();
           // builder.RegisterType<Mozu.SiteBuilder.Mvc.Security.AuthenticationHelper>().InstancePerHttpRequest();
            builder.RegisterType<ServiceClientMessageHandler>().As<IServiceClientMessageHandler>().InstancePerApiRequest();
            builder.RegisterType<SbApiContextBuilder>().As<IApiContextBuilder>();
		    builder.RegisterClassesMatchingInterfaceName(typeof (Mozu.SiteBuilder.Mvc.CatalogContext).Assembly);
		    builder.RegisterClassesMatchingInterfaceName(typeof (Mozu.SiteBuilder.Mvc.Customers.CustomerRepository).Assembly);
		    builder.RegisterClassesMatchingInterfaceName(typeof (Mozu.Customer.Contracts.Clients.CustomerAccountWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.AdminUser.Contracts.Clients.IMultiScopeInvitationWebApiClient ).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.Content.Contracts.Clients.DocumentListWebApiClient    ).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.ProductAdmin.Contracts.Category  ).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.ProductRuntime.Contracts.Clients.ProductRuntimeWebApiClient ).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.CommerceRuntime.Contracts.Clients.CartWebApiClient ).Assembly);
            
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteSettings.Order.Contracts.Clients.CheckoutSettingsWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.Reference.Contracts.Clients.ReferenceDataWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteSettings.General.Contracts.Clients.GeneralSettingsWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.User.Contracts.Clients.IUserWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteSettings.Shipping.Contracts.Clients.ShippingSettingsWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteSettings.Order.Contracts.CheckoutSettings ).Assembly);
		    builder.RegisterType<SiteBuilderContext>().As<ISiteBuilderContext>().InstancePerApiRequest();

            builder.RegisterType<ThemeSettingsRepository>().As<IThemeSettingsRepository>().InstancePerApiRequest();

            builder.RegisterType<FiftyOneDegreesMobileDetectionProvider>().As<IMobileDetectionProvider>().InstancePerApiRequest();

          
          //  builder.RegisterType<BehaviorWebApiClient>().As<IBehaviorWebApiClient>();
		    builder.RegisterType<PermissionsRepository>().As<IPermissionsRepository>().InstancePerApiRequest();




            builder.RegisterType<DefaultStorefrontCache>().As<IStorefrontCache>().InstancePerApiRequest();
            builder.RegisterType<ServiceClientMessageHandler>().InstancePerApiRequest();

            //builder.Register(c => new GeneralSettingsWebApiClient(c.Resolve<ServiceClientMessageHandler>())).As<IGeneralSettingsWebApiClient>().InstancePerLifetimeScope();
            //builder.Register(c => new DocumentWebApiClient(c.Resolve<ServiceClientMessageHandler>())).As<IDocumentListWebApiClient>().InstancePerLifetimeScope();
            //builder.Register(c => new ProductCategoryRuntimeWebApiClient(c.Resolve<ServiceClientMessageHandler>())).As<IProductCategoryRuntimeWebApiClient>().InstancePerLifetimeScope();
            //builder.Register(c => new ProductRuntimeWebApiClient(c.Resolve<ServiceClientMessageHandler>())).As<IProductRuntimeWebApiClient>().InstancePerLifetimeScope();

		  //  builder.RegisterType<MockProductCategoryRuntimeWebApiClient>().As<IProductCategoryRuntimeWebApiClient>();
            //builder.RegisterType<DjangoMozuViewEngine>().As<DjangoMozuViewEngine>().As<IViewEngine>().InstancePerLifetimeScope();

            builder.RegisterType<RuntimeCategoryTreeProvider>().As<ICategoryTreeProvider>().InstancePerApiRequest();
		    builder.RegisterType<CategoryNavigationProvider>().As<ICategoryNavigationProvider>().InstancePerApiRequest();

		    // builder.RegisterType<MozuServiceClientMessageHandler>().As<IServiceClientMessageHandler>();
		}

        
	}
}