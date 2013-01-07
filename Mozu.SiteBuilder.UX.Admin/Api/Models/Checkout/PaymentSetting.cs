using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout
{
    public class PaymentSettings
    {
        [DataMember(Name = "gateway")]
        public GatewayAccount Gateway { get; set; }

        [DataMember(Name = "supportedCards")]
        public List<KeyValuePair<string, string>> SupportedCards { get; set; }
    }
}