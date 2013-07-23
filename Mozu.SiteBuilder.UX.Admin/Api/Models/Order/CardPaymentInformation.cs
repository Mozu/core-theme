using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    /// <summary>
    /// Data contract for creating a new payment.
    /// </summary>
    [DataContract]
    public class CardPaymentInformation
    {
        [DataMember(Name = "nameOnCard")]
        public string NameOnCard { get; set; }

        [DataMember(Name = "cardType")]
        public string CardType { get; set; }

        [DataMember(Name = "cardNumber")]
        public string CardNumber { get; set; }

        [DataMember(Name = "paymentServiceCardId")]
        public string PaymentServiceCardId { get; set; }

        [DataMember(Name = "expireMonth")]
        public short ExpireMonth { get; set; }

        [DataMember(Name = "expireYear")]
        public short ExpireYear { get; set; }
    }
}
