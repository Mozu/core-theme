using System;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    [DataContract]
    public class Adjustment
    {
        [DataMember(Name = "amount")]
        public decimal? Amount { get; set; }

        [DataMember(Name = "description")]
        public string Description { get; set; }

        [DataMember(Name = "internalComment")]
        public string InternalComment { get; set; }
    }
}
