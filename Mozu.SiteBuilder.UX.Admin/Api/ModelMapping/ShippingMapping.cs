using System.Collections.Generic;
using AutoMapper;
using System.Linq;
using Mozu.PaymentService.Contracts;
using Mozu.ShippingAdmin.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping;
using Newtonsoft.Json.Linq;
using CarrierConfiguration = Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping.CarrierConfiguration;
using CustomAttribute = Mozu.ShippingRuntime.Contracts.CustomAttribute;

using ShippingClass = Mozu.ProductAdmin.Contracts.ShippingClass;
using ShippingRate = Mozu.ShippingRuntime.Contracts.ShippingRate;

using SiteShippingRegion = Mozu.SiteSettings.Shipping.Contracts.SiteShippingRegion;
using SiteShippingSettings = Mozu.SiteSettings.Shipping.Contracts.SiteShippingSettings;
using Contact = Mozu.SiteBuilder.UX.Admin.Api.Models.Contact;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class ShippingMapping : Profile
    {
        public override string ProfileName
        {
            get
            {
                return this.GetType().FullName;
            }
        }

        protected override void Configure()
        {
            Mapper.CreateMap<CustomRate, Mozu.ShippingAdmin.Contracts.CarrierConfiguration>()
                  .ForMember(x => x.Id, opt => opt.UseValue(Mozu.ShippingAdmin.Contracts.Constants.Custom.CarrierId))
                  .ForMember(x => x.Settings, opt => opt.MapFrom(x => new List<Mozu.ShippingAdmin.Contracts.Setting>()
                                                                          {
                                                                              new Setting()
                                                                                  {
                                                                                      Key = Mozu.ShippingAdmin.Contracts.Constants.Custom.Settings.Amount,
                                                                                      Value = x.Amount
                                                                                  },
                                                                              new Setting()
                                                                                  {
                                                                                      Key = Mozu.ShippingAdmin.Contracts.Constants.Custom.Settings.Type,
                                                                                      Value = x.RateType
                                                                                  }
                                                                          }))
                  .ForMember(x => x.ConfiguredServiceTypes, opt => opt.MapFrom(x => new List<Mozu.ShippingAdmin.Contracts.ServiceType>
                                                                                        {
                                                                                            new ServiceType()
                                                                                                {
                                                                                                    Code  = "custom_"+ x.RateType  ,
                                                                                                    Content = new ServiceTypeLocalizedContent()
                                                                                                                  {
                                                                                                                      Name  = x.Name ,
                                                                                                                      LocaleCode = "en-US"
                                                                                                                  },
                                                                                                                  IsActive = x.IsEnabled 
                                                                                                }


                                                                                        }));


            Mapper.CreateMap<Mozu.ShippingAdmin.Contracts.CarrierConfiguration, CustomRate>()
                  .ForMember(x => x.Amount, opt => opt.MapFrom(x => x.Settings == null ? null : x.GetSettingValue(Mozu.ShippingAdmin.Contracts.Constants.Custom.Settings.Amount)))
                  .ForMember(x => x.RateType, opt => opt.MapFrom(x => x.Settings == null ? null : x.GetSettingValue(Mozu.ShippingAdmin.Contracts.Constants.Custom.Settings.Type)))
                  .ForMember(x => x.Name, opt => opt.ResolveUsing(x =>
                      {
                          return x.ConfiguredServiceTypes == null || x.ConfiguredServiceTypes.Count == 0 ? null : x.ConfiguredServiceTypes.First().Content.Name;
                      } ));

                


            Mapper.CreateMap<CarrierConfiguration, Mozu.ShippingAdmin.Contracts.CarrierConfiguration>().ConvertUsing(
                x =>
                    {
                        var dest = new Mozu.ShippingAdmin.Contracts.CarrierConfiguration()
                                       {
                                           Id = x.id,
                                           Settings = new List<Mozu.ShippingAdmin.Contracts.Setting>(),
                                           ConfiguredServiceTypes = new List<Mozu.ShippingAdmin.Contracts.ServiceType>()

                                       };
                        foreach (var carSet in x.Settings)
                        {
                            dest.Settings.Add(new Mozu.ShippingAdmin.Contracts.Setting()
                                                  {
                                                      Key = carSet.Key,
                                                      Value = (string) carSet.Value
                                                  });
                        }
                        foreach (var rate in x.Rates)
                        {
                            dest.ConfiguredServiceTypes.Add(new Mozu.ShippingAdmin.Contracts.ServiceType()
                                                                {
                                                                    Code = rate,
                                                                    IsActive = true
                                                                });
                        }
                        if (x.PreviousValue != null)
                        {
                            foreach (var rate in x.PreviousValue.ConfiguredServiceTypes.Where(_ => x.Rates.IndexOf(_.Code) == -1))
                            {
                                rate.IsActive = false;
                                dest.ConfiguredServiceTypes.Add(rate);
                            }
                            
                        }
                        return dest;
                    });


            Mapper.CreateMap< Mozu.ShippingAdmin.Contracts.CarrierConfiguration,CarrierConfiguration>().ConvertUsing(
                x =>
                    {

                        var dest = new CarrierConfiguration()
                                       {
                                           id = x.Id,
                                           Rates = new List<string>(),
                                           Settings = new JObject(),
                                           IsConfigured = true 
                                       };
                        foreach (var setting in x.Settings)
                        {
                            dest.Settings[setting.Key] = setting.Value;
                        }
                        foreach (var rate in x.ConfiguredServiceTypes.Where( _=> _.IsActive.GetValueOrDefault( true ) ) )
                        {
                            dest.Rates.Add(rate.Code);
                        }
                        return dest;
                    });
            

            
                
                
                
            


            //Mapper.CreateMap<ShippingRate, Models.Shipping.ShippingRate>();
            //Mapper.CreateMap<ShippingClass, Models.Shipping.ShippingClass>();
            //Mapper.CreateMap<ShippingRateLocalizedContent, Models.Shipping.ShippingRateLocalizedContent>();
            //Mapper.CreateMap<FlatPerCartShippingRate, Models.Shipping.FlatPerCartShippingRate>();
            //Mapper.CreateMap<FlatPerItemShippingRate, Models.Shipping.FlatPerItemShippingRate>();
            //Mapper.CreateMap<ShippingRatePrice, Models.Shipping.ShippingRatePrice>();
            //Mapper.CreateMap<SiteShippingMethod, Models.Shipping.SiteShippingMethod>();
            //Mapper.CreateMap<SiteShippingMethodLocalizedContent, Models.Shipping.SiteShippingMethodLocalizedContent>();
            //Mapper.CreateMap<SiteShippingRegion, Models.Shipping.SiteShippingRegion>();
            Mapper.CreateMap<SiteShippingSettings, Models.Shipping.SiteShippingSettings>()
                  .ForMember(x => x.ActiveRateProviders, opt => opt.MapFrom(x => x.ActiveRateProviders))
                  .ForMember(x => x.OrderHandlingFee, opt => opt.MapFrom(x => x.OrderHandlingFee!= null ? x.OrderHandlingFee.Amount : null))
                  .ForMember(x => x.SiteShippingOriginAddress, opt => opt.MapFrom(x => x.SiteShippingOriginAddress));

            Mapper.CreateMap<Models.Shipping.SiteShippingSettings, SiteShippingSettings>()
                  .ForMember(x => x.ActiveRateProviders, opt => opt.MapFrom(x => x.ActiveRateProviders))
                  .ForMember(x => x.OrderHandlingFee, opt => opt.MapFrom(x => x.OrderHandlingFee.HasValue  
                      ? new  Mozu.SiteSettings.Shipping.Contracts.SiteShippingHandlingFee(){Amount = x.OrderHandlingFee }
                      :null ))
                  .ForMember(x => x.SiteShippingOriginAddress, opt => opt.MapFrom(x => x.SiteShippingOriginAddress));


            Mapper.CreateMap<Mozu.Core.Api.Contracts.Feature, Mozu.SiteBuilder.UX.Admin.Api.Models.Feature>();
            Mapper.CreateMap<Mozu.SiteBuilder.UX.Admin.Api.Models.Feature,Mozu.Core.Api.Contracts.Feature>();
           






      

            //Mapper.CreateMap<SharedShippingMethod, Models.Shipping.SharedShippingMethod>();
            //Mapper.CreateMap<SharedShippingMethodLocalizedContent, Models.Shipping.SharedShippingMethodLocalizedContent>();
            
            //Mapper.CreateMap<Models.Shipping.SiteShippingOriginAddress, SiteShippingOriginAddress>();
            //Mapper.CreateMap<Models.Shipping.ShippingRate, ShippingRate>();
            //Mapper.CreateMap<Models.Shipping.ShippingClass, ShippingClass>();
            //Mapper.CreateMap<Models.Shipping.ShippingRateLocalizedContent, ShippingRateLocalizedContent>();
            //Mapper.CreateMap<Models.Shipping.FlatPerCartShippingRate, FlatPerCartShippingRate>();
            //Mapper.CreateMap<Models.Shipping.FlatPerItemShippingRate, FlatPerItemShippingRate>();
            //Mapper.CreateMap<Models.Shipping.ShippingRatePrice, ShippingRatePrice>();
            //Mapper.CreateMap<Models.Shipping.SiteShippingMethod, Mozu.SiteSettings.Shipping.Contracts.SiteShippingMethod>();
            //Mapper.CreateMap<Models.Shipping.SiteShippingMethodLocalizedContent, Mozu.SiteSettings.Shipping.Contracts.SiteShippingMethodLocalizedContent>();
            //Mapper.CreateMap<Models.Shipping.SiteShippingOriginAddress, Mozu.SiteSettings.Shipping.Contracts.SiteShippingOriginAddress>();
            //Mapper.CreateMap<Models.Shipping.SiteShippingRegion, Mozu.SiteSettings.Shipping.Contracts.SiteShippingRegion>();
            Mapper.CreateMap<Models.Shipping.SiteShippingSettings, Mozu.SiteSettings.Shipping.Contracts.SiteShippingSettings>();

            //Mapper.CreateMap<Models.Shipping.SharedShippingMethod, SharedShippingMethod>();
            //Mapper.CreateMap<Models.Shipping.SharedShippingMethodLocalizedContent, SharedShippingMethodLocalizedContent>();

            // USPS

            /*Mapper.CreateMap<ShippingMethod, Models.Shipping.ShippingMethod>()
                .ForMember(x => x.Code, op => op.MapFrom(x => x.Code))
                .ForMember(x => x.IsActive, op => op.MapFrom(x => x.IsActive))
                .ForMember(x => x.IsInternational, op => op.MapFrom(x => x.IsInternational))
                .ForMember(x => x.Name, op => op.MapFrom(x => x.Content.Name));

            Mapper.CreateMap<Models.Shipping.ShippingMethod, ShippingMethod>()
                .ForMember(x => x.Code, op => op.MapFrom(x => x.Code))
                .ForMember(x => x.Content, op => op.MapFrom(x => new ShippingMethodLocalizedContent { ContentLocaleCode = "en-US", Name = x.Name }))
                .ForMember(x => x.IsActive, op => op.MapFrom(x => x.IsActive))
                .ForMember(x => x.IsInternational, op => op.MapFrom(x => x.IsInternational));

            Mapper.CreateMap<UspsConfiguration, Models.Shipping.UspsConfiguration>()
                .ForMember(x => x.ShippingMethods, op => op.MapFrom(x => (from sm in x.ShippingMethods where sm.Code != null select sm.Code).ToArray()))
                .ForMember(x => x.UspsUserId, op => op.MapFrom(x => x.CustomAttributes.SingleOrDefault(att => att.Key == "uspsuserid").Value));

            Mapper.CreateMap<Models.Shipping.UspsConfiguration, ShippingConfiguration>()
                .ForMember(x => x.CreateBy, op => op.Ignore())
                .ForMember(x => x.CreateDate, op => op.Ignore())
                .ForMember(x => x.CustomAttributes, op => op.MapFrom(x => new List<CustomAttribute> { new CustomAttribute { Key = "uspsuserid", Value = x.UspsUserId } }))
                .ForMember(x => x.ShippingMethods, op => op.MapFrom(x => x.ShippingMethods.Select(method => new ShippingMethod() { Code = method }).ToList()))
                .ForMember(x => x.UpdateBy, op => op.Ignore())
                .ForMember(x => x.UpdateDate, op => op.Ignore());*/
                
        }
    }
}