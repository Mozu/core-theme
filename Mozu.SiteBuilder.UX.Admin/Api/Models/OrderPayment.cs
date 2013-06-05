using System;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models
{
    [DataContract]
    public class OrderPayment
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "status", EmitDefaultValue = true)]
        public string Status { get; set; }

        [DataMember(Name = "amountCollected", EmitDefaultValue = true)]
        public decimal AmountCollected { get; set; }

        [DataMember(Name = "amountCredited", EmitDefaultValue = true)]
        public decimal AmountCredited { get; set; }

        [DataMember(Name = "paymentType", EmitDefaultValue = true)]
        public string PaymentType { get; set; }

        [DataMember(Name = "cardType", EmitDefaultValue = false)]
        public string CardType { get; set; }

        [DataMember(Name = "cardNumber", EmitDefaultValue = true)]
        public string CardNumber { get; set; }

        [DataMember(Name = "check", EmitDefaultValue = true)]
        public string CheckNumber { get; set; }

        [DataMember(Name = "transactionId", EmitDefaultValue = true)]
        public string TransactionId { get; set; }

        [DataMember(Name = "transactionDate", EmitDefaultValue = true)]
        public DateTime TransactionDate { get; set; }
    }
}
