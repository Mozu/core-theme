using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout
{
    [DataContract]
    public class GatewayAccount
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "gatewayDefinitionId")]
        public string GatewayDefinitionId { get; set; }

        [DataMember(Name = "countryCode")]
        public string CountryCode { get; set; }

        [DataMember(Name = "isActive")]
        public bool IsActive { get; set; }

        [DataMember(Name = "credentialFields")]
        public List<GatewayCredentialFieldValue> CredentialFields { get; set; }
    }
}