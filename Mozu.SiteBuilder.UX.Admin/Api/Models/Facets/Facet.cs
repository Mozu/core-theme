using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;
using Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Facets
{
    [DataContract]
    public class FacetSet
    {
        [DataMember(EmitDefaultValue = false, Name = "configured")]
        public List<Facet> Configured { get; set; }



        [DataMember(EmitDefaultValue = false, Name = "categoryId")]
        public int CategoryId { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "available")]
        public List<FacetSource> Available { get; set; }
    }
    [DataContract]
    public class Facet
    {
       
        [DataMember(EmitDefaultValue = false, Name ="id")]
        public int? FacetId { get; set; }



        [DataMember(EmitDefaultValue = false, Name = "sourceId")]
        public string  SourceId { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "sourceName")]
        public string SourceName { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "sourceType")]
        public string SourceType { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "facetType")]
        public string FacetType { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "order")]
        public int Order { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "categoryId")]
        public int CategoryId { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "overrideFacetId")]
        public int? OverrideFacetId { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "isHidden")]
        public bool IsHidden { get; set; }

       

        [DataMember(EmitDefaultValue = false, Name = "isvalid")]
        public bool ValidityIsValid { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "validityCode")]
        public string ValidityReasonCode { get; set; }




        [DataMember(EmitDefaultValue = false, Name = "ranges")]
        public List<FacetRangeQuery> RangeQueries { get; set; }

       
    }
    [DataContract]
    public class FacetRangeQuery
    {
        [DataMember(EmitDefaultValue = false, Name = "start")]
        public object RangeValueStart { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "end")]
        public object RangeValueEnd { get; set; }
    }

    [DataContract]
    public class FacetSource
    {
        [DataMember(EmitDefaultValue = false, Name = "sourceId")]
        public string Id { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "sourceType")]
        public string Type { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "sourceName")]
        public string Name { get; set; }
    }
}