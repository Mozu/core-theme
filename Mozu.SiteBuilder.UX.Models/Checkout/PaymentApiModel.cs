using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Checkout
{
    [DataContract]
    public class PaymentApiModel : ModelBase
    {
        [DataMember(Name = "base")]
        public string Base { get; set; }

        [DataMember(Name = "createCard")]
        public string CreateCard { get; set; }

        [DataMember(Name = "updateCard")]
        public string UpdateCard { get; set; }
    }
}