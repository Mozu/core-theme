using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels
{
    [DataContract]
    public class ProductVariation
    {
        [DataMember(EmitDefaultValue = false, Name ="isActive")]
        public bool? IsActive { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "isOrphan")]
        public bool? IsOrphan { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "exists")]
        public bool? VariationExists { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "key")]
        public string Variationkey { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "productCode")]
        public string VariationProductCode { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "deltaPrice")]
        public Decimal? DeltaPriceValue { get; set; }



        [DataMember(EmitDefaultValue = false, Name = "deltaWeight")]
        public Decimal? DeltaWeight { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "stockOnHand")]
        public int? StockOnHand { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "stockOnOrder")]
        public int? StockOnOrder { get; set; }

      

        [DataMember(EmitDefaultValue = false, Name = "options")]
        public List<ProductVariationOption> Options { get; set; }
    }
    [DataContract]
    public class ProductVariationOption
    {
        [DataMember(EmitDefaultValue = false, Name = "attributeFQN")]
        public string AttributeFQN { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "value")]
        public object Value { get; set; }

        //[DataMember(EmitDefaultValue = false)]
        //public AttributeVocabularyValueLocalizedContent Content { get; set; }
    }
}