using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// Audit Item Quantity
    /// </summary>
    [DataContract]
  public class AuditItemQuantity {
    /// <summary>
    /// Part Number
    /// </summary>
    /// <value>Part Number</value>
    [DataMember(Name="partNumber", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "partNumber")]
    public string PartNumber { get; set; }

    /// <summary>
    /// UPC
    /// </summary>
    /// <value>UPC</value>
    [DataMember(Name="upc", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "upc")]
    public string Upc { get; set; }

    /// <summary>
    /// SKU
    /// </summary>
    /// <value>SKU</value>
    [DataMember(Name="sku", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "sku")]
    public string Sku { get; set; }

    /// <summary>
    /// Expected Quantity of items
    /// </summary>
    /// <value>Expected Quantity of items</value>
    [DataMember(Name="expectedQuantity", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "expectedQuantity")]
    public int? ExpectedQuantity { get; set; }

    /// <summary>
    /// Actual quantity of items
    /// </summary>
    /// <value>Actual quantity of items</value>
    [DataMember(Name="actualQuantity", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "actualQuantity")]
    public int? ActualQuantity { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class AuditItemQuantity {\n");
      sb.Append("  PartNumber: ").Append(PartNumber).Append("\n");
      sb.Append("  Upc: ").Append(Upc).Append("\n");
      sb.Append("  Sku: ").Append(Sku).Append("\n");
      sb.Append("  ExpectedQuantity: ").Append(ExpectedQuantity).Append("\n");
      sb.Append("  ActualQuantity: ").Append(ActualQuantity).Append("\n");
      sb.Append("}\n");
      return sb.ToString();
    }

    /// <summary>
    /// Get the JSON string presentation of the object
    /// </summary>
    /// <returns>JSON string presentation of the object</returns>
    public string ToJson() {
      return JsonConvert.SerializeObject(this, Formatting.Indented);
    }

}
}
