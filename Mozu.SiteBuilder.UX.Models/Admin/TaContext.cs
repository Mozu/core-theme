using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UX.Models.Admin
{
    [DataContract ]
    public class TaContext
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "siteCollections")]
        public List<TaContextSiteCollection> SiteCollections { get; set; }
    }

    [DataContract]
    public class TaContextSiteCollection
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "sites")]
        public List<TaContextSite> Sites { get; set; }
    }
    
    [DataContract]
    public class TaContextSite
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "stagingHost")]
        public string StagingHost { get; set; }

        [DataMember(Name = "defaultHost")]
        public string DefaultHost { get; set; }
    }
}
