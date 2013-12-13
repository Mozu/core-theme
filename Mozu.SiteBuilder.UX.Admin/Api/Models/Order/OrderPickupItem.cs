using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    public class OrderPickupItem
    {
        [DataMember(Name = "quantity")]
        public int Quantity { get; set; }

        [DataMember(Name = "productName")]
        public string ProductName { get; set; }

        [DataMember(Name = "productCode")]
        public string ProductCode { get; set; }
    }
}
