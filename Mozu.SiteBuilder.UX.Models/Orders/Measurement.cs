using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Orders
{
    [DataContract]
    public class Measurement : ModelBase
    {
        [DataMember(Name = "unit")]
        public string Unit { get; set; }

        [DataMember(Name = "value")]
        public decimal? Value { get; set; }
    }
}
