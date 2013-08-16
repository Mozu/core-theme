using System;
using System.Collections.Generic;
using System.Linq;
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
        Lazy<UX.Models.Settings.CheckoutSettings> _checkOutSettings;
         ISiteBuilderContext _sbc;
         public SettingsRepository(ISiteBuilderContext sbc, /*IReferenceDataWebApiClient refClient,*/ IGeneralSettingsWebApiClient genClient, IProvisioningWebApiClient provClient, ICheckoutSettingsWebApiClient checkoutSettingsWebApiClient, IShippingSettingsWebApiClient shippingSettingsWebApiClient)
        {
            //_referenceDataWebApiClient = refClient;
            _generalSettingsWebApiClient = genClient.CloneWithoutUserClaims();
            _provisioningWebApiClient = provClient.CloneWithoutUserClaims();
            _shippingSettingsWebApiClient = shippingSettingsWebApiClient.CloneWithoutUserClaims();
            _checkoutSettingsWebApiClient = checkoutSettingsWebApiClient.CloneWithoutUserClaims();
            _sbc = sbc;
            _genSettings = new Lazy<UX.Models.Settings.GeneralSettings>(() =>
            {
                var key = string.Format("{0}{1}{2}", _sbc.SiteId, _sbc.TenantId, typeof (GeneralSettings).FullName);

                var settings = System.Web.HttpRuntime.Cache.Get(key) as UX.Models.Settings.GeneralSettings;
                    if (settings == null)
                    {
                        var res = _generalSettingsWebApiClient.GetGeneralSettings().Result;
                        try
                        {
                            settings = Mapper.Map<UX.Models.Settings.GeneralSettings>(res.ReadAsSync());
                        }
                        catch 
                        {
                            settings = new UX.Models.Settings.GeneralSettings();
                        }
                        System.Web.HttpRuntime.Cache.Insert(key, settings, null, System.Web.Caching.Cache.NoAbsoluteExpiration, new TimeSpan(0, 0, 3));
                    }
                    return settings;
            });
            _checkOutSettings = new Lazy<UX.Models.Settings.CheckoutSettings>(() =>
                {
                    string key = _sbc.SiteId + _sbc.TenantId + typeof(UX.Models.Settings.CheckoutSettings).FullName;

                    var settings = System.Web.HttpRuntime.Cache.Get(key) as UX.Models.Settings.CheckoutSettings;
                    if (settings == null)
                    {
                        var response = _checkoutSettingsWebApiClient.GetCheckoutSettings().Result.ReadAsSync();
                        System.Web.HttpRuntime.Cache.Insert(key, settings, null, System.Web.Caching.Cache.NoAbsoluteExpiration, new TimeSpan(0, 0, 3));
                    }
                    return settings;
                });

            _shippingSettings = new Lazy<Mozu.SiteSettings.Shipping.Contracts.SiteShippingSettings>(() =>
                {
                    string key = _sbc.SiteId + _sbc.TenantId + typeof(Mozu.SiteSettings.Shipping.Contracts.SiteShippingSettings).FullName;

                    var settings = System.Web.HttpRuntime.Cache.Get(key) as Mozu.SiteSettings.Shipping.Contracts.SiteShippingSettings;
                    if (settings == null)
                    {
                        settings = _shippingSettingsWebApiClient.GetSiteShippingSettings().Result.ReadAsSync();
                        System.Web.HttpRuntime.Cache.Insert(key, settings, null, System.Web.Caching.Cache.NoAbsoluteExpiration, new TimeSpan(0, 0, 3));
                    }
                    return settings;
                });

             

        }

         public UX.Models.Settings.GeneralSettings General
        {
            get
            {
                return _genSettings.Value;
            }
        }

        public CheckoutSettings Checkout
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
