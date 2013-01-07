using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models
{
    [DataContract]
    public class AutoCompleteField<T>
    {
        [DataMember(Name = "value")]
        public T Value { get; set; }

        [DataMember(Name = "display")]
        public string Display { get; set; }

        [DataMember(Name = "isConfigurable", EmitDefaultValue = false)]
        public bool? IsConfigurable { get; set; }

        [DataMember(Name = "path" , EmitDefaultValue=false)]
        public string Path { get; set; }

        
    }
}