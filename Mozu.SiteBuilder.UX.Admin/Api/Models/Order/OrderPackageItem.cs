using System;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    
    public class OrderPackageItem
    {
       // [JsonProperty(PropertyName = "orderItemId")]
        //public string ProductCode { get; set; }


        //ProductCode--orderItemId

        
        public int Quantity { get; set; }

        public string ProductName { get; set; }

        public string ProductCode { get; set; }

        public string FulfillmentMethod { get; set; }

        public string FulfillmentLocationCode { get; set; }

        public decimal? Weight { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal Total { get; set; }
    }
}
