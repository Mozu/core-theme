using System.Runtime.Serialization;
namespace Mozu.SiteBuilder.UX.Models.StoreFront.Catalog
{
    [DataContract()]
    public class BaseProductAttributeValue : BaseProductAttribute
    {
      

        //[DataMember(Name = "sequence")]
        //public int? Sequence { get; set; }

        

        [DataMember(Name = "value", EmitDefaultValue = true)]
        public string  Value
        {
            get
            {
                object obj =  this.StringValue != null ? (object)this.StringValue.Value :
                    this.IntegerValue != null ? (object)this.IntegerValue.Value :
                    this.DecimalValue != null ? (object)this.DecimalValue.Value :
                    this.DateTimeValue != null ? (object)this.DateTimeValue.Value : 
                    null;
                return obj == null ? null : obj.ToString();

            }
            set { }
        }

        public AttributeValueString StringValue { get; set; }
        public AttributeValueInteger IntegerValue { get; set; }
        public AttributeValueDecimal DecimalValue { get; set; }
        public AttributeValueDateTime DateTimeValue { get; set; }
    }
}