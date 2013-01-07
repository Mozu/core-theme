using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.StoreFront.Cart
{
    [DataContract]
    public class Fee
    {
        [DataMember(Name = "feeAmount")]
        public decimal? FeeAmount { get; set; }

        [DataMember(Name = "feeName")]
        public string FeeName { get; set; }

        [DataMember(Name = "feeDescription")]
        public string FeeDescription { get; set; }
    }
}
