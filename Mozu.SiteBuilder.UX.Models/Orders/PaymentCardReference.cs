using System;
using System.Runtime.Serialization;
using Mozu.SiteBuilder.UX.Models.Customers;

namespace Mozu.SiteBuilder.UX.Models.Orders
{
    [DataContract]
    public class PaymentCardReference : ModelBase
    {
        [DataMember(Name = "paymentServiceCardId")]
        public string PaymentServiceCardId { get; set; }

        [DataMember(Name = "paymentOrCardType")]
        public string PaymentOrCardType { get; set; }

        [DataMember(Name = "cardNumberPartOrMask")]
        public string CardNumberPartOrMask { get; set; }

        [DataMember(Name = "isUsedRecurring")]
        public bool? IsUsedRecurring { get; set; }

        [DataMember(Name = "isSameBillingShippingAddress")]
        public bool? IsSameBillingShippingAddress { get; set; }

        [DataMember(Name = "billingAddress")]
        public Contact BillingAddress { get; set; }

        [DataMember(Name = "isCardInfoSaved")]
        public bool IsCardInfoSaved { get; set; }

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
