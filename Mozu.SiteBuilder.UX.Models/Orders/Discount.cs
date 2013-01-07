using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;

namespace Mozu.SiteBuilder.UX.Models.Orders
{
    [DataContract]
    public class Discount : ModelBase
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "orderItemIds")]
        public List<string> OrderItemIds { get; set; }

        [DataMember(Name = "endDate")]
        public DateTime? EndDate { get; set; }
    }
}
