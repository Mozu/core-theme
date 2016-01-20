using System;
using System.Collections.Generic;
using Mozu.Core.Api.Contracts;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.PriceLists
{
    public class PriceList
    {
        public string Code { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public int? Ranking { get; set; }

        public int? SearchIndexSequence { get; set; }

        public List<int> CustomerSegments { get; set; }

        public List<int> Catalogs { get; set; } 

        //public List<PriceListEntry> Entries { get; set; } 

        public bool IsActive { get; set; }

        public string CreateBy { get; set; }

        public DateTime? CreateDate { get; set; }

        [JsonProperty(PropertyName = "lastModifiedBy")]
        public string UpdateBy { get; set; }

        [JsonProperty(PropertyName = "lastModifiedDate")]
        public DateTime? UpdateDate { get; set; }
                       
    }
}