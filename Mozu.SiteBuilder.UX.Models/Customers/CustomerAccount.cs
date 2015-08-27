using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Customers
{
    [DataContract]
    public class CustomerAccount : ModelBase
    {
        private List<CustomerGroup> _groups;

        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "orderSummary")]
        public CommerceSummary CommerceSummary { get; set; }

        [DataMember(Name = "groups")]
        public List<CustomerGroup> Groups
        {
            get { return _groups ?? (_groups = new List<CustomerGroup>()); }
            set { _groups = value; }
        }

        [DataMember(Name = "contacts")]
        public List<CustomerAccountContact> Contacts { get; set; }

        [DataMember(Name = "addresses")]
        public List<Address> Addresses
        {
            get { return Contacts == null ? new List<Address>() : Contacts.Select(x => x.Contact.Address).ToList(); }
        }

        [DataMember(Name = "primaryBillingContact")]
        public Contact PrimaryBillingContact { get; set; }

        [DataMember(Name = "userId")]
        public string UserId { get; set; }

        [DataMember(Name = "notes")]
        public List<CustomerAccountNote> Notes { get; set; }

        [DataMember(Name = "acceptsMarketing")]
        public bool AcceptsMarketing { get; set; }

        [DataMember(Name = "createdOn")]
        public DateTime CreatedOn { get; set; }

//        [DataMember(Name = "orders")]
//        public List<Order> Orders { get; set; }
    }
}