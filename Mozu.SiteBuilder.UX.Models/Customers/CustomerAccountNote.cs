using System;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Customers
{
    [DataContract]
    public class CustomerAccountNote
    {
        [DataMember(Name = "id")]
        public int? Id { get; set; }

        [DataMember(Name = "content")]
        public string Content { get; set; }

        [DataMember(Name = "createdOn")]
        public DateTime CreatedOn { get; set; }

        [DataMember(Name = "createdBy")]
        public string CreatedBy { get; set; }
    }
}