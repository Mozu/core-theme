using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.Core.Api.Exceptions;
using Mozu.SiteSettings.Order.Contracts.Clients;
using Mozu.SiteSettings.Shipping.Contracts;
using Mozu.SiteSettings.Shipping.Contracts.Clients;
using Mozu.SiteBuilder.UX.Models;
using Mozu.Core.Api.Client;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.SiteBuilder.UX.Models.Settings;
using GeneralSettings = Mozu.SiteSettings.General.Contracts.GeneralSettings;

namespace Mozu.SiteBuilder.Mvc.Settings
{
    //tbd switch to viewmodels
    public class SettingsRepository : ISettingsRepository, IAlternateNamingValueContainer
    {
        private static readonly IDictionary<string, string> creditCardMappings = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { "VISA",       "Visa"             },
            { "MASTERCARD", "Master Card"      },
            { "AMEX",       "American Express" },
            { "DISCOVER",   "Discover"         },
        };

        //IReferenceDataWebApiClient _referenceDataWebApiClient;
        IGeneralSettingsWebApiClient _generalSettingsWebApiClient;
        private ICheckoutSettingsWebApiClient _checkoutSettingsWebApiClient;
        private IShippingSettingsWebApiClient _shippingSettingsWebApiClient;
        IProvisioningWebApiClient _provisioningWebApiClient;
        Lazy<UX.Models.Settings.GeneralSettings> _genSettings;
        private Lazy<Mozu.SiteSettings.Shipping.Contracts.SiteShippingSettings> _shippingSettings;
        Lazy<SiteSettings.Order.Contracts.CheckoutSettings> _checkOutSettings;
        ISiteBuilderApiContext _sbc;
         public SettingsRepository(ISiteBuilderApiContext  sbc, /*IReferenceDataWebApiClient refClient,*/ IGeneralSettingsWebApiClient genClient, IProvisioningWebApiClient provClient, ICheckoutSettingsWebApiClient checkoutSettingsWebApiClient, IShippingSettingsWebApiClient shippingSettingsWebApiClient)
        {
            //_referenceDataWebApiClient = refClient;
            _generalSettingsWebApiClient = genClient.CloneWithoutUserClaims();
            _provisioningWebApiClient = provClient.CloneWithoutUserClaims();
            _shippingSettingsWebApiClient = shippingSettingsWebApiClient.CloneWithoutUserClaims();
            _checkoutSettingsWebApiClient = checkoutSettingsWebApiClient.CloneWithoutUserClaims();
            _sbc = sbc;
            _genSettings = new Lazy<UX.Models.Settings.GeneralSettings>(()=>GeneralSettingsFactory().Result);
            _checkOutSettings = new Lazy<SiteSettings.Order.Contracts.CheckoutSettings>(() => CheckoutSettingsFactory().Result);

            _shippingSettings = new Lazy<Mozu.SiteSettings.Shipping.Contracts.SiteShippingSettings>(()=>SiteShippingSettingsFactory().Result);



        }

         private SiteSettings.Order.Contracts.CheckoutSettings _checkoutSettings;
        Task<SiteSettings.Order.Contracts.CheckoutSettings> CheckoutSettingsFactory()
        {
            if (_checkoutSettings == null)
            {
                string key = _sbc.SiteId + _sbc.TenantId + typeof (UX.Models.Settings.CheckoutSettings).FullName;

                var settings = System.Web.HttpRuntime.Cache.Get(key) as SiteSettings.Order.Contracts.CheckoutSettings;
                if (settings == null)
                {
                    return  _checkoutSettingsWebApiClient.GetCheckoutSettings().ContinueWith(x =>
                        {
                            var  res  = x.Result.ReadAsSync();
                            settings = res;// Mapper.Map<UX.Models.Settings.CheckoutSettings>(res);
                            System.Web.HttpRuntime.Cache.Insert(key, settings, null, System.Web.Caching.Cache.NoAbsoluteExpiration, new TimeSpan(0, 0, 3));
                            return _checkoutSettings = settings;
                        });

                }
                _checkoutSettings=  settings;
            }
            var tcs = new TaskCompletionSource<SiteSettings.Order.Contracts.CheckoutSettings>();
            tcs.SetResult(_checkoutSettings );
            return tcs.Task;
        }

