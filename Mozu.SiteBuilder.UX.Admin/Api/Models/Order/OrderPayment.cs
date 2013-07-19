using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    [DataContract]
    public class OrderPayment
    {
        /// <summary>
        /// Unique identifier of this order transaction. 
        /// </summary>
        [DataMember(Name="id")]
        public string Id { get; set; }

        /// <summary>
        /// Id of the order this payment belongs to.
        /// </summary>
        [DataMember(Name = "orderId")]
        public string OrderId { get; set; }

        /// <summary>
        /// Unique identifier of the transaction, specified by the payment service processesing this transaction. 
        /// </summary>
        [DataMember(Name="paymentServiceTransactionId")]
        public string PaymentServiceTransactionId { get; set; }

        /// <summary>
        /// Current status of this transaction which can be 
        /// "null," "AwaitingCheck," "AwaitingPayment, "Paid," "Declined," "Authorized," or "Void."
        /// </summary>
        [DataMember(Name = "status")]
        public string Status { get; set; }

        [DataMember(Name = "amountCollected", EmitDefaultValue = true)]
        public decimal AmountCollected { get; set; }

        [DataMember(Name = "amountCredited", EmitDefaultValue = true)]
        public decimal AmountCredited { get; set; }

        [DataMember(Name = "interactions", EmitDefaultValue = true)]
        public List<OrderPaymentInteraction> Interactions { get; set; }


        #region BillingInfo

        /// <summary>
        /// Type of Payment
        /// "CreditCard" or "Check"
        /// </summary>
        [DataMember(Name = "paymentType")]
        public string PaymentType { get; set; }

        /// <summary>
        /// Card type such as Visa, MasterCard, American Express, or Discover.
        /// </summary>
        [DataMember(Name = "cardType", EmitDefaultValue = false)]
        public string CardType { get; set; }

        /// <summary>
        /// The visible part of the card number that the merchant uses to refer to 
        /// payment information, for example, the last for digits of the card number.
        /// </summary>
        [DataMember(Name = "cardNumber", EmitDefaultValue = true)]
        public string CardNumber { get; set; }

        /// <summary>
        /// Card holder's name as it appears on the card.
        /// </summary>
        [DataMember(EmitDefaultValue = false)]
        public string NameOnCard { get; set; }

        #endregion

        #region workflow shit

        [DataMember(Name="availableActions", EmitDefaultValue=true)]
        public List<string> AvailableActions { get; set; }

        #endregion

        #region calculated fields

        /// <summary>
        ///  auth ready is when you have an authorized card with id
        /// </summary>
        [DataMember(Name = "authReady")]
        public bool AuthReady { get; set; }

        #endregion

        [DataMember(Name = "createDate")]
        public DateTime CreateDate { get; set; }
    }
}
