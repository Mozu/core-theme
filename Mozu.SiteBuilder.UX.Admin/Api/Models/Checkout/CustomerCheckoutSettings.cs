using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout
{
    [DataContract]
    public class CustomerCheckoutSettings
    {
        [DataMember(Name = "customerCheckoutType")]
        public string CustomerCheckoutType { get; set; }
    }
}