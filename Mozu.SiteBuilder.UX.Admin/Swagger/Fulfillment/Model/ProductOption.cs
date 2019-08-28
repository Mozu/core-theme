using System;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Fulfillment.Contracts.Model {

  /// <summary>
  /// 
  /// </summary>
  [DataContract]
  public class ProductOption {
    /// <summary>
    /// Gets or Sets AttributeFQN
    /// </summary>
    [DataMember(Name="attributeFQN", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "attributeFQN")]
    public string AttributeFQN { get; set; }

    /// <summary>
    /// Gets or Sets Attributes
    /// </summary>
    [DataMember(Name="attributes", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "attributes")]
    public Dictionary<string, Object> Attributes { get; set; }

    /// <summary>
    /// Gets or Sets DataType
    /// </summary>
    [DataMember(Name="dataType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "dataType")]
    public string DataType { get; set; }

    /// <summary>
    /// Gets or Sets Name
    /// </summary>
    [DataMember(Name="name", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "name")]
    public string Name { get; set; }

    /// <summary>
    /// Gets or Sets ShopperEnteredValue
    /// </summary>
    [DataMember(Name="shopperEnteredValue", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shopperEnteredValue")]
    public Object ShopperEnteredValue { get; set; }

    /// <summary>
    /// Gets or Sets StringValue
    /// </summary>
    [DataMember(Name="stringValue", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "stringValue")]
    public string StringValue { get; set; }

    /// <summary>
    /// Gets or Sets Value
    /// </summary>
    [DataMember(Name="value", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "value")]
    public Object Value { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class ProductOption {\n");
      sb.Append("  AttributeFQN: ").Append(AttributeFQN).Append("\n");
      sb.Append("  Attributes: ").Append(Attributes).Append("\n");
      sb.Append("  DataType: ").Append(DataType).Append("\n");
      sb.Append("  Name: ").Append(Name).Append("\n");
      sb.Append("  ShopperEnteredValue: ").Append(ShopperEnteredValue).Append("\n");
      sb.Append("  StringValue: ").Append(StringValue).Append("\n");
      sb.Append("  Value: ").Append(Value).Append("\n");
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
