//using System.Collections.Generic;
//using System.Runtime.Serialization;

//namespace Mozu.SiteBuilder.UX.Models.Checkout
//{
//    [DataContract]
//    public class OrderDiscountInformation : CheckoutInformation
//    {
//        [DataMember(Name = "freeShipping")]
//        public bool FreeShipping { get; set; }

//        [DataMember(Name = "amount")]
//        public decimal? Amount { get; set; }

//        [DataMember(Name = "name")]
//        public string Name { get; set; }
//    }

//    [DataContract]
//    public class OrderInformation : CheckoutInformation
//    {
//        [DataMember(Name = "id")]
//        public string Id { get; set; }

//        [DataMember(Name = "orderNumber", EmitDefaultValue = false)]
//        public int? OrderNumber { get; set; }

//        [DataMember(Name = "items", EmitDefaultValue = false)]
//        public List<OrderItemInformation> Items { get; set; }

//        [DataMember(Name = "shipment", EmitDefaultValue = false)]
//        public ShipmentInformation Shipment { get; set; }

//        [DataMember(Name = "payment", EmitDefaultValue = false)]
//        public PaymentInformation Payment { get; set; }

//        [DataMember(Name = "shippingMethod")]
//        public string ShippingMethod { get; set; }

//        [DataMember(Name = "comments")]
//        public string Comments { get; set; }

//        [DataMember(Name = "couponCode")]
//        public string CouponCode { get; set; }

//        [DataMember(Name = "removeCoupon", EmitDefaultValue = false)]
//        public bool RemoveCoupon { get; set; }

//        [DataMember(Name = "subTotal", EmitDefaultValue = false)]
//        public decimal? SubTotal { get; set; }

//        [DataMember(Name = "discountTotal", EmitDefaultValue = false)]
//        public decimal? DiscountTotal { get; set; }

//        [DataMember(Name = "discount", EmitDefaultValue = true)]
//        public OrderDiscountInformation Discount { get; set; }

//        [DataMember(Name = "shippingTotal", EmitDefaultValue = false)]
//        public decimal? ShippingTotal { get; set; }

//        [DataMember(Name = "taxTotal", EmitDefaultValue = false)]
//        public decimal? TaxTotal { get; set; }

//        [DataMember(Name = "total", EmitDefaultValue = false)]
//        public decimal? Total { get; set; }
//    }
//}