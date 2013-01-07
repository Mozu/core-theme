using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Checkout
{
    [DataContract]
    public class ContactInformation : AddressInformation
    {
        [DataMember(Name = "id")]
        public int? Id { get; set; }

        [DataMember(Name = "email")]
        public string Email { get; set; }

        [DataMember(Name = "companyOrOrganization")]
        public string CompanyOrOrganization { get; set; }
    }
}