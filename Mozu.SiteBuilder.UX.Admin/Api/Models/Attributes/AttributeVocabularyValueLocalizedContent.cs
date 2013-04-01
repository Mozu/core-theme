using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes
{
    [DataContract]
    public class AttributeVocabularyValue
    {
        [DataMember(EmitDefaultValue = false, Name = "sequence")]
        public int? ValueSequence { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "value")]
        public object Value { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "content")]
        public AttributeVocabularyValueLocalizedContent Content { get; set; }
    }

    [DataContract]
    public class AttributeVocabularyValueLocalizedContent
    {
        [DataMember(EmitDefaultValue = false, Name = "localCode")]
        public string LocaleCode { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "stringValue")]
        public string StringValue { get; set; }
    }
}