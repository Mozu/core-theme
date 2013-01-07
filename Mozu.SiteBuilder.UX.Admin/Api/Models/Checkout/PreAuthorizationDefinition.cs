using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout
{
    [DataContract]
    public class PreAuthorizeDefinition
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "preAuthorizeTestUrl")]
        public string PreAuthorizeTestUrl { get; set; }

        [DataMember(Name = "preAuthorizeProdUrl")]
        public string PreAuthorizeProdUrl { get; set; }

        [DataMember(Name = "type")]
        public PreAuthorizeTransactionTypeDataContract Type { get; set; }
    }
}