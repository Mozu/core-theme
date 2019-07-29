using System;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Fulfiller.Contracts.Model {

  /// <summary>
  /// 
  /// </summary>
  [DataContract]
  public class PackageItem {
    /// <summary>
    /// Gets or Sets Attributes
    /// </summary>
    [DataMember(Name="attributes", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "attributes")]
    public Dictionary<string, Object> Attributes { get; set; }

    /// <summary>
    /// Gets or Sets FulfillmentItemType
    /// </summary>
    [DataMember(Name="fulfillmentItemType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "fulfillmentItemType")]
    public string FulfillmentItemType { get; set; }

    /// <summary>
    /// Gets or Sets LineId
    /// </summary>
    [DataMember(Name="lineId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "lineId")]
    public int? LineId { get; set; }

    /// <summary>
    /// Gets or Sets OptionAttributeFQN
    /// </summary>
    [DataMember(Name="optionAttributeFQN", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "optionAttributeFQN")]
    public string OptionAttributeFQN { get; set; }

    /// <summary>
    /// Gets or Sets ProductCode
    /// </summary>
    [DataMember(Name="productCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "productCode")]
    public string ProductCode { get; set; }

    /// <summary>
    /// Gets or Sets Quantity
    /// </summary>
    [DataMember(Name="quantity", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "quantity")]
    public int? Quantity { get; set; }

    /// <summary>
    /// Gets or Sets VariationProductCode
    /// </summary>
    [DataMember(Name="variationProductCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "variationProductCode")]
    public string VariationProductCode { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class PackageItem {\n");
      sb.Append("  Attributes: ").Append(Attributes).Append("\n");
      sb.Append("  FulfillmentItemType: ").Append(FulfillmentItemType).Append("\n");
      sb.Append("  LineId: ").Append(LineId).Append("\n");
      sb.Append("  OptionAttributeFQN: ").Append(OptionAttributeFQN).Append("\n");
      sb.Append("  ProductCode: ").Append(ProductCode).Append("\n");
      sb.Append("  Quantity: ").Append(Quantity).Append("\n");
      sb.Append("  VariationProductCode: ").Append(VariationProductCode).Append("\n");
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
