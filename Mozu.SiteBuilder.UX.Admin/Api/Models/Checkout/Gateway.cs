using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using DC = Mozu.PaymentService.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout
{
    /// <summary>
    /// Flattens out Mozu.SiteSettings.Order.Contracts.Gateway for UI.
    /// </summary>
    
    public class Gateway
    {
        /// <summary>
        /// Corresponds to AreGatewayCredentialFieldsSet.
        /// Controls whether PUT requests to the service on this gateway object should affect the credentials list.
        /// </summary>
        [JsonProperty(PropertyName = "credentialsSet")]
        public bool AreGatewayCredentialFieldsSet { get; set; }

        /// <summary>
        /// Corresponds to SupportedCards.
        /// A list of card types supported by this gateway.
        /// </summary>
        public List<string> SupportedCards { get; set; }

        /// <summary>
        /// Corresponds to GatewayAccount.CountryCode
        /// </summary>
        public string CountryCode { get; set; }

        /// <summary>
        /// Corresponds to GatewayAccount.Id
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Corresponds to GatewayAccount.IsActive
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// Corresponds to GatewayAccount.GatewayDefinitionId
        /// </summary>
        public string GatewayDefinitionId { get; set; }

        /// <summary>
        /// Corresponds to GatewayAccount.Credentials
        /// </summary>
        public JObject Credentials { get; set; }
    }
}
