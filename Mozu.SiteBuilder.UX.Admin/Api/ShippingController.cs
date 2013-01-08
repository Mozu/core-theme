using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.Core;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteSettings.Shipping.Contracts.Clients;
using Mozu.UspsShippingAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping;
using ShippingClass = Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping.ShippingClass;
using ShippingRate = Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping.ShippingRate;

//using Volusion.UspsShippingAdmin.WebApi.Clients;

//using Mozu.ShippingRuntime.Contracts.Clients;
//using Volusion.UspsShippingAdmin.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class ShippingController : BaseController
    {
        private readonly IShippingClassWebApiClient _shippingClassClient;
        private readonly IShippingRateWebApiClient _shippingRateClient;
        private readonly IShippingSettingsWebApiClient _siteShippingSettingsClient;
        private readonly IUspsShippingSharedWebApiClient _uspsShippingSharedClient;
        private readonly IUspsShippingInstanceWebApiClient _uspsShippingInstanceClient;

        public ShippingController(IShippingClassWebApiClient shippingClassClient, IShippingRateWebApiClient shippingRateClient, IShippingSettingsWebApiClient siteShippingSettingsClient, IUspsShippingSharedWebApiClient uspsShippingSharedClient, IUspsShippingInstanceWebApiClient uspsShippingInstanceClient, IApiContext apiCtx)
        {
            if (shippingClassClient == null)
            {
                throw new ArgumentNullException("shippingClassClient");
            }

            if (shippingRateClient == null)
            {
                throw new ArgumentNullException("shippingRateClient");
            }

            if (siteShippingSettingsClient == null)
            {
                throw new ArgumentNullException("siteShippingSettingsClient");
            }

            if (uspsShippingSharedClient == null)
            {
                throw new ArgumentNullException("uspsShippingSharedClient");
            }

            if (uspsShippingInstanceClient == null)
            {
                throw new ArgumentNullException("uspsShippingInstanceClient");
            }

            _shippingClassClient = shippingClassClient;
            _shippingRateClient = shippingRateClient;
            _siteShippingSettingsClient = siteShippingSettingsClient;
            _uspsShippingSharedClient = uspsShippingSharedClient;
            _uspsShippingInstanceClient = uspsShippingInstanceClient;

            // TODO: Temp???
             Provision(apiCtx);
        }
        static HashSet<string> g_provisioned = new HashSet<string>(); 
        private void Provision(IApiContext ctx)
        {
            string key = ctx.TenantId + "|" + ctx.SiteId;
            if ( g_provisioned.Contains(key))
            {
                return;
            }
            lock (g_provisioned)
            {
                if (g_provisioned.Contains(key))
                {
                    return;
                }
                // So we need to make sure the Custom rate class exists for this customer...
                var classes = _shippingClassClient.GetShippingClasses(0, 100, null, null).Result.ReadAsSync();

                if (classes.Items.SingleOrDefault(x => x.InternalName == "Custom rates") == null)
                {
                    var resp = _shippingClassClient.CreateShippingClass(new Mozu.ProductAdmin.Contracts.ShippingClass
                                                                            {
                                                                                InternalName = "Custom rates"
                                                                            }).Result;
                    if (!resp.ResponseMessage.IsSuccessStatusCode)
                    {
                        throw resp.ReadException();
                    }
                }

                Mozu.Core.Api.Contracts.Feature activeRate = null;

                try
                {
                    activeRate = _siteShippingSettingsClient.GetActiveRateProvider().Result.ReadAsAsync().Result;
                }
                catch (Exception)
                {
                    // Right now this bombs if no active rate provider has been set
                }
                finally
                {
                    if (activeRate == null)
                    {
                        var customRateProvider = _siteShippingSettingsClient.CreateActiveRateProvider(new Mozu.Core.Api.Contracts.Feature {Id = 1, Name = "customrates"}).Result.ReadAsAsync().Result;
                        //var uspsRateProvider = _siteShippingSettingsClient.CreateActiveRateProvider(new Mozu.Core.Api.Contracts.Feature {Id = 2, Name = "uspsrates"}).Result.ReadAsAsync().Result;
                    }
                }
                g_provisioned.Add(key);
                   
            }
        }

        [WebGet(UriTemplate = "/methodsync/?id={id}")]
        public Task<Response<string>> SyncMethods(string id)
        {
            if(id == "custom")
            {
                var custom = _shippingRateClient.SyncronizeShippingRatesToSiteSettingsShippingMethods(null, null).Result.ReadAsAsync().Result;
            } else
            {
                var usps = _uspsShippingInstanceClient.SyncronizeUspsShippingMethodsToSiteSettingsShippingRates().Result.ReadAsAsync().Result;
            }

            return Single(id);
        }

        [WebGet(UriTemplate = "/activerateprovider/read")]
        public Task<Response<Feature>> GetActiveRateProvider()
        {
            var activeRateProvider = _siteShippingSettingsClient.GetActiveRateProvider().Result.ReadAsAsync().Result;

            Feature feature = null;

            if(activeRateProvider != null)
            {
                feature = new Feature
                {
                    Id = activeRateProvider.Id,
                    Name = activeRateProvider.Name,
                    Version = activeRateProvider.Version
                };
            }

            return Single(feature);
        }

        [WebGet(UriTemplate = "/activerateprovider/set/?id={id}")]
        public Task<Response<Feature>> SetActiveRateProvider(int id)
        {
            var activeRateProvider = _siteShippingSettingsClient.UpdateActiveRateProvider(new Mozu.Core.Api.Contracts.Feature { Id = id, Name = (id == 1) ? "customrates" : "uspsrates" }).Result.ReadAsAsync().Result;

            Feature feature = null;

            if (activeRateProvider != null)
            {
                feature = new Feature
                {
                    Id = activeRateProvider.Id,
                    Name = activeRateProvider.Name,
                    Version = activeRateProvider.Version
                };
            }

            return Single(feature);
        }

        [WebGet(UriTemplate = "/class/read")]
        public Task<Response<List<ShippingClass>>> GetShippingClasses()
        {
            var classes = _shippingClassClient.GetShippingClasses(0, 1000, null, null).Result.ReadAsAsync();

            var shippingClasses = Mapper.Map<List<ShippingClass>>(classes.Result.Items);

            return List(shippingClasses, 1);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/rate/create")]
        public Task<Response<List<ShippingRate>>> CreateShippingRate(List<ShippingRate> rates)
        {
            var ret = new List<ShippingRate>();

            foreach (var shippingRate in rates)
            {
                shippingRate.ShippingRateId = null;
                var rate = Mapper.Map<Mozu.ProductAdmin.Contracts.ShippingRate>(shippingRate);
                var res = _shippingRateClient.CreateShippingRate(rate).Result.ReadAsSync();
                ret.Add(Mapper.Map<ShippingRate>(res));
            }

            return List(ret, 1);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/rate/delete")]
        public Task<Response<List<ShippingRate>>> DeleteShippingRate(List<ShippingRate> rates)
        {
            var ret = (from shippingRate in rates let res = _shippingRateClient.DeleteShippingRate(shippingRate.ShippingRateId).Result.ReadAsAsync().Result select Mapper.Map<ShippingRate>(shippingRate)).ToList();

            return List(ret);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/rate/edit")]
        public Task<Response<List<ShippingRate>>> UpdateShippingRate(List<ShippingRate> rates)
        {
            var ret = (from shippingRate in rates
                       select Mapper.Map<Mozu.ProductAdmin.Contracts.ShippingRate>(shippingRate)
                           into rate
                           select _shippingRateClient.UpdateShippingRate(rate, rate.ShippingRateId).Result.ReadAsSync()
                               into res
                               select Mapper.Map<ShippingRate>(res)).ToList();

            return List(ret, 1);
        }

        [WebGet(UriTemplate = "/domesticrates/read")]
        public Task<Response<List<ShippingRate>>> GetDomesticRates()
        {
            List<ShippingRate> domesticRates = null;

            var rates = _shippingRateClient.GetShippingRates(0, 100, null, "shippingclassid eq " + GetRateClassId("Custom rates")).Result.ReadAsSync();

            if(rates.Items != null)
            {
                var customRates = Mapper.Map<List<ShippingRate>>(rates.Items.ToList());
                domesticRates = customRates.Where(shippingRate => !shippingRate.IsInternational).ToList();
            }

            return List(domesticRates, 1);
        }

        [WebGet(UriTemplate = "/internationalrates/read")]
        public Task<Response<List<ShippingRate>>> GetInternationalRates()
        {
            List<ShippingRate> intlRates = null;

            var rates = _shippingRateClient.GetShippingRates(0, 100, null, "shippingclassid eq " + GetRateClassId("Custom rates")).Result.ReadAsSync();

            if(rates.Items != null)
            {
                var customRates = Mapper.Map<List<ShippingRate>>(rates.Items.ToList());
                intlRates = customRates.Where(shippingRate => shippingRate.IsInternational).ToList(); 
            }

            return List(intlRates, 1);
        }

        [WebGet(UriTemplate = "/uspsglobalshared/read")]
        public Task<Response<List<SharedShippingMethod>>> GetUspsSharedShippingMethods(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            if (pagingParams.id == null)
            {
                string filter = null;
                string isInternational;

                if (extFilter.TryGetValue("isinternational", out isInternational))
                {
                    bool val;

                    if(bool.TryParse(isInternational, out val))
                    {
                        filter = (val) ? "isinternational eq true" : "isinternational ne true";
                    }
                }

                var res = _uspsShippingSharedClient.GetSharedOrGlobalShippingMethods(null, null, null, filter).Result.ReadAsSync();
                var methods = Mapper.Map<List<SharedShippingMethod>>(res.Items);

                return List(methods);
            }

            return EmptyList<SharedShippingMethod>();
        }

        [WebInvoke(Method = "POST", UriTemplate = "/uspsconfig/create")]
        public Task<Response<UspsConfiguration>> CreateUspsConfiguration(UspsConfiguration model)
        {
            var cfg = Mapper.Map<UspsConfiguration>(_uspsShippingInstanceClient.CreateUspsConfiguration(Mapper.Map<Mozu.UspsShippingAdmin.Contracts.UspsConfiguration>(model)).Result.ReadAsAsync().Result);

            return Single(cfg);
        }

        [WebGet(UriTemplate = "/uspsconfig/read")]
        public Task<Response<UspsConfiguration>> GetUspsConfiguration(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            UspsConfiguration res = null;

            try
            {
                res = Mapper.Map<UspsConfiguration>(_uspsShippingInstanceClient.GetUspsConfiguration().Result.ReadAsAsync().Result);
            }
            catch(Exception)
            {
                // Ugh... if a config doesn't exist it throws an error. Return null.    
            }

            return Single(res);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/uspsconfig/edit")]
        public Task<Response<UspsConfiguration>> UpdateUspsConfiguration(UspsConfiguration model)
        {
            var cfg = Mapper.Map<UspsConfiguration>(_uspsShippingInstanceClient.UpdateUspsConfiguration(Mapper.Map<Mozu.UspsShippingAdmin.Contracts.UspsConfiguration>(model)).Result.ReadAsAsync().Result);

            return Single(cfg);
        }

        [WebGet(UriTemplate = "/regions/read")]
        public Task<Response<List<SiteShippingRegion>>> GetShippingRegions()
        {
            var regions = Mapper.Map<List<SiteShippingRegion>>(_siteShippingSettingsClient.GetShippingRegions().Result.ReadAsSync());

            return List(regions, 1);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/regions/edit")]
        public Task<Response<List<SiteShippingRegion>>> UpdateShippingRegions(List<SiteShippingRegion> r)
        {
            var dc = Mapper.Map<List<Mozu.SiteSettings.Shipping.Contracts.SiteShippingRegion>>(r);
            var regions = _siteShippingSettingsClient.UpdateShippingRegions(dc).Result.ReadAsSync();

            var siteShippingRegions = Mapper.Map<List<SiteShippingRegion>>(regions);
            return List(siteShippingRegions, 1);
        }

        [WebGet(UriTemplate = "/originaddress/read")]
        public Task<Response<SiteShippingOriginAddress>> GetOriginAddress()
        {
            SiteShippingOriginAddress origin = null;

            try
            {
                origin = Mapper.Map<SiteShippingOriginAddress>(_siteShippingSettingsClient.GetShippingOriginAddress().Result.ReadAsSync());    
            }
            catch(Exception)
            {
                // This throws a stupid exception when an address doesn't exist. Return null
            }

            return Single(origin);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/originaddress/edit")]
        public Task<Response<SiteShippingOriginAddress>> UpdateOriginAddress(SiteShippingOriginAddress address)
        {
            address.Country = "US"; // TODO: Make this not be US only

            var dc = Mapper.Map<Mozu.SiteSettings.Shipping.Contracts.SiteShippingOriginAddress>(address);

            var origin = _siteShippingSettingsClient.UpdateShippingOriginAddress(dc).Result.ReadAsSync();
            var siteShippingOriginAddress = Mapper.Map<SiteShippingOriginAddress>(origin);
            return Single(siteShippingOriginAddress);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/originaddress/create")]
        public Task<Response<SiteShippingOriginAddress>> CreateOriginAddress(SiteShippingOriginAddress a)
        {
            a.SenderName = "Auto generated";
            a.Country = "US";

            var o = Mapper.Map<Mozu.SiteSettings.Shipping.Contracts.SiteShippingOriginAddress>(a);

            var origin = _siteShippingSettingsClient.CreateShippingOriginAddress(o).Result.ReadAsSync();

            var siteShippingOriginAddress = Mapper.Map<SiteShippingOriginAddress>(origin);
            return Single(siteShippingOriginAddress);
        }

        [WebGet(UriTemplate = "/settings/read")]
        public Task<Response<SiteShippingSettings>> GetSetting()
        {
            var setting = _siteShippingSettingsClient.GetSiteSettings().Result.ReadAsSync();

            var siteShippingSettings = Mapper.Map<SiteShippingSettings>(setting);

            return Single(siteShippingSettings);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/settings/edit")]
        public Task<Response<SiteShippingSettings>> UpdateSetting(SiteShippingSettings request)
        {
            var setting = _siteShippingSettingsClient.UpsertActiveRateProviderShippingOriginAddressAndShippingRegions(Mapper.Map<Mozu.SiteSettings.Shipping.Contracts.SiteShippingSettings>(request)).Result.ReadAsSync();

            var siteShippingSettings = Mapper.Map<SiteShippingSettings>(setting);

            return Single(siteShippingSettings);
        }

        // TODO: This is a dupe so maybe we get rid of it.

        [WebInvoke(Method = "POST", UriTemplate = "/settings/create")]
        public Task<Response<SiteShippingSettings>> CreateSetting(SiteShippingSettings request)
        {
            var setting = _siteShippingSettingsClient.UpsertActiveRateProviderShippingOriginAddressAndShippingRegions(Mapper.Map<Mozu.SiteSettings.Shipping.Contracts.SiteShippingSettings>(request)).Result.ReadAsSync();

            var siteShippingSettings = Mapper.Map<SiteShippingSettings>(setting);

            return Single(siteShippingSettings);
        }

        private int GetRateClassId(string key)
        {
            var classes = _shippingClassClient.GetShippingClasses(0, 100, null, null).Result.ReadAsSync();
            var customClass = classes.Items.SingleOrDefault(x => x.InternalName == key);
            return (customClass == null) ? 0 : customClass.ShippingClassId;
        }
    }
}