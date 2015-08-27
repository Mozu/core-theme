using System;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    
    public class PaymentInteraction
    {
        /// <summary>
        /// Unique identifier of this payment transaction.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Id { get; set; }

        /// <summary>
        /// Id of this interaction's parent.
        /// </summary>
        public string PaymentId { get; set; }

        public string GatewayTransactionId { get; set; }

        /// <summary>
        /// Unique identifier of the gateway interaction. Used for credit card transactions, where the  
        /// payment service creates a GatewayInteractionId for each transaction interaction. 
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int? GatewayInteractionId { get; set; }

        /// <summary>
        /// Id of previous OrderPaymentInteraction that this OrderPaymentInteraction is modifying. 
        /// For instance, when crediting a capture, set the GatewayInteractionIdReference to the capture GatewayInteractionId.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int? GatewayInteractionIdReference { get; set; }

        /// <summary>
        /// Types of transaction interactions
        /// "Authorization," "Capture," "AuthorizeAndCapture,"  "Void," "Credit," "CheckRequested," or "CheckReceived."
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string InteractionType { get; set; }

        /// <summary>
        /// If paying by check, the check number.
        /// </summary>
        public string CheckNumber { get; set; }

        /// <summary>
        /// Status of the payment transaction interaction
        /// "Success" or "Failure."
        /// </summary>        
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Status { get; set; }

        /// <summary>
        /// Gateway Response Code.
        /// </summary>        
        public string GatewayResponseCode { get; set; }

        /// <summary>
        /// Gateway Response Message.
        /// </summary>
        public string GatewayResponseText { get; set; }

        /// <summary>
        /// Amount of funds to withdraw to pay for this order.
        /// </summary>        
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public decimal? Amount { get; set; }

        /// <summary>
        /// If the payment is a manual payment, this is set to true
        /// </summary>
        public bool IsManual { get; set; }

        /// <summary>
        /// Create date of this interaction.
        /// </summary>
        public DateTime? CreateDate { get; set; }

        /// <summary>
        /// True if the user can edit this interaction.
        /// </summary>
        public bool CanEdit { get { return IsManual; } set { } }

        /// <summary>
        /// True if the user can delete this interaction.
        /// </summary>
        public bool CanDelete { get { return IsManual; } set { } }
    }


}
