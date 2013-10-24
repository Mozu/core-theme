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
        public List<MasterCatalog> MasterCatalogs { get; set; }
    }

    [DataContract]
    public class MasterCatalog
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "productPublishingMode")]
        public string ProductPublishingMode { get; set; }

        [DataMember(Name = "sites")]
        public List<TaContextSite> Sites { get; set; }

        [DataMember(Name = "catalogs")]
        public List<TaContextCatalog> Catalogs { get; set; }
    }


    [DataContract]
    public class TaContextCatalog
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }


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

        [DataMember(Name = "contentPublishingMode")]
        public string ContentPublishingMode { get; set; }
        
    }
}
