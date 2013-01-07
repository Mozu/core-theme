using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Checkout
{
    [DataContract]
    public class CommentInformation : CheckoutInformation
    {
        [DataMember(Name = "text")]
        public string Text { get; set; }
    }
}