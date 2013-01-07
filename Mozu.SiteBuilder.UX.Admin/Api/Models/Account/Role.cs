using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Account
{
    [DataContract]
    public class Role
    {
        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "behaviors")]
        public List<int> Behaviors { get; set; }

        [DataMember(Name = "id")]
        public int Id { get; set; }
    }
}
