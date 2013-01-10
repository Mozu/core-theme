using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Mvc;
using Autofac;
using Autofac.Integration.Mvc;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Content.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Configuration;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Mobile;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.User.Contracts.Clients;
using Module = Autofac.Module;


namespace Mozu.SiteBuilder.UX.Configuration
{
	public class AutofacModule : Module
	{
		public string ApiBaseUri { get; set; }

		protected override void Load(ContainerBuilder builder)
		{
            builder.Register(c => new DjangoMozuViewEngine(setup => setup
                .WithLibrary(typeof(NDjango.FiltersCS.AddFilter).Assembly)
                .WithLibrary(typeof(DjangoMozuViewEngine).Assembly)
                .WithLibrary(typeof(AutofacModule).Assembly)
                .WithSetting("settings.DEFAULT_AUTOESCAPE", false))).As<IViewEngine>().As<DjangoMozuViewEngine>().SingleInstance();

			//Registers controllers and allows property injection into action filters
			builder.RegisterControllers(ThisAssembly);

			//Registers all IModelBinder implementations with MVC
			builder.RegisterModelBinders(ThisAssembly);





		    builder.Register(c => new DjangoMozuViewEngine(setup => setup

		                                                                    .WithLibrary(typeof (NDjango.FiltersCS.AddFilter).Assembly)
		                                                                    .WithLibrary(typeof (DjangoMozuViewEngine).Assembly)
		                                                                    .WithLibrary(typeof (AutofacModule).Assembly)

		                                                                    .WithSetting("settings.DEFAULT_AUTOESCAPE", false))).As<IViewEngine>().As<DjangoMozuViewEngine>().SingleInstance();


            builder.RegisterType<SiteBuilderApiContext>().As<Mozu.Core.IApiContext>().InstancePerHttpRequest();
            builder.RegisterType<Mozu.SiteBuilder.Mvc.Security.AuthenticationHelper>().InstancePerHttpRequest();
            builder.RegisterType<ServiceClientMessageHandler>().As<IServiceClientMessageHandler>().InstancePerHttpRequest();
          
		    builder.RegisterClassesMatchingInterfaceName(typeof (Mozu.SiteBuilder.Mvc.CatalogContext).Assembly);
		    builder.RegisterClassesMatchingInterfaceName(typeof (Mozu.SiteBuilder.Mvc.Customers.CustomerRepository).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.Customer.Contracts.Clients.CustomerAccountWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.AdminUser.Contracts.Clients.RoleWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.Content.Contracts.Clients.ContentCollectionWebApiClient   ).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.ProductAdmin.Contracts.Category  ).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.ProductRuntime.Contracts.Clients.ProductRuntimeWebApiClient ).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.Cart.Contracts.Clients.CartWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.Order.Contracts.Clients.OrderWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteSettings.Order.Contracts.Clients.CheckoutSettingsWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.Reference.Contracts.Clients.ReferenceDataWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteSettings.General.Contracts.Clients.GeneralSettingsWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteSettings.Shipping.Contracts.Clients.ShippingSettingsWebApiClient).Assembly);
            builder.RegisterClassesMatchingInterfaceName(typeof(Mozu.SiteSettings.Order.Contracts.CheckoutSettings ).Assembly);
            builder.RegisterType<SiteBuilderContext>().As<ISiteBuilderContext>().InstancePerHttpRequest().As<IEditableContext>().InstancePerHttpRequest();

            builder.RegisterType<ThemeSettingsRepository>().As<IThemeSettingsRepository>().InstancePerHttpRequest();
            builder.RegisterType<WidgetProvider>().As<IWidgetProvider>();
            builder.RegisterType<FiftyOneDegreesMobileDetectionProvider>().As<IMobileDetectionProvider>().InstancePerHttpRequest();

            builder.RegisterType<RoleWebApiClient>().As<IRoleWebApiClient>();
            builder.RegisterType<BehaviorWebApiClient>().As<IBehaviorWebApiClient>();
            builder.RegisterType<PermissionsRepository>().As<IPermissionsRepository>();

            builder.RegisterModule(new AutofacWebTypesModule());

            //Registers action filter property injection
            builder.RegisterFilterProvider();

            //Registers the custom Autofac model binder that works with the container with MVC 
            builder.RegisterModelBinderProvider();

            builder.RegisterType<DefaultStorefrontCache>().As<IStorefrontCache>().InstancePerLifetimeScope();
		    builder.RegisterType<ServiceClientMessageHandler>().InstancePerLifetimeScope();

            builder.Register(c => new GeneralSettingsWebApiClient(c.Resolve<ServiceClientMessageHandler>())).As<IGeneralSettingsWebApiClient>().InstancePerLifetimeScope();
            builder.Register(c => new DocumentWebApiClient(c.Resolve<ServiceClientMessageHandler>())).As<IDocumentWebApiClient>().InstancePerLifetimeScope();
            builder.Register(c => new ProductCategoryRuntimeWebApiClient(c.Resolve<ServiceClientMessageHandler>())).As<IProductCategoryRuntimeWebApiClient>().InstancePerLifetimeScope();
            builder.Register(c => new ProductRuntimeWebApiClient(c.Resolve<ServiceClientMessageHandler>())).As<IProductRuntimeWebApiClient>().InstancePerLifetimeScope();

            builder.RegisterType<MozuServiceClientMessageHandler>().As<IServiceClientMessageHandler>();
		}

	    private class MozuServiceClientMessageHandler : IServiceClientMessageHandler
	    {
	        public static object NULLOBJECT = new object();
	        private IApiContext _ctx;
            private readonly IStorefrontCache _cache;
            private ServiceClientMessageHandler _volusionApiWebClientFactory;

            public MozuServiceClientMessageHandler(IApiContext ctx, IStorefrontCache cache)
	        {
	            _ctx = ctx;
	            _cache = cache;
                _volusionApiWebClientFactory = new ServiceClientMessageHandler2(ctx);
	        }

            bool BypassCache ( ConfigOptions options)
            {
                object  byPassCache = false;
                if ( options != null &&  options.ExtendedProperties != null && options.ExtendedProperties is IDictionary <string,object> && ((IDictionary<string,object >)options.ExtendedProperties ).TryGetValue( "bypassCache" , out byPassCache ))
                {
                    return (bool) byPassCache;
                }
                return false;
            }

	        public Task<ServiceClientResponse<T>> SendAsync<T>(string verb, string relpath, string serviceId, ConfigOptions options)
            {
                var key = verb + "|" + relpath + "|" + serviceId + "|" + _ctx.SiteId;
                object obj = _cache[key];


                if (obj != null && !BypassCache(options ))
                {
                    if ( obj == NULLOBJECT)
                    {
                        obj = null;
                    }
                    var ret = new ServiceClientResponse<T>()
                    {
                        HasException = false,
                        ReadAsSync = () => (T)obj,
                        ReadAsAsync = () =>
                            {
                                var tSource = new TaskCompletionSource<T>();
                                tSource.SetResult((T)obj);
                                return tSource.Task;

                            },
                        ResponseMessage = new HttpResponseMessage()
                        {
                            StatusCode = HttpStatusCode.OK
                        }
                    };

                    var scrSource = new TaskCompletionSource<ServiceClientResponse<T>>();
                    scrSource.SetResult(ret);
                    return scrSource.Task;
                  
                   
                }

                var relTask = _volusionApiWebClientFactory.SendAsync<T>(verb, relpath, serviceId, options);
                return relTask.ContinueWith(x => this.SendAsync1Callback<T>(x, key));

                
            }

            private ServiceClientResponse<T> SendAsync1Callback<T>(Task<ServiceClientResponse<T>> task, string key)
            {
                var ret = task.Result;
                if (!ret.ResponseMessage.IsSuccessStatusCode)
                {
                    return ret;
                }
                //var rm = new HttpResponseMessage()
                //             {
                                 
                //             }
                var copy = new ServiceClientResponse<T>()
                {
                    HasException = ret.HasException,
                    ReadAsAsync = () => ret.ReadAsAsync ().ContinueWith( innerTask =>
                        {
                            var g = innerTask.Result;
                            _cache[key] = (object)g ?? NULLOBJECT;
                            return g;
                        })
                        
                    ,

                    ReadAsSync = () =>
                    {
                        var g = ret.ReadAsSync();
                        _cache[key] = (object)g ?? NULLOBJECT;
                        return g;
                    },
                    ResponseMessage = ret.ResponseMessage,
                    ReadException = () => ret.ReadException()
                };

                return copy;
            }

            public Task<ServiceClientResponse<T>> SendAsync<T, S>(string verb, string relpath, S sval, string serviceId, ConfigOptions options)
            {
                string key = null;
                object obj = null;
                if ( !(sval is System.IO.Stream) )
                {
                    try
                    {
                        var json = Newtonsoft.Json.JsonConvert.SerializeObject(sval);

                        key = verb + "|" + relpath + "|" + json + "|" + serviceId + "|" + _ctx.SiteId;
                        obj = _cache[key];
                    }
                    catch(Exception e)
                    {
                        key = null;
                        System.Diagnostics.Debug.Write(e.ToString());
                    }
                }
                
                
                 



                if (obj != null  && !BypassCache(options ))
                {
                    if (obj == NULLOBJECT)
                    {
                        obj = null;
                    }
                    var ret = new ServiceClientResponse<T>()
                    {
                        HasException = false,
                        ReadAsSync = () => (T)obj,
                        ReadAsAsync = () =>
                        {
                            var tSource = new TaskCompletionSource<T>();
                            tSource.SetResult((T)obj);
                            return tSource.Task;

                        },
                        ResponseMessage = new HttpResponseMessage()
                        {
                            StatusCode = HttpStatusCode.OK
                        }
                    };

                    var scrSource = new TaskCompletionSource<ServiceClientResponse<T>>();
                    scrSource.SetResult(ret);
                    return scrSource.Task;


                }


                var relTask = _volusionApiWebClientFactory.SendAsync<T, S>(verb, relpath,sval, serviceId, options);
                return relTask.ContinueWith(x => this.SendAsync2Callback<T, S>(x, key));

            }

            private ServiceClientResponse<T1> SendAsync2Callback<T1, T2>(Task<ServiceClientResponse<T1>> task, string key)
            {
                var ret = task.Result;
                if (!ret.ResponseMessage.IsSuccessStatusCode)
                {
                    return ret;
                }
                var copy = new ServiceClientResponse<T1>()
                {
                    HasException = ret.HasException,
                    ReadAsAsync = () => ret.ReadAsAsync().ContinueWith(innerTask =>
                    {
                        var g = innerTask.Result;
                        if (key != null)
                        {
                            _cache[key] = (object) g ?? NULLOBJECT;
                        }
                        return g;
                    })

                    ,
                    ReadAsSync = () =>
                    {
                        var g = ret.ReadAsSync();
                        if (key != null)
                        {
                            _cache[key] = (object) g ?? NULLOBJECT;
                        }
                        return g;
                    },
                    ResponseMessage = ret.ResponseMessage,
                    ReadException = () => ret.ReadException()
                };

                return copy;
            }

            public string GetBaseUrlById(string serviceId)
            {
                return ((IServiceClientMessageHandler) _volusionApiWebClientFactory).GetBaseUrlById(serviceId);
            }
        }
	}
}