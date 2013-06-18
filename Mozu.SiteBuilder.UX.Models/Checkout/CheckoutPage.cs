//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Runtime.Serialization;

//namespace Mozu.SiteBuilder.UX.Models.Checkout
//{
//    [DataContract]
//    public class CheckoutPage : ModelBase
//    {
//        public CheckoutPage(CheckoutModel checkoutModel)
//        {
//            if (checkoutModel == null)
//                throw new ArgumentNullException("checkoutModel");

//            Model = checkoutModel;
//            Messages = checkoutModel.GetAllMessages().Select(m => new { message = m }).ToList<object>();
//            Actions = new List<object>();
//        }

//        [DataMember(Name = "overallStatus")]
//        public string OverallStatus { get; set; }

//        [DataMember(Name = "messages")]
//        public List<object> Messages { get; set; }

//        [DataMember(Name = "actions")]
//        public dynamic Actions { get; set; }

//        [DataMember(Name = "contact")]
//        public ContactInformation Contact { get; set; }

//        [DataMember(Name = "orderSummary")]
//        public OrderInformation Order { get; private set; }

//        [DataMember(Name = "model")]
//        public CheckoutModel Model { get; set; }

//        [DataMember(Name = "paymentApi")]
//        public PaymentApiModel PaymentApi { get; set; }

//        [DataMember(Name = "merchantId")]
//        public string MerchantId { get; set; }

//        [DataMember(Name = "success")]
//        public bool Success { get; set; }

//        public CheckoutPage WithOrder(OrderInformation order)
//        {
//            Order = order;
//            if (order.OrderNumber > 0)
//                Actions.Add(new { redirect = "/checkout/confirmation" });
//            return this;
//        }
//    }
//}