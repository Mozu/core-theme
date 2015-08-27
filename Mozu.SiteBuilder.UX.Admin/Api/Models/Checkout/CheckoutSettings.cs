using System.Collections.Generic;
using Newtonsoft.Json;
using DC = Mozu.SiteSettings.Order.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout
{
    /// <summary>
    /// Flattens out Mozu.SiteSettings.Order.Contracts.CheckoutSettings for UI.
    /// Though the CheckoutSettings contract supports a list of gateways, this object
    /// supports only one gateway account.
    /// </summary>
    
    public class CheckoutSettings
    {
        /// <summary>
        /// Surrogate id for ExtJS to record this object properly in a store.
        /// </summary>
        public string Id { get { return Gateway != null ? Gateway.Id : null; } set { } }

        /// <summary>
        /// Corresponds to OrderProcessingSettings.PaymentProcessingFlowType
        /// </summary>
        public string PaymentProcessingFlowType { get; set; }

        /// <summary>
        /// Corresponds to CustomerCheckoutSettings.CustomerCheckoutType
        /// </summary>
        public string CustomerCheckoutType { get; set; }

        /// <summary>
        /// Corresponds to PaymentSettings.PayByMail
        /// </summary>
        public bool PayByMail { get; set; }

        /// <summary>
        /// Corresponds to PaymentSettings.Gateways[0]
        /// </summary>
        public Gateway Gateway { get; set; }

        /// <summary>
        /// Corresponds to PaymentSettings.ExternalPaymentWorkflowDefinitions
        /// </summary>
        public List<DC.ExternalPaymentWorkflowDefinition> ExternalPaymentWorkflows { get; set; }
    }
}