        private Mozu.SiteSettings.Shipping.Contracts.SiteShippingSettings _siteShippingSettings;
       Task< Mozu.SiteSettings.Shipping.Contracts.SiteShippingSettings> SiteShippingSettingsFactory()
        {
            if (_siteShippingSettings == null)
            {
                string key = _sbc.SiteId + _sbc.TenantId + typeof (Mozu.SiteSettings.Shipping.Contracts.SiteShippingSettings).FullName;

                var settings = System.Web.HttpRuntime.Cache.Get(key) as Mozu.SiteSettings.Shipping.Contracts.SiteShippingSettings;
                if (settings == null)
                {
                    return _shippingSettingsWebApiClient.GetSiteShippingSettings().ContinueWith(x =>
                        {
                            settings = x.Result.ReadAsSync();
                            System.Web.HttpRuntime.Cache.Insert(key, settings, null, System.Web.Caching.Cache.NoAbsoluteExpiration, new TimeSpan(0, 0, 3));
                            return _siteShippingSettings = settings;
                        });
                    
                    
                }
                _siteShippingSettings =  settings;
            }
            var tcs = new TaskCompletionSource<Mozu.SiteSettings.Shipping.Contracts.SiteShippingSettings>();
            tcs.SetResult(_siteShippingSettings);
            return tcs.Task;
        }

        private UX.Models.Settings.GeneralSettings _generalSettings;
        private Task<UX.Models.Settings.GeneralSettings> GeneralSettingsFactory()
        {
            if (_generalSettings == null)
            {
                var key = string.Format("{0}{1}{2}", _sbc.SiteId, _sbc.TenantId, typeof (GeneralSettings).FullName);

                var settings = System.Web.HttpRuntime.Cache.Get(key) as UX.Models.Settings.GeneralSettings;
                if (settings == null)
                {
                    return _generalSettingsWebApiClient.GetGeneralSettings().ContinueWith(x =>
                        {
                            var res = x.Result;
                            try
                            {
                                settings = Mapper.Map<UX.Models.Settings.GeneralSettings>(res.ReadAsSync());
                            }
                            catch
                            {
                                settings = new UX.Models.Settings.GeneralSettings();
                            }
                            System.Web.HttpRuntime.Cache.Insert(key, settings, null, System.Web.Caching.Cache.NoAbsoluteExpiration, new TimeSpan(0, 0, 3));
                            _generalSettings = settings;
                            return _generalSettings;
                        });


                }

                _generalSettings=  settings;
            }
            var tcs = new TaskCompletionSource<UX.Models.Settings.GeneralSettings>();
                        
            tcs.SetResult(_generalSettings);
            return tcs.Task;
        }

        public UX.Models.Settings.GeneralSettings General
        {
            get
            {
                return _genSettings.Value;
            }
        }


         public System.Threading.Tasks.Task<bool> AsyncInit()
         {
             List<Task> tasks= new List<Task>()
                                   {
                                       CheckoutSettingsFactory(),
                                       SiteShippingSettingsFactory(),
                                       GeneralSettingsFactory()
                                   };
             return Task.WhenAll(tasks).ContinueWith(x => true);
         }
         public SiteSettings.Order.Contracts.CheckoutSettings Checkout
        {
            get { return _checkOutSettings.Value; }
        }

        public SiteShippingSettings Shipping
        {
            get { return _shippingSettings.Value; ; }
        }

        public object this[string key]
        {
            get { return this.GetAlternateNamedValue(key); }
        }


       
    }
}
