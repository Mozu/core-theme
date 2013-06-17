using System.Collections.Generic;
using AutoMapper;
using System.Linq;
using Mozu.PaymentService.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping;
using Newtonsoft.Json.Linq;
using CustomAttribute = Mozu.ShippingRuntime.Contracts.CustomAttribute;
//using FlatPerCartShippingRate = Mozu.ProductAdmin.Contracts.FlatPerCartShippingRate;
//using FlatPerItemShippingRate = Mozu.ProductAdmin.Contracts.FlatPerItemShippingRate;
using ShippingClass = Mozu.ProductAdmin.Contracts.ShippingClass;
using ShippingRate = Mozu.ShippingRuntime.Contracts.ShippingRate;
//using ShippingRateLocalizedContent = Mozu.ProductAdmin.Contracts.ShippingRateLocalizedContent;
//using ShippingRatePrice = Mozu.ProductAdmin.Contracts.ShippingRatePrice;
//using SiteShippingMethod = Mozu.SiteSettings.Shipping.Contracts.SiteShippingMethod;
//using SiteShippingMethodLocalizedContent = Mozu.SiteSettings.Shipping.Contracts.SiteShippingMethodLocalizedContent;
using SiteShippingOriginAddress = Mozu.SiteSettings.Shipping.Contracts.SiteShippingOriginAddress;
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
            Mapper.CreateMap<GatewayDefinition, Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout.GatewayDefinition>();


            Mapper.CreateMap<GatewayCredentialFieldDefinition, Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout.GatewayCredentialFieldDefinition>();

            Mapper.CreateMap<PreAuthorizeDefinition, Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout.PreAuthorizeDefinition>();
            Mapper.CreateMap<PreAuthorizeTransactionTypeDataContract, Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout.PreAuthorizeTransactionTypeDataContract>();

            
           

            Mapper.CreateMap< Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout.GatewayDefinition,GatewayDefinition>();
            Mapper.CreateMap<SiteShippingOriginAddress, Contact>()
                  .ForMember(x => x.Address1, opt => opt.MapFrom(x => x.Address1))
                  .ForMember(x => x.Address2, opt => opt.MapFrom(x => x.Address2))
                  .ForMember(x => x.Address3, opt => opt.MapFrom(x => x.Address3))
                  .ForMember(x => x.Address4, opt => opt.Ignore() )
                  .ForMember(x => x.CityOrTown, opt => opt.MapFrom(x => x.CityOrTown))
                  .ForMember(x => x.CompanyOrOrganization, opt => opt.MapFrom(x => x.SenderName ))
                  .ForMember(x => x.CountryCode, opt => opt.MapFrom(x => x.Country ))
                    .ForMember(x => x.PostalOrZipCode, opt => opt.MapFrom(x => x.PostalOrZipCode))
                  .ForMember(x => x.StateOrProvince, opt => opt.MapFrom(x => x.StateOrProvince));

            Mapper.CreateMap<Contact, SiteShippingOriginAddress>()
                  .ForMember(x => x.Address1, opt => opt.MapFrom(x => x.Address1))
                  .ForMember(x => x.Address2, opt => opt.MapFrom(x => x.Address2))
                  .ForMember(x => x.Address3, opt => opt.MapFrom(x => x.Address3))

                  .ForMember(x => x.CityOrTown, opt => opt.MapFrom(x => x.CityOrTown))
                  .ForMember(x => x.SenderName, opt => opt.MapFrom(x => x.CompanyOrOrganization))
                  .ForMember(x => x.Country, opt => opt.MapFrom(x => x.CountryCode))
                  .ForMember(x => x.PostalOrZipCode, opt => opt.MapFrom(x => x.PostalOrZipCode))
                  .ForMember(x => x.StateOrProvince, opt => opt.MapFrom(x => x.StateOrProvince));

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
                            foreach (var rate in x.PreviousValue.ConfiguredServiceTypes.Where(_ => x.Rates.IndexOf(_.Code) == -1))
                            {
                                rate.IsActive = false;
                                dest.ConfiguredServiceTypes.Add(rate);
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
                                           Settings = new JObject()
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
            Mapper.CreateMap<SiteShippingOriginAddress, Contact>();
            //Mapper.CreateMap<SiteShippingRegion, Models.Shipping.SiteShippingRegion>();
            Mapper.CreateMap<SiteShippingSettings, Models.Shipping.SiteShippingSettings>();

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