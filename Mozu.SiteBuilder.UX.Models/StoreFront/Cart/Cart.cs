//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Runtime.Serialization;
//using System.Text;

//namespace Mozu.SiteBuilder.UX.Models.StoreFront.Cart
//{
//    [DataContract]
//    public class Cart
//    {
//        [DataMember]
//        public string Id { get; set; }

//        [DataMember]
//        public string CurrencyCode { get; set; }

//        [DataMember]
//        public List<CartItem> Items { get; set; }

//        [DataMember]
//        public decimal? SubTotal { get; set; }

//        [DataMember]
//        public decimal? DiscountTotal { get; set; }

//        [DataMember]
//        public decimal? ShippingTotal { get; set; }

//        [DataMember]
//        public decimal? TaxTotal { get; set; }

//        [DataMember]
//        public decimal? FeeTotal { get; set; }

//        [DataMember]
//        public decimal? Total { get; set; }

//        [DataMember]
//        public DateTime? LastValidationDate { get; set; }

//        [DataMember]
//        public DateTime? ExpirationDate { get; set; }

//        [DataMember]
//        public bool canCheckout
//        {
//            get
//            {
//                return !isEmpty;
//            }
//        }

//        [DataMember]
//        public bool isEmpty
//        {
//            get
//            {
//                return Items.Count == 0;
//            }
//        }
//    }
//}
