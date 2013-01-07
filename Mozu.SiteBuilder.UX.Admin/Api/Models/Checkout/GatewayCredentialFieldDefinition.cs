using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout
{
    [DataContract]
    public class GatewayCredentialFieldDefinition
    {
        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "displayName")]
        public string DisplayName { get; set; }

        [DataMember(Name = "adminDisplayOrder")]
        public int AdminDisplayOrder { get; set; }

        [DataMember(Name = "volusionStoreName")]
        public string VolusionStoreName { get; set; }
    }
}