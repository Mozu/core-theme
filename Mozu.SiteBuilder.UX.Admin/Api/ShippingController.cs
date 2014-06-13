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
using Burrows.Exceptions;
using MongoDB.Driver;
using Mozu.Core;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Contracts.Provisioning;
using Mozu.Core.Api.Routing;
using Mozu.Core.Domain;
using Mozu.Location.Contracts;
using Mozu.Location.Contracts.Clients;
using Mozu.ProductAdmin.Contracts.Clients;
//using Mozu.ShippingAdmin.Contracts;
using Mozu.ShippingAdmin.Contracts.Clients;
using DC = Mozu.ShippingAdmin.Contracts;
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
        private readonly ILocationSettingsWebApiClient _locationSettingsWebApiClient;
        private readonly ITargetRulesWebApiClient _targetRulesWebApiClient;
        private readonly IShippingProfileWebApiClient _shippingProfileWebApiClient;
        private readonly IShippingAdminProvisioningWebApiClient _shippingAdminProvisioningWebApiClient;
        private static Dictionary<string, string> FeatureDic;

        static ShippingController()
        {
            FeatureDic = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            FeatureDic[Mozu.ShippingAdmin.Contracts.Constants.Custom.CarrierId] = SiteSettings.Shipping.Contracts.Constants.RateProviders.Mozu.Custom;
            FeatureDic[Mozu.ShippingAdmin.Contracts.Constants.FedEx.CarrierId] = SiteSettings.Shipping.Contracts.Constants.RateProviders.Mozu.FedEx;
            FeatureDic[Mozu.ShippingAdmin.Contracts.Constants.Ups.CarrierId] = SiteSettings.Shipping.Contracts.Constants.RateProviders.Mozu.Ups;
            FeatureDic[Mozu.ShippingAdmin.Contracts.Constants.Usps.CarrierId] = SiteSettings.Shipping.Contracts.Constants.RateProviders.Mozu.Usps;

            

        }

        public ShippingController(ICarrierConfigurationWebApiClient carrierConfigurationWebApiClient, IShippingSettingsWebApiClient siteShippingSettingsClient, ICarrierConfigurationGlobalWebApiClient carrierConfigurationGlobalWebApiClient, IApiContext apiCtx, Mozu.Location.Contracts.Clients.ILocationSettingsWebApiClient locationSettingsWebApiClient, ITargetRulesWebApiClient targetRulesWebApiClient, IShippingProfileWebApiClient shippingProfileWebApiClient, IShippingAdminProvisioningWebApiClient shippingAdminProvisioningWebApiClient)
        {
            _carrierConfigurationWebApiClient = carrierConfigurationWebApiClient;
            _siteShippingSettingsClient = siteShippingSettingsClient;
            _carrierConfigurationGlobalWebApiClient = carrierConfigurationGlobalWebApiClient;
            _locationSettingsWebApiClient = locationSettingsWebApiClient;
            _targetRulesWebApiClient = targetRulesWebApiClient;
            _shippingProfileWebApiClient = shippingProfileWebApiClient;
            _shippingAdminProvisioningWebApiClient = shippingAdminProvisioningWebApiClient;
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
            var locRes = (await _locationSettingsWebApiClient.GetLocationUsages()).ReadAsSync();
            DC.CarrierConfiguration custSettings = null;
            try
            {
                custSettings = (await _carrierConfigurationWebApiClient.GetConfiguration(Mozu.ShippingAdmin.Contracts.Constants.Custom.CarrierId)).ReadAsSync();
            }
            catch
            {
                custSettings = new DC.CarrierConfiguration();
            }
            var settings = Mapper.Map<SiteShippingSettings>(res);
            settings.CustomRates = Mapper.Map<List<CustomTableRate>>(custSettings.CustomTableRates);

            settings.ShippingLocationCode = locRes.Items.Where(x => x.LocationUsageTypeCode == "DS").Select(x => x.LocationCodes != null && x.LocationCodes.Count > 0 ? x.LocationCodes.First() : null).FirstOrDefault();

            settings.StorePickupLocationTypeCodes = locRes.Items.Where(x => x.LocationUsageTypeCode == "SP").First().LocationTypeCodes;
            settings.EnableInStorePickup = settings.StorePickupLocationTypeCodes != null && settings.StorePickupLocationTypeCodes.Count > 0;

            return Single2<SiteShippingSettings>(settings);
        }


        [HttpPostRoute(UriTemplate = "Settings/edit")]
        public async Task<Response<SiteShippingSettings>> EditSettings(SiteShippingSettings settings)
        {




            if (!string.IsNullOrEmpty(settings.ShippingLocationCode))
            {
                var ret1 = await _locationSettingsWebApiClient.UpdateLocationUsage("DS", new LocationUsage()
                                                                                         {
                                                                                             LocationUsageTypeCode = "DS",
                                                                                             LocationCodes = new List<string> {settings.ShippingLocationCode}
                                                                                         });
                if (ret1.HasException)
                {
                    throw ret1.ReadException();
                }
            }

            var ret2 = await _locationSettingsWebApiClient.UpdateLocationUsage("SP", new LocationUsage()
                                                                                     {
                                                                                         LocationUsageTypeCode = "SP",
                                                                                         LocationTypeCodes = settings.EnableInStorePickup == true ? settings.StorePickupLocationTypeCodes : new List<string>()
                                                                                     });

            if (ret2.HasException)
            {
                throw ret2.ReadException();
            }

            var dcSettings = Mapper.Map<Mozu.SiteSettings.Shipping.Contracts.SiteShippingSettings>(settings);
            await _siteShippingSettingsClient.UpdateOrderHandlingFee(dcSettings.OrderHandlingFee);

            var carrierConfiguration = (await _carrierConfigurationWebApiClient.GetConfiguration(Mozu.ShippingAdmin.Contracts.Constants.Custom.CarrierId)).ReadAsSync();

            carrierConfiguration.CustomTableRates = Mapper.Map<List<DC.CustomTableRate>>(settings.CustomRates);

            var res = await _carrierConfigurationWebApiClient.UpdateConfiguration(Mozu.ShippingAdmin.Contracts.Constants.Custom.CarrierId, carrierConfiguration);
            if (res.HasException)
            {
                throw (res.ReadException());
            }







            return await GetSettings();

        }


        [HttpGetRoute(UriTemplate = "rules/read")]
        public async Task<Response<List<Mozu.ShippingAdmin.Contracts.TargetRule>>> RuleRead([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter, [FromUri]string domain= null)
        {
            if (!string.IsNullOrEmpty(pagingParams.id))
            {
                var single = ((await _targetRulesWebApiClient.GetTargetRule(pagingParams.id)).ReadAsSync());
                return this.List2(single);

            }
            //todo:uncomment when service supports filtering
            //var resp = ((await _targetRulesWebApiClient.GetTargetRules(startIndex: pagingParams.startIndex, pageSize: pagingParams.pageSize, filter: "domain eq \"" + domain+"\"")).ReadAsSync());
            var resp = ((await _targetRulesWebApiClient.GetTargetRules(startIndex: pagingParams.startIndex, pageSize: pagingParams.pageSize)).ReadAsSync());
            var items = resp.Items.Where(x => x.Domain == domain).ToList();
            return this.List2(items, resp.TotalCount);

        }

        [HttpPostRoute(UriTemplate = "rules/edit")]
        public async Task<Response<List<Mozu.ShippingAdmin.Contracts.TargetRule>>> RuleEdit(List<Mozu.ShippingAdmin.Contracts.TargetRule> targets)
        {
            var tasks = targets.Select(x => _targetRulesWebApiClient.UpdateTargetRule(x.Code, x)).ToList();
            await Task.WhenAll(tasks);
            targets.Clear();
            targets = tasks.Select(x => x.Result.ReadAsSync()).ToList();
            return this.List2(targets);

        }



        [HttpPostRoute(UriTemplate = "rules/delete")]
        public async Task<Response<List<bool>>> RuleDelete(List<Mozu.ShippingAdmin.Contracts.TargetRule> targets)
        {
            var tasks = targets.Select(x => _targetRulesWebApiClient.DeleteTargetRule(  x.Code )).ToList();
            await Task.WhenAll(tasks);
             tasks.ForEach(x =>
            {
                if (!x.Result.ResponseMessage.IsSuccessStatusCode)
                {
                    throw x.Result.ReadException();
                }
               
            });
            return this.List2(new List<bool>());
        }




        [HttpPostRoute(UriTemplate = "rules/create")]
        public async Task<Response<List<Mozu.ShippingAdmin.Contracts.TargetRule>>> RuleCreate(List<Mozu.ShippingAdmin.Contracts.TargetRule> targets)
        {
            var tasks = targets.Select(x => _targetRulesWebApiClient.CreateTargetRule(x)).ToList();
            await Task.WhenAll(tasks);
            targets = tasks.Select(x => x.Result.ReadAsSync()).ToList();
            return this.List2(targets);
        }


        async Task<string> GetProfileCode(bool? flag= null  )
        {
            var res = await _shippingProfileWebApiClient.GetProfiles();
            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                var profiles = res.ReadAsSync().Items;
                if (profiles != null)
                {
                    var profile = profiles.FirstOrDefault(x => x.TargetedSiteIds != null && x.TargetedSiteIds.Contains(SbApiContext.SiteId.Value));
                    if (profile != null)
                    {
                        return profile.Code;
                    }
                }
            }

            if (flag.HasValue && flag.Value)
            {
                throw new InvalidOperationException("doh");
            }

            await _shippingAdminProvisioningWebApiClient.CreateSite(new CreateSiteRequest()
                                                              {
                                                                  CatalogId = this.SbApiContext.CatalogId,
                                                                  SiteId = this.SbApiContext.SiteId.Value ,
                                                                  TenantId = this.SbApiContext.TenantId
                                                              },1);

            
            return await GetProfileCode(true );

        }

        [HttpGetRoute(UriTemplate = "ShippingInclusionRules/read")]
        public async Task<Response<List<Mozu.ShippingAdmin.Contracts.Profile.ShippingInclusionRule>>> ShippingRuleRead([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            var profileCode = await GetProfileCode();
            if (!string.IsNullOrEmpty(pagingParams.id))
            {
                var single = ( await _shippingProfileWebApiClient.GetShippingInclusionRule( profileCode, pagingParams.id) ).ReadAsSync();
                return this.List2(single);

            }
            var resp = (await _shippingProfileWebApiClient.GetShippingInclusionRules(profileCode)).ReadAsSync();

            return this.List2(resp.Items.OrderBy(x=> x.Sequence).ToList(), resp.TotalCount);

        }

        [HttpPostRoute(UriTemplate = "ShippingInclusionRules/edit")]
        public async Task<Response<List<Mozu.ShippingAdmin.Contracts.Profile.ShippingInclusionRule>>> ShippingRuleEdit(List<Mozu.ShippingAdmin.Contracts.Profile.ShippingInclusionRule> shippingInclusionRules)
        {
            var profileCode = await GetProfileCode();
            var tasks = shippingInclusionRules.Select(x => _shippingProfileWebApiClient.UpdateShippingInclusionRule(profileCode, x.Id, x)).ToList();
            await Task.WhenAll(tasks);
            shippingInclusionRules.Clear();
            shippingInclusionRules = tasks.Select(x => x.Result.ReadAsSync()).OrderBy(x => x.Sequence).ToList();
            return this.List2(shippingInclusionRules);

        }



        [HttpPostRoute(UriTemplate = "ShippingInclusionRules/delete")]
        public async Task<Response<List<bool>>> ShippingRuleDelete(List<Mozu.ShippingAdmin.Contracts.Profile.ShippingInclusionRule> targets)
        {
            var profileCode = await GetProfileCode();
            var tasks = targets.Select(x => _shippingProfileWebApiClient.DeleteShippingInclusionRule(profileCode, x.Id)).ToList();
            await Task.WhenAll(tasks);
            tasks.ForEach(x =>
            {
                if (!x.Result.ResponseMessage.IsSuccessStatusCode)
                {
                    throw x.Result.ReadException();
                }

            });
            return this.List2(new List<bool>());
        }

        [HttpPostRoute(UriTemplate = "ShippingInclusionRules/create")]
        public async Task<Response<List<Mozu.ShippingAdmin.Contracts.Profile.ShippingInclusionRule>>> ShippingRuleCreate(List<Mozu.ShippingAdmin.Contracts.Profile.ShippingInclusionRule> shippingInclusionRules )
        {
            var profileCode = await GetProfileCode();
            var tasks = shippingInclusionRules.Select(x => _shippingProfileWebApiClient.CreateShippingInclusionRule(profileCode, x)).ToList();
            await Task.WhenAll(tasks);
            shippingInclusionRules = tasks.Select(x => x.Result.ReadAsSync()).ToList();
            return this.List2(shippingInclusionRules);
        }


        //product handling fees


        [HttpGetRoute(UriTemplate = "HandlingRules/read")]
        public async Task<Response<List<Mozu.ShippingAdmin.Contracts.Profile.HandlingFeeRule>>> ProductHandlingRuleRead([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter, string applysTo)
        {
            var profileCode = await GetProfileCode();
            if (!string.IsNullOrEmpty(pagingParams.id))
            {
                if (applysTo == "product")
                {
                    var single = (await _shippingProfileWebApiClient.GetProductHandlingFeeRule(profileCode, pagingParams.id)).ReadAsSync();
                    return this.List2(single);
                }
                else
                {
                    var single = (await _shippingProfileWebApiClient.GetOrderHandlingFeeRule(profileCode, pagingParams.id)).ReadAsSync();
                    return this.List2(single);
                }
                
            }
            if (applysTo == "product")
            {
                var resp = (await _shippingProfileWebApiClient.GetProductHandlingFeeRules(profileCode)).ReadAsSync();
                return this.List2(resp.Items.OrderBy(x => x.Sequence).ToList(), resp.TotalCount);
            }
            else
            {
                var resp = (await _shippingProfileWebApiClient.GetOrderHandlingFeeRules(profileCode)).ReadAsSync();
                return this.List2(resp.Items.OrderBy(x => x.Sequence).ToList(), resp.TotalCount);
            }

        }

        [HttpPostRoute(UriTemplate = "HandlingRules/edit")]
        public async Task<Response<List<Mozu.ShippingAdmin.Contracts.Profile.HandlingFeeRule>>> ProductHandlingRuleEdit(List<Mozu.ShippingAdmin.Contracts.Profile.HandlingFeeRule> handlingFeeRules)
        {
            var profileCode = await GetProfileCode();
            var tasks = handlingFeeRules.Select(x => _shippingProfileWebApiClient.UpdateProductHandlingFeeRule(profileCode, x.Id, x)).ToList();
            await Task.WhenAll(tasks);
            handlingFeeRules.Clear();
            handlingFeeRules = tasks.Select(x => x.Result.ReadAsSync()).OrderBy(x => x.Sequence).ToList();
            return this.List2(handlingFeeRules);

        }



        [HttpPostRoute(UriTemplate = "HandlingRules/delete")]
        public async Task<Response<List<bool>>> ProductHandlingRuleDelete(List<Mozu.ShippingAdmin.Contracts.Profile.HandlingFeeRule> targets)
        {
            var profileCode = await GetProfileCode();
            var tasks = targets.Select(x => _shippingProfileWebApiClient.DeleteProductHandlingFeeRule(profileCode, x.Id)).ToList();
            await Task.WhenAll(tasks);
            tasks.ForEach(x =>
            {
                if (!x.Result.ResponseMessage.IsSuccessStatusCode)
                {
                    throw x.Result.ReadException();
                }

            });
            return this.List2(new List<bool>());
        }

        [HttpPostRoute(UriTemplate = "HandlingRules/create")]
        public async Task<Response<List<Mozu.ShippingAdmin.Contracts.Profile.HandlingFeeRule>>> ProductHandlingRuleCreate(List<Mozu.ShippingAdmin.Contracts.Profile.HandlingFeeRule> handlingFeeRules)
        {
            var profileCode = await GetProfileCode();
            if (handlingFeeRules.First().AppliesTo == "product")
            {
                var tasks = handlingFeeRules.Select(x => _shippingProfileWebApiClient.CreateProductHandlingFeeRule(profileCode, x)).ToList();
                await Task.WhenAll(tasks);
                handlingFeeRules = tasks.Select(x => x.Result.ReadAsSync()).ToList();
                return this.List2(handlingFeeRules);
            }
            else
            {
                var tasks = handlingFeeRules.Select(x => _shippingProfileWebApiClient.CreateOrderHandlingFeeRule(profileCode, x)).ToList();
                await Task.WhenAll(tasks);
                handlingFeeRules = tasks.Select(x => x.Result.ReadAsSync()).ToList();
                return this.List2(handlingFeeRules);
            }
        }



        //product handling fees

      






        [HttpGetRoute(UriTemplate = "carrierRates")]
        public async Task<Response<List<KeyValuePair<string, string>>>> GetAllCarrierRates(string id = null )
		{
		    throw new NotImplementedByDesignException("go away");
		}

        /// <summary>
        /// Gets a list of configured carrier rates. This is used to build the "available shipment methods" for orders.
        /// </summary>
        /// <returns></returns>
        [HttpGetRoute(UriTemplate = "carrierRatesWithConfigured")]
        public async Task<Response<List<object>>> GetAllCarrierRatesWithConfiguredInfo()
        {
            var configurations = (await _carrierConfigurationWebApiClient.GetConfigurations(startIndex: 0, pageSize: 600)).ReadAsSync();
            var ret = new List<object>();
            foreach (var rp in Mozu.SiteSettings.Shipping.Contracts.Constants.RateProviders.Mozu.GetAll())
            {
                var key = FeatureDic.Where(x => string.Equals(x.Value, rp, StringComparison.OrdinalIgnoreCase)).Select(x => x.Key).First();
                var configuration = configurations.Items.FirstOrDefault(conf => conf.Id == key);
                if (configuration == null  || !configuration.Enabled)
                    continue;
                var cConfig = (await _carrierConfigurationGlobalWebApiClient.GetCarrierServiceTypes(key, "en-US")).ReadAsSync();
               
                if (key == "custom")
                {
                    var cheese =
                        from customRate in configuration.CustomTableRates
                        select new
                        {
                            Code = customRate.Id,
                            Name = customRate.Content != null ? customRate.Content.Name : customRate.Id,
                            IsProvider = false,
                            RateProvider = key,
                            IsActive = true,
                            RateType = customRate.RateType,
                            IsConfigured = true,
                            CustomValue = customRate.Value
                        };
                    ret.AddRange(cheese);
                }
                else
                {
                    var cheese =
                        from st in cConfig
                        let isConfigured = true
                        select new
                        {
                            Code = st.Code,
                            Name = st.Content != null ? st.Content.Name : st.Code,
                            IsProvider = true,
                            RateProvider = key,
                            IsActive = true,
                            IsInternational = true,
                            Sequence = 0,
                            IsConfigured = isConfigured
                        };
                    ret.AddRange(cheese);
                }
            }

            return List2(ret);
           
        }
    

		[HttpGetRoute(UriTemplate = "configuredRates")]
        public async Task<Response<List<KeyValuePair<string, string>>>> GetConfiguredRates()
        {
            throw new NotImplementedByDesignException("go away");

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

           // var activeProviders = (await _siteShippingSettingsClient.GetActiveRateProviders()).ReadAsSync();


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
                //if (!activeProviders.Any(x => x.Name == featureId))
                //{
                //    activeProviders.Add(new Core.Api.Contracts.Feature()
                //                            {
                //                                Name = featureId
                //                            });

                //    activeProviders = (await _siteShippingSettingsClient.UpdateActiveRateProviders( activeProviders)).ReadAsSync();

                //}

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