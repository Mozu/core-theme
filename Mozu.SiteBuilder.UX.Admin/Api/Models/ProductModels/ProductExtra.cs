using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels
{
    using Attributes;

    //[DataContract]
    //public class ProductExtraValueDeltaPrice
    //{
    //    [DataMember(EmitDefaultValue = false, Name = "currencyCode")]
    //    public string CurrencyCode { get; set; }

    //    [DataMember(EmitDefaultValue = false, Name = "deltaPrice")]
    //    public decimal DeltaPrice { get; set; }
    //}

    [DataContract]
    public class ProductExtraValue
    {
        [DataMember(EmitDefaultValue = false, Name = "value")]
        public object Value { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "delta")]
        public decimal DeltaPrice { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "deltaWeight")]
        public decimal? DeltaWeight { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "isDefaulted")]
        public bool? IsDefaulted { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "detail")]
        public AttributeVocabularyValue AttributeVocabularyValueDetail { get; set; }
    }

    [DataContract]
    public class ProductExtra
    {
        [DataMember(EmitDefaultValue = false, Name = "attributeFQN")]
        public string AttributeFQN { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "isRequired")]
        public bool? IsRequired { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "isMultiSelect")]
        public bool? IsMultiSelect { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "values")]
        public List<ProductExtraValue> Values { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "detail")]
        public Attribute AttributeDetail { get; set; }
    }
}