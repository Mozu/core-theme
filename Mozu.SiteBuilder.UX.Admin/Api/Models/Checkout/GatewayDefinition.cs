using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout
{
    [DataContract]
    public class GatewayDefinition
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "countryCode")]
        public string CountryCode { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "prodServiceURL")]
        public string ProdServiceURL { get; set; }

        [DataMember(Name = "testServiceURL")]
        public string TestServiceURL { get; set; }

        [DataMember(Name = "integrationImplTypeName")]
        public string IntegrationImplTypeName { get; set; }

        [DataMember(Name = "supportedCards")]
        public List<KeyValuePair<string, string>> SupportedCards { get; set; }

        [DataMember(Name = "credentialDefinitions")]
        public List<GatewayCredentialFieldDefinition> CredentialDefinitions { get; set; }

        [DataMember(Name = "preAuthorizeDefinition")]
        public PreAuthorizeDefinition PreAuthorizeDefinition { get; set; }
    }
}