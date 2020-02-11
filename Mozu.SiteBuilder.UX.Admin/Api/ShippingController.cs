using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Burrows.Exceptions;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Provisioning;
using Mozu.Core.Api.Routing;
using Mozu.Core.Extensions;
using Mozu.Location.Contracts;
using Mozu.Location.Contracts.Clients;
using Mozu.ShippingAdmin.Contracts.Clients;
using Mozu.ShippingAdmin.Contracts.Profile;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping;
//using Mozu.ShippingAdmin.Contracts;
using DC = Mozu.ShippingAdmin.Contracts;
//using Mozu.SiteSettings.Shipping.Contracts.Clients;
//using Mozu.UspsShippingAdmin.Contracts.Clients;

//using Mozu.SiteSettings.Shipping.Contracts.Clients;

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

        private const string SHIPPING_PERCENT_HANDLING_FEE = "percentage_appliesToShippingRate";

        private readonly ICarrierConfigurationWebApiClient _carrierConfigurationWebApiClient;
        // private readonly IShippingSettingsWebApiClient _siteShippingSettingsClient;
        private readonly ICarrierConfigurationGlobalWebApiClient _carrierConfigurationGlobalWebApiClient;
        private readonly ILocationSettingsWebApiClient _locationSettingsWebApiClient;
        private readonly ITargetRulesWebApiClient _targetRulesWebApiClient;
        private readonly IShippingProfileWebApiClient _shippingProfileWebApiClient;
        private readonly IShippingAdminProvisioningWebApiClient _shippingAdminProvisioningWebApiClient;
        private static Dictionary<string, string> FeatureDic;

        static ShippingController()
        {
            FeatureDic = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            FeatureDic[DC.Constants.Custom.CarrierId] = "customrates";
            FeatureDic[DC.Constants.FedEx.CarrierId] = "fedexrates";
            FeatureDic[DC.Constants.Ups.CarrierId] = "upsrates";
            FeatureDic[DC.Constants.Usps.CarrierId] = "uspsrates";



        }


        public static List<string> GetAllRATES()
        {
            List<string> list2 = new List<string>();
            list2.Add("customrates");
            list2.Add("fedexrates");
            list2.Add("upsrates");
            list2.Add("uspsrates");
            return list2;
        }


        public ShippingController(IApiContext apiCtx, ICarrierConfigurationWebApiClient carrierConfigurationWebApiClient,
            ICarrierConfigurationGlobalWebApiClient carrierConfigurationGlobalWebApiClient,
             ILocationSettingsWebApiClient locationSettingsWebApiClient,
            ITargetRulesWebApiClient targetRulesWebApiClient,
            IShippingProfileWebApiClient shippingProfileWebApiClient,
            IShippingAdminProvisioningWebApiClient shippingAdminProvisioningWebApiClient
            )
        {
            _carrierConfigurationWebApiClient = carrierConfigurationWebApiClient;

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


            var locRes = (await _locationSettingsWebApiClient.GetLocationUsages()).ReadAsSync();
            DC.CarrierConfiguration custSettings = null;
            try
            {
                custSettings = (await _carrierConfigurationWebApiClient.GetConfiguration(DC.Constants.Custom.CarrierId)).ReadAsSync();
            }
            catch
            {
                custSettings = new DC.CarrierConfiguration();
            }
            var settings = new SiteShippingSettings();
            settings.CustomRates = Mapper.Map<List<CustomTableRate>>(custSettings.CustomTableRates);

            settings.ShippingLocationCode = locRes.Items.Where(x => x.LocationUsageTypeCode == "DS").Select(x => x.LocationCodes != null && x.LocationCodes.Count > 0 ? x.LocationCodes.First() : null).FirstOrDefault();

            settings.StorePickupLocationTypeCodes = locRes.Items.Where(x => x.LocationUsageTypeCode == "SP").First().LocationTypeCodes;
            settings.EnableInStorePickup = settings.StorePickupLocationTypeCodes != null && settings.StorePickupLocationTypeCodes.Count > 0;

            var profileCode = await GetProfileCode();
            var enabledStates = (await _shippingProfileWebApiClient.GetStates(profileCode)).ReadAsSync();
            settings.EnabledStates = enabledStates.SelectMany(s => s.States).Select(s => s.Code).ToList();

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
                    LocationCodes = new List<string> { settings.ShippingLocationCode }
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

            var carrierConfiguration = (await _carrierConfigurationWebApiClient.GetConfiguration(DC.Constants.Custom.CarrierId)).ReadAsSync();
            carrierConfiguration.CustomTableRates = Mapper.Map<List<DC.CustomTableRate>>(settings.CustomRates);

            if (carrierConfiguration.CustomTableRates != null)
            {
                carrierConfiguration.CustomTableRates.ForEach(x =>
                {
                    x.Content.LocaleCode = x.Content.LocaleCode ?? this.SbApiContext.LocaleCode;
                });
            }

            var res = await _carrierConfigurationWebApiClient.UpdateConfiguration(DC.Constants.Custom.CarrierId, carrierConfiguration);
            if (res.HasException)
            {
                throw (res.ReadException());
            }


            var profileCode = await GetProfileCode();
            var statesResponse = await _shippingProfileWebApiClient.UpdateStates(profileCode,
                ToShippingStates(settings.EnabledStates));

            if (statesResponse.HasException)
            {
                throw (res.ReadException());
            }

            return await GetSettings();

        }

        // handling only US for now.. the current UI design will not scale for other countries anyway ..
        // will address it when the UI can handle other countries.
        List<ShippingStates> ToShippingStates(List<string> stateCodes)
        {

            return new List<ShippingStates>
            {
                new ShippingStates
                {
                    CountryCode = "US",
                    States =
                        new HashSet<State>(
                            stateCodes.Select(sc => new State{ Code = sc, Name = sc}))
                }
            };
        }

        [HttpGetRoute(UriTemplate = "rules/read")]
        public async Task<Response<List<DC.TargetRule>>> RuleRead([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter, [FromUri]string domain = null,[FromUri] string query = null)
        {
            if (!string.IsNullOrEmpty(pagingParams.id))
            {
                var single = ((await _targetRulesWebApiClient.GetTargetRule(pagingParams.id)).ReadAsSync());
                return this.List2(single);
            }

            string filterString;

            //if a code is entered use it in the filter query
            if(!string.IsNullOrEmpty(query))
            {
                filterString = $"domain eq \"{domain}\" and code cont \"{query}\"";
            }
            else
            {
                filterString = $"domain eq \"{domain}\"";
            }

            var resp = ((await _targetRulesWebApiClient.GetTargetRules(startIndex: pagingParams.startIndex, pageSize: pagingParams.pageSize, filter: filterString)).ReadAsSync());
            return List2(resp.Items, resp.TotalCount);
        }

        [HttpPostRoute(UriTemplate = "rules/edit")]
        public async Task<Response<List<DC.TargetRule>>> RuleEdit(List<DC.TargetRule> targets)
        {
            var tasks = targets.Select(x => _targetRulesWebApiClient.UpdateTargetRule(x.Code, x)).ToList();
            await Task.WhenAll(tasks);
            targets.Clear();
            targets = tasks.Select(x => x.Result.ReadAsSync()).ToList();
            return this.List2(targets);
        }

        [HttpPostRoute(UriTemplate = "rules/delete")]
        public async Task<Response<List<bool>>> RuleDelete(List<DC.TargetRule> targets)
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
        public async Task<Response<List<DC.TargetRule>>> RuleCreate(List<DC.TargetRule> targets)
        {
            var tasks = targets.Select(x => _targetRulesWebApiClient.CreateTargetRule(x)).ToList();
            await Task.WhenAll(tasks);
            targets = tasks.Select(x => x.Result.ReadAsSync()).ToList();
            return this.List2(targets);
        }


        async Task<string> GetProfileCode()
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

            throw new InvalidOperationException(string.Format("Couldn't find a profile for site: {0}", SbApiContext.SiteId.Value));
        }

        [HttpGetRoute(UriTemplate = "ShippingInclusionRules/read")]
        public async Task<Response<List<ShippingInclusionRule>>> ShippingRuleRead([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
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
        public async Task<Response<List<ShippingInclusionRule>>> ShippingRuleEdit(List<ShippingInclusionRule> shippingInclusionRules)
        {
            var profileCode = await GetProfileCode();
            var tasks = shippingInclusionRules.Select(x => _shippingProfileWebApiClient.UpdateShippingInclusionRule(profileCode, x.Id, x)).ToList();
            await Task.WhenAll(tasks);
            shippingInclusionRules.Clear();
            shippingInclusionRules = tasks.Select(x => x.Result.ReadAsSync()).OrderBy(x => x.Sequence).ToList();
            return this.List2(shippingInclusionRules);

        }



        [HttpPostRoute(UriTemplate = "ShippingInclusionRules/delete")]
        public async Task<Response<List<bool>>> ShippingRuleDelete(List<ShippingInclusionRule> targets)
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
        public async Task<Response<List<ShippingInclusionRule>>> ShippingRuleCreate(List<ShippingInclusionRule> shippingInclusionRules )
        {
            var profileCode = await GetProfileCode();
            var rules = (await _shippingProfileWebApiClient.GetShippingInclusionRules(profileCode)).ReadAsSync();
            var next = rules != null ? rules.Items.OrderByDescending(x => x.Sequence).Select(x => x.Sequence).FirstOrDefault(0) : 0;

            var tasks = shippingInclusionRules.Select(
                x =>
                {
                    x.Sequence = ++next;
                    return _shippingProfileWebApiClient.CreateShippingInclusionRule(profileCode, x);
                }).ToList();
            await Task.WhenAll(tasks);
            shippingInclusionRules = tasks.Select(x => x.Result.ReadAsSync()).ToList();
            return this.List2(shippingInclusionRules);
        }


        //product handling fees


        [HttpGetRoute(UriTemplate = "HandlingRules/read")]
        public async Task<Response<List<HandlingFeeRule>>> ProductHandlingRuleRead([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter, string applysTo)
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
                    UpdateShippingHandlingFeesFromService(single);
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
                UpdateShippingHandlingFeesFromService(resp);
                return this.List2(resp.Items.OrderBy(x => x.Sequence).ToList(), resp.TotalCount);
            }

        }

        

        [HttpPostRoute(UriTemplate = "HandlingRules/edit")]
        public async Task<Response<List<HandlingFeeRule>>> ProductHandlingRuleEdit(List<HandlingFeeRule> handlingFeeRules)
        {
            var profileCode = await GetProfileCode();
            var appliesTo = handlingFeeRules.First().AppliesTo;
            if (appliesTo == "product")
            {
                var tasks = handlingFeeRules.Select(x => _shippingProfileWebApiClient.UpdateProductHandlingFeeRule(profileCode, x.Id, x)).ToList();
                await Task.WhenAll(tasks);
                handlingFeeRules.Clear();
                handlingFeeRules = tasks.Select(x => x.Result.ReadAsSync()).OrderBy(x => x.Sequence).ToList();
                return this.List2(handlingFeeRules);
            }
            else
            {
                UpdateShippingHandlingFeesToService(handlingFeeRules);

                var tasks = handlingFeeRules.Select(x => _shippingProfileWebApiClient.UpdateOrderHandlingFeeRule(profileCode, x.Id, x)).ToList();
                await Task.WhenAll(tasks);
                handlingFeeRules.Clear();
                handlingFeeRules = tasks.Select(x => x.Result.ReadAsSync()).OrderBy(x => x.Sequence).ToList();
                return this.List2(handlingFeeRules);
            }
        }



        [HttpPostRoute(UriTemplate = "HandlingRules/delete")]
        public async Task<Response<List<bool>>> ProductHandlingRuleDelete(List<HandlingFeeRule> handlingFeeRules)
        {
            var profileCode = await GetProfileCode();
            var appliesTo = handlingFeeRules.First().AppliesTo;
            if (appliesTo == "product")
            {
                var tasks = handlingFeeRules.Select(x => _shippingProfileWebApiClient.DeleteProductHandlingFeeRule(profileCode, x.Id)).ToList();
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
            else
            {
                var tasks = handlingFeeRules.Select(x => _shippingProfileWebApiClient.DeleteOrderHandlingFeeRule(profileCode, x.Id)).ToList();
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
        }

        [HttpPostRoute(UriTemplate = "HandlingRules/create")]
        public async Task<Response<List<HandlingFeeRule>>> ProductHandlingRuleCreate(List<HandlingFeeRule> handlingFeeRules)
        {
            var profileCode = await GetProfileCode();
        
            if (handlingFeeRules.First().AppliesTo == "product")
            {
                var fees = (await _shippingProfileWebApiClient.GetProductHandlingFeeRules(profileCode)).ReadAsSync();
                var next = fees != null ? fees.Items.OrderByDescending(x => x.Sequence).Select(x => x.Sequence).FirstOrDefault(0) : 0;
                var tasks = handlingFeeRules.Select(x =>
                {
                    x.Sequence = ++next ;
                    return _shippingProfileWebApiClient.CreateProductHandlingFeeRule(profileCode, x);
                }).ToList();
                await Task.WhenAll(tasks);
                handlingFeeRules = tasks.Select(x => x.Result.ReadAsSync()).ToList();
                return this.List2(handlingFeeRules);
            }
            else
            {
                UpdateShippingHandlingFeesToService(handlingFeeRules);

                var fees = (await _shippingProfileWebApiClient.GetOrderHandlingFeeRules(profileCode)).ReadAsSync();
                var next = fees != null ? fees.Items.OrderByDescending(x => x.Sequence).Select(x => x.Sequence).FirstOrDefault(0) : 0;
                var tasks = handlingFeeRules.Select(x =>
                {
                        x.Sequence = ++next;
                       return  _shippingProfileWebApiClient.CreateOrderHandlingFeeRule(profileCode, x);
                    
                }).ToList();
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
            var methods = (await this.ShippingRuleRead(new PagingParamaters(), new FilterCollection())).Items;

            var configurations = (await _carrierConfigurationWebApiClient.GetConfigurations(startIndex: 0, pageSize: 600)).ReadAsSync();
            var ret = new List<object>();
            foreach (var rp in GetAllRATES())
            {
                var key = FeatureDic.Where(x => string.Equals(x.Value, rp, StringComparison.OrdinalIgnoreCase)).Select(x => x.Key).FirstOrDefault();
                if (string.IsNullOrEmpty(key))
                    continue;
                var configuration = configurations.Items.FirstOrDefault(conf => conf.Id == key);
                if (configuration == null  || !configuration.Enabled)
                    continue;



                var cConfig = (await _carrierConfigurationGlobalWebApiClient.GetCarrierServiceTypes(key, this.SbApiContext.LocaleCode)).ReadAsSync();
               
                if (key == "custom")
                {

                    var cheese =
                        from customRate in configuration.CustomTableRates
                        let rateInfo = cConfig.Where(x=> string.Equals(x.Code,customRate.RateType, StringComparison.OrdinalIgnoreCase ) ).FirstOrDefault()
                        select new
                        {
                            Code = customRate.Id,
                            Name = customRate.Content != null ? customRate.Content.Name : (rateInfo != null && rateInfo.Content != null && !string.IsNullOrEmpty( rateInfo.Content.Name)? rateInfo.Content .Name :   customRate.Id ),
                            IsProvider = false,
                            RateProvider = key,
                            IsActive = true,
                            RateType = customRate.RateType,
                            IsConfigured = methods.Any(x => x.Id == customRate.Id),
                            CustomValue = customRate.Value
                        };

                    //var cheese =
                    //   from st in cConfig
                    //   let isConfigured = true
                    //   select new
                    //   {
                    //       Code = st.Code,
                    //       Name = st.Content != null ? st.Content.Name : st.Code,
                    //       IsProvider = false,
                    //       RateProvider = key,
                    //       IsActive = true,
                    //       IsInternational = true,
                           
                    //       Sequence = 0,
                    //       IsConfigured = methods.Any(x => x.Id == st.Code),

                    //       CustomValue = customRate.Value

                    //   };

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
                            IsConfigured = methods.Any(x => x.Id == st.Code),
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
            if (!settings.Any(x => x.id == DC.Constants.FedEx.CarrierId ))
            {
                settings.Add(new CarrierConfiguration() { id = DC.Constants.FedEx.CarrierId, IsConfigured = false });
            }
            if (!settings.Any(x => x.id == DC.Constants.Ups.CarrierId  ))
            {
                settings.Add(new CarrierConfiguration() { id = DC.Constants.Ups.CarrierId, IsConfigured = false });
            }
            if (!settings.Any(x => x.id == DC.Constants.Usps .CarrierId ))
            {
                settings.Add(new CarrierConfiguration() { id = DC.Constants.Usps.CarrierId, IsConfigured = false });
            }
            if (!settings.Any(x => x.id == DC.Constants.Custom .CarrierId))
            {
                settings.Add(new CarrierConfiguration() { id = DC.Constants.Custom.CarrierId , IsConfigured = false });
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
                
                var dcConfig = Mapper.Map<DC.CarrierConfiguration>(setting);
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

        /// <summary>
        /// converts drop down value of shippingRate percentage to value type of percent & applies to of shipping.
        /// </summary>
        /// <param name="handlingFeeRules"></param>
        private static void UpdateShippingHandlingFeesToService(List<HandlingFeeRule> handlingFeeRules)
        {
            foreach (
                var handlingFeeRule in
                    handlingFeeRules.Where(
                        handlingFeeRule => SHIPPING_PERCENT_HANDLING_FEE.EqualsIgnoreCase(handlingFeeRule.ValueType)))
            {
                handlingFeeRule.ValueType = "percentage";
                handlingFeeRule.AppliesTo = "shippingRate";
            }
        }

        private static void UpdateShippingHandlingFeesFromService(HandlingFeeRule single)
        {
            if ("shippingrate".EqualsIgnoreCase(single.AppliesTo))
            {
                TranslateHandlingFeeFromService(single);
            }
        }

        private static void UpdateShippingHandlingFeesFromService(HandlingFeeRuleCollection handlingFeeRules)
        {
            if (handlingFeeRules == null || handlingFeeRules.Items.IsNullOrEmpty())
                return;
            foreach (var feeRule in handlingFeeRules.Items.Where(x => "shippingrate".EqualsIgnoreCase(x.AppliesTo)))
            {
                TranslateHandlingFeeFromService(feeRule);
            }
        }

        private static void TranslateHandlingFeeFromService(HandlingFeeRule feeRule)
        {
            feeRule.AppliesTo = "order";
            feeRule.ValueType = SHIPPING_PERCENT_HANDLING_FEE;
        }
   
    }
}