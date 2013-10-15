using System.Collections.Generic;
using System.Runtime.Serialization;
using DC = Mozu.PaymentService.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout
{
    /// <summary>
    /// Flattens out Mozu.SiteSettings.Order.Contracts.Gateway for UI.
    /// </summary>
    [DataContract]
    public class Gateway
    {
        /// <summary>
        /// Corresponds to AreGatewayCredentialFieldsSet.
        /// Controls whether PUT requests to the service on this gateway object should affect the credentials list.
        /// </summary>
        [DataMember(Name = "credentialsSet")]
        public bool AreGatewayCredentialFieldsSet { get; set; }

        /// <summary>
        /// Corresponds to SupportedCards.
        /// A list of card types supported by this gateway.
        /// </summary>
        [DataMember(Name = "supportedCards")]
        public List<string> SupportedCards { get; set; }

        /// <summary>
        /// Corresponds to GatewayAccount.CountryCode
        /// </summary>
        [DataMember(Name = "countryCode")]
        public string CountryCode { get; set; }

        /// <summary>
        /// Corresponds to GatewayAccount.Id
        /// </summary>
        [DataMember(Name = "id")]
        public string Id { get; set; }

        /// <summary>
        /// Corresponds to GatewayAccount.IsActive
        /// </summary>
        [DataMember(Name = "isActive")]
        public bool IsActive { get; set; }

        /// <summary>
        /// Corresponds to GatewayAccount.GatewayDefinitionId
        /// </summary>
        [DataMember(Name = "gatewayDefinitionId")]
        public string GatewayDefinitionId { get; set; }

        /// <summary>
        /// Corresponds to GatewayAccount.Credentials
        /// </summary>
        [DataMember(Name = "credentials")]
        public List<DC.GatewayCredentialFieldValue> Credentials { get; set; }
    }
}