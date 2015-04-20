using System.Collections.Generic;
using AutoMapper;
using Mozu.Core.Api.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping;

using Newtonsoft.Json.Linq;
using MSC = Mozu.ShippingAdmin.Contracts;



namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class ShippingMapping : Profile
    {
        private const string CUSTOM_PERCENTAGE_PER_ORDER = "CUSTOM_PERCENTAGE_PER_ORDER";

        public override string ProfileName
        {
            get { return GetType().FullName; }
        }

        protected override void Configure()
        {
            Mapper.CreateMap<MSC.CustomTableRate, CustomTableRate>()
                .ForMember(x => x.Name, 
                    opt => opt.ResolveUsing(x => (x.Content != null) ? x.Content.Name : null))
                .ForMember(x => x.Amount, 
                    opt => opt.ResolveUsing(x => x.RateType == CUSTOM_PERCENTAGE_PER_ORDER ? (x.Value*100) : x.Value));

            Mapper.CreateMap<CustomTableRate, MSC.CustomTableRate>()
                .ForMember(x => x.Content, opt => opt.ResolveUsing(x => new MSC.CustomTableRateContent
                                                                        {
                                                                            //LocaleCode = "??-??"
                                                                            //,
                                                                            Name = x.Name
                                                                        }))
                .ForMember(x => x.Value, opt => opt.ResolveUsing(x => x.RateType == CUSTOM_PERCENTAGE_PER_ORDER
                    ? (x.Amount/100) : x.Amount));


            Mapper.CreateMap<CarrierConfiguration, MSC.CarrierConfiguration>().ConvertUsing(
                x =>
                {
                    var dest = new MSC.CarrierConfiguration
                               {
                                   Id = x.id,
                                   Settings = new List<MSC.Setting>(),
                                   Enabled = x.Enabled
                               };
                    foreach (var carSet in x.Settings)
                    {
                        dest.Settings.Add(new MSC.Setting
                                          {
                                              Key = carSet.Key,
                                              Value = (string) carSet.Value
                                          });
                    }


                    return dest;
                });


            Mapper.CreateMap<MSC.CarrierConfiguration, CarrierConfiguration>().ConvertUsing(
                x =>
                {
                    var dest = new CarrierConfiguration
                               {
                                   id = x.Id,
                                   Enabled = x.Enabled,
                                   Settings = new JObject(),
                                   IsConfigured = true
                               };
                    foreach (MSC.Setting setting in x.Settings)
                    {
                        dest.Settings[setting.Key] = setting.Value;
                    }

                    return dest;
                });

            Mapper.CreateMap<Feature, Models.Feature>();
            Mapper.CreateMap<Models.Feature, Feature>();


            Mapper.CreateMap<Models.Shipping.SiteShippingSettings, SiteShippingSettings>();
        }
    }
}