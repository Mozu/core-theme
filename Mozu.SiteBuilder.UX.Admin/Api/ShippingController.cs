using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Core;
using Mozu.Core.Api.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
//using Mozu.ShippingAdmin.Contracts;
using Mozu.ShippingAdmin.Contracts.Clients;

//using Mozu.SiteSettings.Shipping.Contracts.Clients;
//using Mozu.UspsShippingAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping;
using Mozu.SiteSettings.Shipping.Contracts.Clients;

//using ShippingClass = Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping.ShippingClass;
//using ShippingRate = Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping.ShippingRate;

//using Volusion.UspsShippingAdmin.WebApi.Clients;

//using Mozu.ShippingRuntime.Contracts.Clients;
//using Volusion.UspsShippingAdmin.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class ShippingController : BaseController
    {
        private readonly IShippingClassWebApiClient _shippingClassClient;

        private readonly ICarrierConfigurationWebApiClient _carrierConfigurationWebApiClient;
        private readonly IShippingSettingsWebApiClient _siteShippingSettingsClient;
        private readonly ICarrierConfigurationGlobalWebApiClient _carrierConfigurationGlobalWebApiClient;
        private static Dictionary<string, string> FeatureDic; 

        static ShippingController()
        {
            FeatureDic = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase );
            FeatureDic[Mozu.ShippingAdmin.Contracts.Constants.Custom.CarrierId] = SiteSettings.Shipping.Contracts.Constants.RateProviders.Mozu.Custom;
            FeatureDic[Mozu.ShippingAdmin.Contracts.Constants.FedEx.CarrierId] = SiteSettings.Shipping.Contracts.Constants.RateProviders.Mozu.FedEx;
            FeatureDic[Mozu.ShippingAdmin.Contracts.Constants.Ups.CarrierId] = SiteSettings.Shipping.Contracts.Constants.RateProviders.Mozu.Ups;
            FeatureDic[Mozu.ShippingAdmin.Contracts.Constants.Usps .CarrierId] = SiteSettings.Shipping.Contracts.Constants.RateProviders.Mozu.Usps ;
            


        }
        public ShippingController(ICarrierConfigurationWebApiClient carrierConfigurationWebApiClient, IShippingSettingsWebApiClient siteShippingSettingsClient, ICarrierConfigurationGlobalWebApiClient carrierConfigurationGlobalWebApiClient,   IApiContext apiCtx)
        {
            _carrierConfigurationWebApiClient = carrierConfigurationWebApiClient;
            _siteShippingSettingsClient = siteShippingSettingsClient;
            _carrierConfigurationGlobalWebApiClient = carrierConfigurationGlobalWebApiClient;


            // _siteShippingSettingsClient.UpdateSiteShippingSettings(new SiteSettings.Shipping.Contracts.SiteShippingSettings())

            Mozu.ShippingAdmin.Contracts.Clients.ICarrierConfigurationGlobalWebApiClient global;
            Mozu.ShippingAdmin.Contracts.Clients.ICarrierConfigurationWebApiClient  reg;

            //Contact
            

        }
        //public class CarrierConfig
        //{
        //    public string id { get; set; }
        //    public bool IsConfigureed { get; set; }
        //    public Newtonsoft.Json.Linq.JObject settings { get; set; }
        //    public List<string> rates { get; set; }


        //}


        [WebGet(UriTemplate = "Settings/read")]
        public async Task<Response<SiteShippingSettings>> GetSettings()
        {
            var res = (await _siteShippingSettingsClient.GetSiteShippingSettings()).ReadAsSync();
            var custSettings = (await _carrierConfigurationWebApiClient.GetConfiguration(Mozu.ShippingAdmin.Contracts.Constants.Custom.CarrierId)).ReadAsSync();
            var settings = Mapper.Map<SiteShippingSettings>(res);
            settings.CustomRate = Mapper.Map<CustomRate>(custSettings);
            settings.CustomRate.IsEnabled = res.ActiveRateProviders.Any(x => x.Name == SiteSettings.Shipping.Contracts.Constants.RateProviders.Mozu.Custom);

          
            return Single2<SiteShippingSettings>(settings );
        }


        [WebInvoke(UriTemplate = "Settings/edit")]
        public async Task<Response<SiteShippingSettings>> EditSettings(SiteShippingSettings settings )
        {
            var dc = Mapper.Map<Mozu.SiteSettings.Shipping.Contracts.SiteShippingSettings>(settings);
            var custSettings = Mapper.Map<Mozu.ShippingAdmin.Contracts.CarrierConfiguration>(settings.CustomRate);

            
            var customFeature = dc.ActiveRateProviders.FirstOrDefault(x => x.Name == SiteSettings.Shipping.Contracts.Constants.RateProviders.Mozu.Custom  );
            if (customFeature!= null )
            {
                if (!settings.CustomRate.IsEnabled.GetValueOrDefault( true ))
                {
                    dc.ActiveRateProviders.Remove(customFeature);
                }
            }
            else
            {
                if (settings.CustomRate.IsEnabled.GetValueOrDefault(true))
                {
                    dc.ActiveRateProviders.Add(new Core.Api.Contracts.Feature() 
                                                   {
                                                       Name = SiteSettings.Shipping.Contracts.Constants.RateProviders.Mozu.Custom 
                                                   });
                }
            }


            var res = (await _siteShippingSettingsClient.UpdateSiteShippingSettings( dc)).ReadAsSync();
            if (settings.CustomRate.IsEnabled.GetValueOrDefault(true))
            {
                await _carrierConfigurationWebApiClient.UpdateConfiguration(Mozu.ShippingAdmin.Contracts.Constants.Custom.CarrierId, custSettings);
            }



            return await GetSettings();
            //return Single2<SiteShippingSettings>(settings);
        }

        [WebGet(UriTemplate = "carrierRates")]
        public async Task<Response<List<KeyValuePair<string, string>>>> GetAllCarrierRates(string id)
        {
            var res = (await _carrierConfigurationGlobalWebApiClient.GetServiceTypes(id, "en-US")).ReadAsSync();

            var ret = res.Select(x => new KeyValuePair<string, string>(x.Code, x.Content != null ? x.Content.Name : x.Code)).ToList();
            return List2(ret);

        }

        [WebGet(UriTemplate = "configuredRates")]
        public async Task<Response<List<KeyValuePair<string, string>>>> GetConfiguredRates()
        {
            var res = (await _carrierConfigurationWebApiClient .GetConfigurations(startIndex:0,pageSize:600)).ReadAsSync();

            var ret = res.Items.SelectMany( x=> x.ConfiguredServiceTypes ).Select(x => new KeyValuePair<string, string>(x.Code , x.Content != null ? x.Content.Name: x.Code)).ToList();
            return List2(ret);

        }



        [WebGet(UriTemplate = "carrierSettings/read")]
        public async Task<Response<List<CarrierConfiguration>>> GetCarrierSettings()
        {
            var res = (await _carrierConfigurationWebApiClient.GetConfigurations(startIndex: 0, pageSize: 600)).ReadAsSync();
            var settings = Mapper.Map<List<CarrierConfiguration>>(res.Items );
            if (!settings.Any(x => x.id == Mozu.ShippingAdmin.Contracts.Constants.FedEx.CarrierId ))
            {
                settings.Add(new CarrierConfiguration() { id = Mozu.ShippingAdmin.Contracts.Constants.FedEx.CarrierId, IsConfigured = false });
            }
            if (!settings.Any(x => x.id == Mozu.ShippingAdmin.Contracts.Constants.Ups.CarrierId  ))
            {
                settings.Add(new CarrierConfiguration() { id = Mozu.ShippingAdmin.Contracts.Constants.Ups.CarrierId, IsConfigured = false });
            }
            if (!settings.Any(x => x.id == Mozu.ShippingAdmin.Contracts.Constants.Usps .CarrierId ))
            {
                settings.Add(new CarrierConfiguration() { id = Mozu.ShippingAdmin.Contracts.Constants.Usps.CarrierId, IsConfigured = false });
            }
            if (!settings.Any(x => x.id == Mozu.ShippingAdmin.Contracts.Constants.Custom .CarrierId))
            {
                settings.Add(new CarrierConfiguration() { id = Mozu.ShippingAdmin.Contracts.Constants.Custom.CarrierId , IsConfigured = false });
            }
            return List2<CarrierConfiguration>(settings);
        }


        [WebInvoke(UriTemplate = "carrierSettings/edit")]
        public async Task<Response<List<CarrierConfiguration>>> EditCarrierSettings(List<CarrierConfiguration> settings)
        {

            var ret = new List<CarrierConfiguration>();

            var activeProviders = (await _siteShippingSettingsClient.GetActiveRateProviders()).ReadAsSync();


            foreach (var setting in settings)
            {
               
                var dcConfigRes = (await _carrierConfigurationWebApiClient.GetConfiguration(setting.id));
                if (dcConfigRes.ResponseMessage.IsSuccessStatusCode )
                {
                    setting.PreviousValue = dcConfigRes.ReadAsSync ();
                }
                
                var dcConfig = Mapper.Map<Mozu.ShippingAdmin.Contracts.CarrierConfiguration>(setting);
                if (dcConfig.Settings == null || dcConfig.Settings.Count == 0 || dcConfig.Settings.All(x => x == null || string.IsNullOrEmpty(x.Value )))
                {
                    continue;
                }
                var featureId = FeatureDic[dcConfig.Id];
                if (!activeProviders.Any(x => x.Name == featureId))
                {
                    activeProviders.Add(new Core.Api.Contracts.Feature()
                                            {
                                                Name = featureId
                                            });

                    activeProviders = (await _siteShippingSettingsClient.UpdateActiveRateProviders( activeProviders)).ReadAsSync();

                }

                if (setting.PreviousValue != null)
                {
                    dcConfig = (await _carrierConfigurationWebApiClient.UpdateConfiguration(setting.id, dcConfig)).ReadAsSync();
                }
                else
                {
                    dcConfig = (await _carrierConfigurationWebApiClient.CreateConfiguration( setting.id, dcConfig)).ReadAsSync();
                }
                ret.Add(Mapper.Map<CarrierConfiguration>(dcConfig));

            }
            return List2(ret);
          
        }


       

        //public class FlatRate
        //{
        //    public 
        //}
        
      


        //[WebGet(UriTemplate = "activerateprovider/read")]
        //public Task<Response<Feature>> GetActiveRateProvider()
        //{
        //    var activeRateProvider = _siteShippingSettingsClient.GetActiveRateProvider().Result.ReadAsAsync().Result;

        //    Feature feature = null;

        //    if (activeRateProvider != null)
        //    {
        //        feature = new Feature
        //        {
        //            Id = activeRateProvider.Id,
        //            Name = activeRateProvider.Name,
        //            Version = activeRateProvider.Version
        //        };
        //    }

        //    return Single(feature);
        //}

        //[WebGet(UriTemplate = "activerateprovider/set/?id={id}")]
        //public Task<Response<Feature>> SetActiveRateProvider(int id)
        //{
        //    var activeRateProvider = _siteShippingSettingsClient.UpdateActiveRateProvider(new Mozu.Core.Api.Contracts.Feature { Id = id, Name = (id == 1) ? "customrates" : "uspsrates" }).Result.ReadAsAsync().Result;

        //    Feature feature = null;

        //    if (activeRateProvider != null)
        //    {
        //        feature = new Feature
        //        {
        //            Id = activeRateProvider.Id,
        //            Name = activeRateProvider.Name,
        //            Version = activeRateProvider.Version
        //        };
        //    }

        //    return Single(feature);
        //}

        //[WebGet(UriTemplate = "class/read")]
        //public Task<Response<List<ShippingClass>>> GetShippingClasses()
        //{
        //    var classes = _shippingClassClient.GetShippingClasses(0, 1000, null, null).Result.ReadAsAsync();

        //    var shippingClasses = Mapper.Map<List<ShippingClass>>(classes.Result.Items);

        //    return List(shippingClasses, 1);
        //}

        //[WebInvoke(Method = "POST", UriTemplate = "rate/create")]
        //public Task<Response<List<ShippingRate>>> CreateShippingRate(List<ShippingRate> rates)
        //{
        //    var ret = new List<ShippingRate>();

        //    foreach (var shippingRate in rates)
        //    {
        //        shippingRate.ShippingRateId = null;
        //        var rate = Mapper.Map<Mozu.ProductAdmin.Contracts.ShippingRate>(shippingRate);
        //        var res = _shippingRateClient.CreateShippingRate(rate).Result.ReadAsSync();
        //        ret.Add(Mapper.Map<ShippingRate>(res));
        //    }

        //    return List(ret, 1);
        //}

        //[WebInvoke(Method = "POST", UriTemplate = "rate/delete")]
        //public Task<Response<List<ShippingRate>>> DeleteShippingRate(List<ShippingRate> rates)
        //{
        //    var ret = (from shippingRate in rates let res = _shippingRateClient.DeleteShippingRate(shippingRate.ShippingRateId).Result.ReadAsAsync().Result select Mapper.Map<ShippingRate>(shippingRate)).ToList();

        //    return List(ret);
        //}

        //[WebInvoke(Method = "POST", UriTemplate = "rate/edit")]
        //public Task<Response<List<ShippingRate>>> UpdateShippingRate(List<ShippingRate> rates)
        //{
        //    var ret = (from shippingRate in rates
        //               select Mapper.Map<Mozu.ProductAdmin.Contracts.ShippingRate>(shippingRate)
        //                   into rate
        //                   select _shippingRateClient.UpdateShippingRate(rate, rate.ShippingRateId).Result.ReadAsSync()
        //                       into res
        //                       select Mapper.Map<ShippingRate>(res)).ToList();

        //    return List(ret, 1);
        //}

        //[WebGet(UriTemplate = "domesticrates/read")]
        //public Task<Response<List<ShippingRate>>> GetDomesticRates()
        //{
        //    List<ShippingRate> domesticRates = null;

        //    var rates = _shippingRateClient.GetShippingRates(0, 100, null, "shippingclassid eq " + GetRateClassId("Custom rates")).Result.ReadAsSync();

        //    if (rates.Items != null)
        //    {
        //        var customRates = Mapper.Map<List<ShippingRate>>(rates.Items.ToList());
        //        domesticRates = customRates.Where(shippingRate => !shippingRate.IsInternational).ToList();
        //    }

        //    return List(domesticRates, 1);
        //}

        //[WebGet(UriTemplate = "internationalrates/read")]
        //public Task<Response<List<ShippingRate>>> GetInternationalRates()
        //{
        //    List<ShippingRate> intlRates = null;

        //    var rates = _shippingRateClient.GetShippingRates(0, 100, null, "shippingclassid eq " + GetRateClassId("Custom rates")).Result.ReadAsSync();

        //    if (rates.Items != null)
        //    {
        //        var customRates = Mapper.Map<List<ShippingRate>>(rates.Items.ToList());
        //        intlRates = customRates.Where(shippingRate => shippingRate.IsInternational).ToList();
        //    }

        //    return List(intlRates, 1);
        //}

        //[WebGet(UriTemplate = "uspsglobalshared/read")]
        //public Task<Response<List<SharedShippingMethod>>> GetUspsSharedShippingMethods(PagingParamaters pagingParams, FilterCollection extFilter)
        //{
        //    if (pagingParams.id == null)
        //    {
        //        string filter = null;
        //        string isInternational;

        //        if (extFilter.TryGetValue("isinternational", out isInternational))
        //        {
        //            bool val;

        //            if (bool.TryParse(isInternational, out val))
        //            {
        //                filter = (val) ? "isinternational eq true" : "isinternational ne true";
        //            }
        //        }

        //        var res = _uspsShippingSharedClient.GetSharedOrGlobalShippingMethods(null, null, null, filter).Result.ReadAsSync();
        //        var methods = Mapper.Map<List<SharedShippingMethod>>(res.Items);

        //        return List(methods);
        //    }

        //    return EmptyList<SharedShippingMethod>();
        //}

        //[WebInvoke(Method = "POST", UriTemplate = "uspsconfig/create")]
        //public Task<Response<UspsConfiguration>> CreateUspsConfiguration(UspsConfiguration model)
        //{
        //    var cfg = Mapper.Map<UspsConfiguration>(_uspsShippingInstanceClient.CreateUspsConfiguration(Mapper.Map<Mozu.UspsShippingAdmin.Contracts.UspsConfiguration>(model)).Result.ReadAsAsync().Result);

        //    return Single(cfg);
        //}

        //[WebGet(UriTemplate = "uspsconfig/read")]
        //public Task<Response<UspsConfiguration>> GetUspsConfiguration(PagingParamaters pagingParams, FilterCollection extFilter)
        //{
        //    UspsConfiguration res = null;

        //    try
        //    {
        //        res = Mapper.Map<UspsConfiguration>(_uspsShippingInstanceClient.GetUspsConfiguration().Result.ReadAsAsync().Result);
        //    }
        //    catch (Exception)
        //    {
        //        // Ugh... if a config doesn't exist it throws an error. Return null.    
        //    }

        //    return Single(res);
        //}

        //[WebInvoke(Method = "POST", UriTemplate = "uspsconfig/edit")]
        //public Task<Response<UspsConfiguration>> UpdateUspsConfiguration(UspsConfiguration model)
        //{
        //    var cfg = Mapper.Map<UspsConfiguration>(_uspsShippingInstanceClient.UpdateUspsConfiguration(Mapper.Map<Mozu.UspsShippingAdmin.Contracts.UspsConfiguration>(model)).Result.ReadAsAsync().Result);

        //    return Single(cfg);
        //}

        //[WebGet(UriTemplate = "regions/read")]
        //public Task<Response<List<SiteShippingRegion>>> GetShippingRegions()
        //{
        //    var regions = Mapper.Map<List<SiteShippingRegion>>(_siteShippingSettingsClient.GetShippingRegions().Result.ReadAsSync());

        //    return List(regions, 1);
        //}

        //[WebInvoke(Method = "POST", UriTemplate = "regions/edit")]
        //public Task<Response<List<SiteShippingRegion>>> UpdateShippingRegions(List<SiteShippingRegion> r)
        //{
        //    var dc = Mapper.Map<List<Mozu.SiteSettings.Shipping.Contracts.SiteShippingRegion>>(r);
        //    var regions = _siteShippingSettingsClient.UpdateShippingRegions(dc).Result.ReadAsSync();

        //    var siteShippingRegions = Mapper.Map<List<SiteShippingRegion>>(regions);
        //    return List(siteShippingRegions, 1);
        //}

        //[WebGet(UriTemplate = "originaddress/read")]
        //public Task<Response<SiteShippingOriginAddress>> GetOriginAddress()
        //{
        //    SiteShippingOriginAddress origin = null;

        //    try
        //    {
        //        origin = Mapper.Map<SiteShippingOriginAddress>(_siteShippingSettingsClient.GetShippingOriginAddress().Result.ReadAsSync());
        //    }
        //    catch (Exception)
        //    {
        //        // This throws a stupid exception when an address doesn't exist. Return null
        //    }

        //    return Single(origin);
        //}

        //[WebInvoke(Method = "POST", UriTemplate = "originaddress/edit")]
        //public Task<Response<SiteShippingOriginAddress>> UpdateOriginAddress(SiteShippingOriginAddress address)
        //{
        //    address.Country = "US"; // TODO: Make this not be US only

        //    var dc = Mapper.Map<Mozu.SiteSettings.Shipping.Contracts.SiteShippingOriginAddress>(address);

        //    var origin = _siteShippingSettingsClient.UpdateShippingOriginAddress(dc).Result.ReadAsSync();
        //    var siteShippingOriginAddress = Mapper.Map<SiteShippingOriginAddress>(origin);
        //    return Single(siteShippingOriginAddress);
        //}

        //[WebInvoke(Method = "POST", UriTemplate = "originaddress/create")]
        //public Task<Response<SiteShippingOriginAddress>> CreateOriginAddress(SiteShippingOriginAddress a)
        //{
        //    a.SenderName = "Auto generated";
        //    a.Country = "US";

        //    var o = Mapper.Map<Mozu.SiteSettings.Shipping.Contracts.SiteShippingOriginAddress>(a);

        //    var origin = _siteShippingSettingsClient.CreateShippingOriginAddress(o).Result.ReadAsSync();

        //    var siteShippingOriginAddress = Mapper.Map<SiteShippingOriginAddress>(origin);
        //    return Single(siteShippingOriginAddress);
        //}

        //[WebGet(UriTemplate = "settings/read")]
        //public Task<Response<SiteShippingSettings>> GetSetting()
        //{
        //    var setting = _siteShippingSettingsClient.GetSiteSettings().Result.ReadAsSync();

        //    var siteShippingSettings = Mapper.Map<SiteShippingSettings>(setting);

        //    return Single(siteShippingSettings);
        //}

        //[WebInvoke(Method = "POST", UriTemplate = "settings/edit")]
        //public Task<Response<SiteShippingSettings>> UpdateSetting(SiteShippingSettings request)
        //{
        //    var setting = _siteShippingSettingsClient.UpsertActiveRateProviderShippingOriginAddressAndShippingRegions(Mapper.Map<Mozu.SiteSettings.Shipping.Contracts.SiteShippingSettings>(request)).Result.ReadAsSync();

        //    var siteShippingSettings = Mapper.Map<SiteShippingSettings>(setting);

        //    return Single(siteShippingSettings);
        //}

        //// TODO: This is a dupe so maybe we get rid of it.

        //[WebInvoke(Method = "POST", UriTemplate = "settings/create")]
        //public Task<Response<SiteShippingSettings>> CreateSetting(SiteShippingSettings request)
        //{
        //    var setting = _siteShippingSettingsClient.UpsertActiveRateProviderShippingOriginAddressAndShippingRegions(Mapper.Map<Mozu.SiteSettings.Shipping.Contracts.SiteShippingSettings>(request)).Result.ReadAsSync();

        //    var siteShippingSettings = Mapper.Map<SiteShippingSettings>(setting);

        //    return Single(siteShippingSettings);
        //}

        //private int GetRateClassId(string key)
        //{
        //    var classes = _shippingClassClient.GetShippingClasses(0, 100, null, null).Result.ReadAsSync();
        //    var customClass = classes.Items.SingleOrDefault(x => x.InternalName == key);
        //    return (customClass == null) ? 0 : customClass.ShippingClassId;
        //}
    }
}