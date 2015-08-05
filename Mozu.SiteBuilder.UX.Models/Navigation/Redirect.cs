using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Navigation
{
    [DataContract]
    public class RedirectEntry
    {
        
        [DataMember(Name = "s", EmitDefaultValue = false, IsRequired = true, Order = 0)]
        public string Source { get; set; }

        [DataMember(Name = "d", EmitDefaultValue = false, IsRequired = true, Order = 1)]
        public string Destination { get; set; }

        [DataMember(Name = "rw", EmitDefaultValue = false, IsRequired = false, Order = 2)]
        public bool? IsRewrite { get; set; }

         [DataMember(Name = "t", EmitDefaultValue = false, IsRequired = false, Order = 3)]
        public bool? IsTemporary { get; set; }
         [DataMember(Name = "q", EmitDefaultValue = false, IsRequired = false, Order = 4)]
        public bool? CopyQueryString { get; set; }
    }

    public class RedirectFormats
    {
        [DataMember(Name = "format", EmitDefaultValue = false, IsRequired = false, Order = 1)]
        public string Format { get; set; }

        [DataMember(Name = "entityType", EmitDefaultValue = false, IsRequired = false, Order = 1)]
        public string EntityType { get; set; }

    }

    public enum PageTypes
    {
        documentList,
        documentListView,
        document
    }
}
