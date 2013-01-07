using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Orders
{
    [DataContract]
    public class ProductStock : ModelBase
    {
        [DataMember(Name = "manageStock")]
        public bool ManageStock { get; set; }

        [DataMember(Name = "isBackOrderAllowed")]
        public bool? IsBackOrderAllowed { get; set; }
    }
}
