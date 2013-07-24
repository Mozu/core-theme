using System;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    [DataContract]
    public class PaymentInteraction
    {
        /// <summary>
        /// Unique identifier of this payment transaction.
        /// </summary>
        [DataMember(Name = "id", EmitDefaultValue = false)]
        public string Id { get; set; }

        /// <summary>
        /// Id of this interaction's parent.
        /// </summary>
        [DataMember(Name = "paymentId")]
        public string PaymentId { get; set; }

        [DataMember(Name = "gatewayTransactionId")]
        public string GatewayTransactionId { get; set; }

        /// <summary>
        /// Unique identifier of the gateway interaction. Used for credit card transactions, where the  
        /// payment service creates a GatewayInteractionId for each transaction interaction. 
        /// </summary>
        [DataMember(Name = "gatewayInteractionId", EmitDefaultValue = false)]
        public int? GatewayInteractionId { get; set; }

        /// <summary>
        /// Id of previous OrderPaymentInteraction that this OrderPaymentInteraction is modifying. 
        /// For instance, when crediting a capture, set the GatewayInteractionIdReference to the capture GatewayInteractionId.
        /// </summary>
        [DataMember(Name = "gatewayInteractionIdReference", EmitDefaultValue = false)]
        public int? GatewayInteractionIdReference { get; set; }

        /// <summary>
        /// Types of transaction interactions
        /// "Authorization," "Capture," "AuthorizeAndCapture,"  "Void," "Credit," "CheckRequested," or "CheckReceived."
        /// </summary>
        [DataMember(Name = "interactionType", EmitDefaultValue = false)]
        public string InteractionType { get; set; }

        /// <summary>
        /// If paying by check, the check number.
        /// </summary>
        [DataMember(Name = "checkNumber", EmitDefaultValue = true)]
        public string CheckNumber { get; set; }

        /// <summary>
        /// Status of the payment transaction interaction
        /// "Success" or "Failure."
        /// </summary>        
        [DataMember(Name = "status", EmitDefaultValue = false)]
        public string Status { get; set; }

        /// <summary>
        /// Amount of funds to withdraw to pay for this order.
        /// </summary>        
        [DataMember(EmitDefaultValue = false, Name = "amount")]
        public decimal? Amount { get; set; }

        /// <summary>
        /// If the payment is a manual payment, this is set to true
        /// </summary>
        [DataMember(EmitDefaultValue=true, Name="isManual")]
        public bool IsManual { get; set; }

        /// <summary>
        /// Create date of this interaction.
        /// </summary>
        [DataMember(Name = "createDate")]
        public DateTime? CreateDate { get; set; }

        /// <summary>
        /// True if the user can edit this interaction.
        /// </summary>
        [DataMember(Name = "canEdit")]
        public bool CanEdit { get { return IsManual; } set { } }

        /// <summary>
        /// True if the user can delete this interaction.
        /// </summary>
        [DataMember(Name = "canDelete")]
        public bool CanDelete { get { return IsManual; } set { } }
    }


}
