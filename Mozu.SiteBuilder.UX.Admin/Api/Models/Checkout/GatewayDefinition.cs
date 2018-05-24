using System.Collections.Generic;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout
{
    
    public class GatewayDefinition
    {
        public string Id { get; set; }

        public string CountryCode { get; set; }

        public string Name { get; set; }

        public string ProdServiceURL { get; set; }

        public string TestServiceURL { get; set; }

        public string IntegrationImplTypeName { get; set; }

        public List<KeyValuePair<string, string>> SupportedCards { get; set; }

        public List<GatewayCredentialFieldDefinition> CredentialDefinitions { get; set; }

        public PreAuthorizeDefinition PreAuthorizeDefinition { get; set; }
    }
}
