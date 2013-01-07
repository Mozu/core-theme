using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Checkout
{
    [DataContract]
    public class PaymentInformation : AddressInformation
    {
        [DataMember(Name = "isSameBillingShippingAddress")]
        public bool? IsSameBillingShippingAddress { get; set; }

        [DataMember(Name = "paymentMethod")]
        public string PaymentMethod { get; set; }

        [DataMember(Name = "nameOnCheck")]
        public string NameOnCheck { get; set; }

        [DataMember(Name = "checkNumber")]
        public string CheckNumber { get; set; }

        [DataMember(Name = "nameOnCard")]
        public string NameOnCard { get; set; }

        [DataMember(Name = "cardExpireMonth")]
        public short? CardExpireMonth { get; set; }

        [DataMember(Name = "cardExpireYear")]
        public short? CardExpireYear { get; set; }

        [DataMember(Name = "cvv")]
        public string CVV { get; set; }

        [DataMember(Name = "cardType")]
        public string CardType { get; set; }

        [DataMember(Name = "cardNumber")]
        public string CardNumber { get; set; }

        [DataMember(Name = "paymentOrCardType", EmitDefaultValue = false)]
        public string PaymentOrCardType { get; set; }

        [DataMember(Name = "cardNumberPartOrMask", EmitDefaultValue = false)]
        public string CardNumberPartOrMask { get; set; }

        [DataMember(Name = "paymentServiceCardId")]
        public string PaymentServiceCardId { get; set; }

        [DataMember(Name = "paymentType", EmitDefaultValue = false)]
        public string PaymentType { get; set; }

        [DataMember(Name = "email")]
        public string Email { get; set; }

        [DataMember(Name = "phone")]
        public string Phone { get; set; }
    }
}