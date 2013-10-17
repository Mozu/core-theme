using System.Collections.Generic;
using System.Runtime.Serialization;
using DC = Mozu.SiteSettings.Order.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout
{
    /// <summary>
    /// Flattens out Mozu.SiteSettings.Order.Contracts.CheckoutSettings for UI.
    /// Though the CheckoutSettings contract supports a list of gateways, this object
    /// supports only one gateway account.
    /// </summary>
    [DataContract]
    public class CheckoutSettings
    {
        /// <summary>
        /// Surrogate id for ExtJS to record this object properly in a store.
        /// </summary>
        [DataMember(Name="id")]
        public string Id { get { return Gateway != null ? Gateway.Id : null; } set { } }

        /// <summary>
        /// Corresponds to OrderProcessingSettings.PaymentProcessingFlowType
        /// </summary>
        [DataMember(Name = "paymentProcessingFlowType")]
        public string PaymentProcessingFlowType { get; set; }

        /// <summary>
        /// Corresponds to CustomerCheckoutSettings.CustomerCheckoutType
        /// </summary>
        [DataMember(Name = "customerCheckoutType")]
        public string CustomerCheckoutType { get; set; }

        /// <summary>
        /// Corresponds to PaymentSettings.PayByMail
        /// </summary>
        [DataMember(Name = "payByMail")]
        public bool PayByMail { get; set; }

        /// <summary>
        /// Corresponds to PaymentSettings.Gateways[0]
        /// </summary>
        [DataMember(Name="gateway")]
        public Gateway Gateway { get; set; }

        /// <summary>
        /// Corresponds to PaymentSettings.ExternalPaymentWorkflowDefinitions[]
        /// </summary>
        [DataMember(Name = "externalPaymentWorkflows")]
        public List<DC.ExternalPaymentWorkflowDefinition> ExternalPaymentWorkflows { get; set; }
    }
}