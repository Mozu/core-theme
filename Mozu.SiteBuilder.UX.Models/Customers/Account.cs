using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Customers
{
    [DataContract]
    public class Account
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "userId")]
        public string UserId { get; set; }

        [DataMember(Name = "orders")]
        public List<CommerceSummary> Orders { get; set; }

        [DataMember(Name = "createdOn")]
        public DateTime CreatedOn { get; set; }

        [DataMember(Name = "shippingContacts")]
        public List<Contact> ShippingContacts { get; set; }

        [DataMember(Name = "tags")]
        public List<string> Tags { get; set; }

        [DataMember(Name = "billingContacts")]
        public List<Contact> BillingContacts { get; set; }

        [DataMember(Name = "primaryContact")]
        public Contact PrimaryContact { get; set; }

        [DataMember(Name = "notes")]
        public List<CustomerAccountNote> Notes { get; set; }
    }
}