using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

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

        public List<SupportedCard> SupportedCards { get; set; }

        public List<GatewayCredentialFieldDefinition> CredentialDefinitions { get; set; }

        public PreAuthorizeDefinition PreAuthorizeDefinition { get; set; }
        public JArray AdministationUi { get; set; }
    }
}
