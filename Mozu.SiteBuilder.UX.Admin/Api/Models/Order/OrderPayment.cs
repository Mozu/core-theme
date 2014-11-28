using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    
    public class OrderPayment
    {
        /// <summary>
        /// Unique identifier of this order transaction. 
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Id of the order this payment belongs to.
        /// </summary>
        public string OrderId { get; set; }

        /// <summary>
        /// Unique identifier of the transaction, specified by the payment service processesing this transaction. 
        /// </summary>
        public string PaymentServiceTransactionId { get; set; }

        /// <summary>
        /// Current status of this transaction which can be 
        /// "null," "AwaitingCheck," "AwaitingPayment, "Paid," "Declined," "Authorized," or "Void."
        /// </summary>
        public string Status { get; set; }

        public decimal AmountRequested { get; set; }

        public decimal AmountCollected { get; set; }

        public decimal AmountAuthorized { get; set; }

        public decimal AmountCredited { get; set; }

        public List<PaymentInteraction> Interactions { get; set; }


        #region BillingInfo

        /// <summary>
        /// Type of Payment
        /// "CreditCard" or "Check"
        /// </summary>
        public string PaymentType { get; set; }

        /// <summary>
        /// Billing Contact for this payment.
        /// </summary>
        public Contact BillingContact { get; set; }

        /// <summary>
        /// Store credit code used to create this payment, if it's a storecredit payment
        /// </summary>
        public string StoreCreditCode { get; set; }

        /// <summary>
        /// Card type such as Visa, MasterCard, American Express, or Discover.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string CardType { get; set; }

        /// <summary>
        /// The visible part of the card number that the merchant uses to refer to 
        /// payment information, for example, the last for digits of the card number.
        /// </summary>
        public string CardNumber { get; set; }

        /// <summary>
        /// Card holder's name as it appears on the card.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string NameOnCard { get; set; }

        public short? ExpireMonth { get; set; }

        public short? ExpireYear { get; set; }

        #endregion

        #region workflow shit

        public List<string> AvailableActions { get; set; }

        #endregion

        #region calculated fields
        /// <summary>
        /// True if all interactions on this payment are manual interactions.
        /// Manual payments can't have any gateway interactions performed on them.
        /// Only new manual interactions can be added.
        /// </summary>
        public bool IsManual { get { return Interactions == null || Interactions.Count == 0 || Interactions.All(i => i.IsManual || i.InteractionType.StartsWith("Rollback")); } set { } }

        #endregion

        public DateTime CreateDate { get; set; }
    }
}
