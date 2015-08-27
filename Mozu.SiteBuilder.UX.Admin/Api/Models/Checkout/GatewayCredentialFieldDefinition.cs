using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout
{
    
    public class GatewayCredentialFieldDefinition
    {
        public string Name { get; set; }

        public string DisplayName { get; set; }

        public int AdminDisplayOrder { get; set; }

        public string VolusionStoreName { get; set; }
    }
}
