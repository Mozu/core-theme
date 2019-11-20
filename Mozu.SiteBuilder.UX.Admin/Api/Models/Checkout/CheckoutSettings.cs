using System.Collections.Generic;
using Newtonsoft.Json;
using DC = Mozu.SiteSettings.Order.Contracts;
using System.Linq;

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
        public string Id
        {
            get
            {
                var gatewayId = string.Empty;
                if (CardGatewayMap != null && CardGatewayMap.Count > 0)
                {
                    var card = CardGatewayMap.FirstOrDefault(g => !string.IsNullOrEmpty(g.GatewayId));
                    if (card != null)
                        gatewayId = card.GatewayId;
                }
                return gatewayId;
            }
            set { }
        }

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

        //TODO: remove when old admin goes away.
        /// <summary>
        /// Corresponds to PaymentSettings.Gateways[0]
        /// </summary>
        public Gateway Gateway { get; set; }

        /// <summary>
        /// Corresponds to PaymentSettings.Gateways
        /// </summary>
        public List<CardGateway> CardGatewayMap { get; set; }

        /// <summary>
        /// Corresponds to PaymentSettings.ExternalPaymentWorkflowDefinitions
        /// </summary>
        public List<DC.ExternalPaymentWorkflowDefinition> ExternalPaymentWorkflows { get; set; }

        /// <summary>
        /// Corresponds to PaymentSettings.PurchaseOrder
        /// </summary>
        public DC.PurchaseOrderPaymentDefinition PurchaseOrder { get; set; }

        /// <summary>
        /// Corresponds to OrderProcessingSettings for a Giftcard Gateway
        /// </summary>
        public string GiftCardProcessingType { get; set; }

        public List<DC.ThirdPartyPaymentSetting> ThirdPartyPaymentSettings { get; set; }

    }

    public class CardGateway
    {
        public string CardType { get; set; }

        public string PaymentType { get; set; }

        public string CardDisplay { get; set; }

        public bool IsEnabled { get; set; }

        public string GatewayId { get; set; }

        public string GatewayName { get; set; }

        public string ProcessingGatewayId { get; set; }
        public string ProcessingGatewayName { get; set; }
    }

    internal static class CARD_TYPE
    {
        /// <summary>
        /// Application name for logging purposes.
        /// </summary>
        public const string OTHER = "OTHER";
    }
}
