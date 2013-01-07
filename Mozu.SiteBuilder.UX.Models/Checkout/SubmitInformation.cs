using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Checkout
{
    [DataContract]
    public class SubmitInformation : CheckoutInformation
    {
        [DataMember(Name = "createAccount")]
        public bool CreateAccount { get; set; }

        [DataMember(Name = "agreeToTerms")]
        public bool AgreeToTerms { get; set; }

        [DataMember(Name = "comments")]
        public string Comments { get; set; }

        [DataMember(Name = "email")]
        public string Email { get; set; }

        [DataMember(Name = "password")]
        public string Password { get; set; }
    }
}