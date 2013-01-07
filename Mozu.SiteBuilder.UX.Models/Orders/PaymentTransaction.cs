using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Mozu.SiteBuilder.UX.Models.Customers;

namespace Mozu.SiteBuilder.UX.Models.Orders
{
    [DataContract]
    public class PaymentTransaction : ModelBase
    {
        [DataMember(Name = "id")]
        public int? Id { get; set; }

        [DataMember(Name = "paymentServiceTransactionId")]
        public string PaymentServiceTransactionId { get; set; }

        [DataMember(Name = "orderId")]
        public string OrderId { get; set; }

        [DataMember(Name = "transactionType")]
        public string TransactionType { get; set; }

        [DataMember(Name = "paymentReference")]
        public PaymentReference PaymentReference { get; set; }

        [DataMember(Name = "billingAddress")]
        public Contact BillingAddress { get; set; }

        [DataMember(Name = "status")]
        public string Status { get; set; }

        [DataMember(Name = "interactions")]
        public List<PaymentTransactionInteraction> Interactions { get; set; }

        [DataMember(Name = "isRecurring")]
        public bool IsRecurring { get; set; }

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