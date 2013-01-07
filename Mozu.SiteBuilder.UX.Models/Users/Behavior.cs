using System.Runtime.Serialization;

namespace Volusion.SiteBuilder.UX.Models.Users
{
    [DataContract]
    public class Behavior
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }
    }
}