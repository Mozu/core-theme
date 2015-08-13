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

        [DataMember(Name = "masterCatalogs")]
        public List<MasterCatalog> MasterCatalogs { get; set; }


        [DataMember(Name = "currencies")]
        public Dictionary<string, Mozu.Core.Money.Currency> Currencies { get; set; }

        [DataMember(Name = "contentPublishingEnabled")]
        public bool? ContentPublishingEnabled { get; set; }

        [DataMember(Name = "logzuUrl")]
        public string LogzuUrl { get; set; }
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

        [DataMember(Name = "localeCode")]
        public string Locale { get; set; }

        [DataMember(Name = "currencyCode")]
        public string Currency { get; set; }

         [DataMember(Name = "contentPublishingEnabled")]
        public bool? ContentPublishingEnabled { get; set; }

        /// <summary>
        /// If the publishingMode is Pending and LiveEditsEnabled = true, DataViewMode live can be passed in the header and live products can be directly edited. 
        /// </summary>
        [DataMember(EmitDefaultValue = false)]
        public bool? EnableLiveEdit { get; set; }

    }


    [DataContract]
    public class TaContextCatalog
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "localeCode")]
        public string Locale { get; set; }


        [DataMember(Name = "currencyCode")]
        public string Currency { get; set; }

        [DataMember(Name = "contentPublishingEnabled")]
        public bool? ContentPublishingEnabled { get; set; }


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

        [DataMember(Name = "contentPublishingEnabled")]
        public bool? ContentPublishingEnabled { get; set; }





        [DataMember(Name = "masterCatalogId")]
        public int? MasterCatalogId { get; set; }
         [DataMember(Name = "catalogId")]
        public int? CatalogId { get; set; }

         [DataMember(Name = "isMozuRendered")]
         public bool IsMozuRendered { get; set; }


         [DataMember(Name = "localeCode")]
         public string Locale { get; set; }


         [DataMember(Name = "currencyCode")]
         public string Currency { get; set; }

      


        
    }
}
