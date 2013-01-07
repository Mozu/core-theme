using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Orders
{
    [DataContract]
    public class ShippingPrice : ModelBase
    {
        [DataMember(Name = "cost")]
        public decimal? Cost { get; set; }

        [DataMember(Name = "price")]
        public decimal? Price { get; set; }

        [DataMember(Name = "isoCurrencyCode")]
        public string ISOCurrencyCode { get; set; }
    }
}