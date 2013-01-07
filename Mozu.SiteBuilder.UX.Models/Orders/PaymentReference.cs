using System;
using System.Runtime.Serialization;
using Mozu.SiteBuilder.UX.Models.Customers;

namespace Mozu.SiteBuilder.UX.Models.Orders
{
    [DataContract]
    public class PaymentReference : ModelBase
    {
        [DataMember(Name = "paymentType")]
        public string PaymentType { get; set; }

        [DataMember(Name = "card")]
        public PaymentCardReference Card { get; set; }

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