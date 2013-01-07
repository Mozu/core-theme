using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Checkout
{
    [DataContract]
    public class CheckoutActionInformation : CheckoutInformation
    {
        [DataMember(Name = "action")]
        public string Action { get; set; }
    }
}