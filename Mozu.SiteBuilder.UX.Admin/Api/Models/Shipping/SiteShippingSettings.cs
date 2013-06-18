using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Mozu.SiteSettings.Shipping.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping
{
    [DataContract]
    public class SiteShippingSettings
    {
        [DataMember(Name = "activeRateProviders")]
        public List<Feature> ActiveRateProviders { get; set; }

        [DataMember(Name = "siteShippingOriginAddress")]
        public Contact SiteShippingOriginAddress { get; set; }

        [DataMember(Name = "siteShippingRegions")]
        public List<string> SiteShippingRegions { get; set; }





        [DataMember(EmitDefaultValue = false, Name = "orderHandlingFee")]
        public Decimal? OrderHandlingFee 
        {
            get;
            set;
        }


        [DataMember(EmitDefaultValue = false, Name = "customRate")]
        public CustomRate CustomRate
        {
            get;
            set;
        }

    }

    [DataContract]
    public class CarrierConfiguration
    {
        [DataMember(Name = "id")]
        public string id { get; set; }

        [DataMember(Name = "settings")]
        public Newtonsoft.Json.Linq.JObject Settings { get; set; }
        [DataMember(Name = "rates")]
        public List<string> Rates { get; set; }

        [IgnoreDataMember]
        public Mozu.ShippingAdmin.Contracts.CarrierConfiguration PreviousValue { get; set; }

    }

    [DataContract]
    public class CustomRate
    {
      

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "amount")]
        public string Amount { get; set; }
        [DataMember(Name = "type")]
        public string RateType { get; set; }

        [DataMember(Name = "isEnabled")]
        public bool? IsEnabled { get; set; }


    }


}