using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Checkout
{
    [DataContract]
    public class ItemDiscountInformation : ModelBase
    {
        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "freeShipping")]
        public bool? FreeShipping { get; set; }

        [DataMember(Name = "price")]
        public decimal Price { get; set; }

        [DataMember(Name = "salePrice")]
        public decimal SalePrice { get; set; }
    }

    [DataContract]
    public class OrderItemInformation : ModelBase
    {
        [DataMember(Name = "productName")]
        public string ProductName { get; set; }

        [DataMember(Name = "productCode")]
        public string ProductCode { get; set; }

        [DataMember(Name = "quantity")]
        public int Quantity { get; set; }

        [DataMember(Name = "subTotal")]
        public decimal SubTotal { get; set; }

        [DataMember(Name = "total")]
        public decimal Total { get; set; }

        [DataMember(Name = "unitPrice")]
        public decimal UnitPrice { get; set; }

        [DataMember(Name = "discount")]
        public ItemDiscountInformation Discount { get; set; }
    }
}