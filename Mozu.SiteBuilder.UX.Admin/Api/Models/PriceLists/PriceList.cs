using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Mozu.Core.Api.Contracts;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.PriceLists
{
    public class PriceList
    {
        public string Code { get; set; }
        
        public string Name { get; set; }

        public string Description { get; set; }

        /// <summary>
        /// Parent PriceList code, Can be null for root level priceLists
        /// </summary>
        public string ParentCode { get; set; }
        
        /// <summary>
        /// Parent PriceList name, Can be null for root level priceLists
        /// </summary>
        public string ParentName { get; set; }

        /// <summary>
        /// Is the price list enabled and valid in the storefront. Default is true. 
        /// </summary>
        [DataMember(EmitDefaultValue = false)]
        public bool Enabled { get; set; }

        /// <summary>
        /// When true, only products with valid price list entries will be visible in the storefront. Default is false
        /// </summary>
        [DataMember(EmitDefaultValue = false)]
        public bool FilteredInStorefront { get; set; }

        /// <summary>
        /// When true, no valid sites need to be specifiied. Price list is considered valid for all sites. Default is true
        /// </summary>
        [DataMember(EmitDefaultValue = false)]
        public bool ValidForAllSites { get; set; }

        /// <summary>
        /// When ValidForAllSites = false, a list of siteIDs that the price list is valid for should be supplied
        /// </summary>
        public int[] ValidSites { get; set; }

        public int[] DefaultForSites { get; set; }

        /// <summary>
        /// Sequence used for indexing this price list...1-max priceList will be indexed
        /// </summary>
        [DataMember(EmitDefaultValue = false)]
        public int? SearchIndexSequence { get; set; }

        /// <summary>
        /// Used to prioritize price list resolution when more than 1 price list maps
        /// </summary>
        [DataMember(EmitDefaultValue = false)]
        public int? ResolutionRank { get; set; }

        [DataMember(EmitDefaultValue = false)]
        public bool? Resolvable { get; set; }

        public string CreateBy { get; set; }

        public DateTime? CreateDate { get; set; }

        [JsonProperty(PropertyName = "lastModifiedBy")]
        public string UpdateBy { get; set; }

        [JsonProperty(PropertyName = "lastModifiedDate")]
        public DateTime? UpdateDate { get; set; }

        //todo

        public List<string> CustomerSegments { get; set; }

        public List<string> CustomerSegmentNames { get; set; }

    }

}