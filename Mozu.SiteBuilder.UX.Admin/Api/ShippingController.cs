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
using Mozu.Core.Api.Routing;
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
    [WebApi("app/shipping", SuppressDescriptorGeneration = true)]
    public class ShippingController : BaseController
    {
        

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


		[HttpGetRoute(UriTemplate = "Settings/read")]
        public async Task<Response<SiteShippingSettings>> GetSettings()
        {
            var res = (await _siteShippingSettingsClient.GetSiteShippingSettings()).ReadAsSync();
            var custSettings = (await _carrierConfigurationWebApiClient.GetConfiguration(Mozu.ShippingAdmin.Contracts.Constants.Custom.CarrierId)).ReadAsSync();
            var settings = Mapper.Map<SiteShippingSettings>(res);
            settings.CustomRate = Mapper.Map<CustomRate>(custSettings);
            //settings.CustomRate.IsEnabled = res.ActiveRateProviders.Any(x => x.Name == SiteSettings.Shipping.Contracts.Constants.RateProviders.Mozu.Custom);

          
            return Single2<SiteShippingSettings>(settings );
        }


        [HttpPostRoute(UriTemplate = "Settings/edit")]
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

		[HttpGetRoute(UriTemplate = "carrierRates")]
        public async Task<Response<List<KeyValuePair<string, string>>>> GetAllCarrierRates(string id = null )
        {
            if (!string.IsNullOrEmpty(id))
            {
                var res = (await _carrierConfigurationGlobalWebApiClient.GetServiceTypes(id, "en-US")).ReadAsSync();

                var ret = res.Select(x => new KeyValuePair<string, string>(x.Code, x.Content != null ? x.Content.Name : x.Code)).ToList();
                return List2(ret);
            }
            else
            {
                var ret = new List<KeyValuePair<string, string>>();
                foreach (var rp in (await _siteShippingSettingsClient.GetSiteShippingSettings()).ReadAsSync().ActiveRateProviders.Select(x => x.Name))
                {
                    var key = FeatureDic.Where(x => string.Equals(x.Value, rp, StringComparison.OrdinalIgnoreCase)).Select(x => x.Key).First();
                    var cConfig = (await _carrierConfigurationGlobalWebApiClient.GetServiceTypes(key, "en-US")).ReadAsSync();

                    ret.AddRange(cConfig.Select(x => new KeyValuePair<string, string>(x.Code, x.Content != null ? x.Content.Name : x.Code)));
                }
               return List2(ret);
            }

        }

		[HttpGetRoute(UriTemplate = "configuredRates")]
        public async Task<Response<List<KeyValuePair<string, string>>>> GetConfiguredRates()
        {
            var res = (await _carrierConfigurationWebApiClient .GetConfigurations(startIndex:0,pageSize:600)).ReadAsSync();

            var ret = res.Items.SelectMany( x=> x.ConfiguredServiceTypes ).Select(x => new KeyValuePair<string, string>(x.Code , x.Content != null ? x.Content.Name: x.Code)).ToList();
            return List2(ret);

        }



        [HttpGetRoute(UriTemplate = "carrierSettings/read")]
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


        [HttpPostRoute(UriTemplate = "carrierSettings/edit")]
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


   
    }
}