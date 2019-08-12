using System;
using System.Collections.Generic;
using Newtonsoft.Json;


namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping
{
    
    public class SiteShippingSettings
    {
        //public List<Feature> ActiveRateProviders { get; set; }

        //public Contact SiteShippingOriginAddress { get; set; }

        public List<string> SiteShippingRegions { get; set; }


        public string ShippingLocationCode { get; set; }

        public bool? EnableInStorePickup { get; set; }

        public List<string> StorePickupLocationTypeCodes { get; set; }

        public List<string> EnabledStates { get; set; }


		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Decimal? OrderHandlingFee 
        {
            get;
            set;
        }


		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<CustomTableRate> CustomRates
        {
            get;
            set;
        }

    }

    
    public class CarrierConfiguration
    {
        public string id { get; set; }

        [JsonProperty(PropertyName = "settings")]
        public Newtonsoft.Json.Linq.JObject Settings { get; set; }


        public bool? IsConfigured { get; set; }

        [JsonIgnore]
        public Mozu.ShippingAdmin.Contracts.CarrierConfiguration PreviousValue { get; set; }


        public bool Enabled { get; set; }

        public bool EnabledForReturns { get; set; }

        public bool AreCredentialsSet { get; set; }

    }

    
    public class CustomTableRate
    {
        public string Id { get; set; }


        public string Name { get; set; }

        public decimal  Amount { get; set; }

        [JsonProperty(PropertyName = "type")]
        public string RateType { get; set; }

       /// <summary>
       /// valid values are
       /// Standard, One_Day, Two_Day, Three_Day
       /// </summary>
        public string DeliveryDuration { get; set; }
        

    }


}
