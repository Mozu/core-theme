using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Orders
{
    [DataContract]
    public class Category : ModelBase
    {
        [DataMember(Name = "id")]
        public int? Id { get; set; }

        [DataMember(Name = "parent")]
        public Category Parent { get; set; }
    }
}
