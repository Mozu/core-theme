using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models
{
    [DataContract]
    public class OrderCustomer
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name="firstName")]
        public string FirstName { get; set; }

        [DataMember(Name = "lastName")]
        public string LastName { get; set; }

        [DataMember(Name = "customerSince")]
        public DateTime CustomerSince { get; set; }

        [DataMember(Name = "totalOrders")]
        public int TotalOrders { get; set; }

        [DataMember(Name = "totalSpent")]
        public decimal TotalSpent { get; set; }

        [DataMember(Name = "groups")]
        public List<string> Groups { get; set; }
    }
}
