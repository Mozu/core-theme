using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Orders
{
    [DataContract]
    public class PackageMeasurements : ModelBase
    {
        [DataMember(Name = "packageHeight")]
        public Measurement PackageHeight { get; set; }

        [DataMember(Name = "packageWidth")]
        public Measurement PackageWidth { get; set; }

        [DataMember(Name = "packageLength")]
        public Measurement PackageLength { get; set; }

        [DataMember(Name = "packageWeight")]
        public Measurement PackageWeight { get; set; }
    }
}
