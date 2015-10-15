using System.Runtime.Serialization;
namespace Mozu.SiteBuilder.UX.Models.StoreFront.Catalog
{
    [DataContract()]
    public class BaseProductAttribute : ModelBase
    {
        [DataMember(Name = "headerId", EmitDefaultValue = false )]
        public int? HeaderId { get; set; }
        [DataMember(Name = "id", EmitDefaultValue = false)]
        public int Id { get; set; }
        [DataMember(Name = "type", EmitDefaultValue = false)]
        public string DataType { get; set; }
        [DataMember(Name = "name", EmitDefaultValue = false)]
        public string Name { get; set; }
        [DataMember(Name = "description", EmitDefaultValue = false)]
        public string Description { get; set; }
    }
}