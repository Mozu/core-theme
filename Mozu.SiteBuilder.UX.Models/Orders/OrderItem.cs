using System;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Orders
{
    [DataContract]
    public class OrderItem : ModelBase
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "productName")]
        public string ProductName { get; set; }

        [DataMember(Name = "quantity")]
        public int Quantity { get; set; }

        [DataMember(Name = "unitPrice")]
        public decimal UnitPrice { get; set; }

        [DataMember(Name = "subTotal")]
        public decimal SubTotal { get; set; }

        [DataMember(Name = "discountTotal")]
        public decimal DiscountTotal { get; set; }

        [DataMember(Name = "total")]
        public decimal Total { get; set; }

        [DataMember(Name = "originalCartItemId")]
        public string OriginalCartItemId { get; set; }

        [DataMember(Name = "localeCode")]
        public string LocaleCode { get; set; }

        [DataMember(Name = "product")]
        public Product Product { get; set; }

        [DataMember(Name = "productReservationId")]
        public int? ProductReservationId { get; set; }

        [DataMember(Name = "createDate")]
        public DateTime? CreateDate { get; set; }

        [DataMember(Name = "createBy")]
        public string CreateBy { get; set; }

        [DataMember(Name = "updateDate")]
        public DateTime? UpdateDate { get; set; }

        [DataMember(Name = "updateBy")]
        public string UpdateBy { get; set; }
    }
}