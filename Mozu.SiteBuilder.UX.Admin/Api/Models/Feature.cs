using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models
{
    [DataContract]
    public class Feature
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "version")]
        public string Version { get; set; }
    }
}