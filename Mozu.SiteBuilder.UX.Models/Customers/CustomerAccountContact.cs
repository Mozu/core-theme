using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Customers
{
    [DataContract]
    public class CustomerAccountContact
    {
        [DataMember(Name = "id")]
        public int? Id { get; set; }

        [DataMember(Name = "contact")]
        public Contact Contact { get; set; }

        [DataMember(Name = "isPrimary")]
        public bool? IsPrimary { get; set; }

        [DataMember(Name = "contactType")]
        public CustomerContactType? ContactType { get; set; }
    }




    [DataContract]
    public enum CustomerContactType
    {
        [EnumMember] Shipping = 1,
        [EnumMember] Billing = 2,
        [EnumMember] BillingAndShipping = 3,
    }
}