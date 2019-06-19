using System;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace IO.Swagger.Model {

  /// <summary>
  /// 
  /// </summary>
  [DataContract]
  public class StateChangeSuggestion {
    /// <summary>
    /// Gets or Sets OrderItemID
    /// </summary>
    [DataMember(Name="orderItemID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "orderItemID")]
    public int? OrderItemID { get; set; }

    /// <summary>
    /// Gets or Sets Quantity
    /// </summary>
    [DataMember(Name="quantity", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "quantity")]
    public int? Quantity { get; set; }

    /// <summary>
    /// Gets or Sets StateChange
    /// </summary>
    [DataMember(Name="stateChange", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "stateChange")]
    public string StateChange { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class StateChangeSuggestion {\n");
      sb.Append("  OrderItemID: ").Append(OrderItemID).Append("\n");
      sb.Append("  Quantity: ").Append(Quantity).Append("\n");
      sb.Append("  StateChange: ").Append(StateChange).Append("\n");
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
