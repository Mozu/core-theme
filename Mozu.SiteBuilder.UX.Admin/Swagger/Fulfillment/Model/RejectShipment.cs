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
  public class RejectShipment {
    /// <summary>
    /// Gets or Sets Attributes
    /// </summary>
    [DataMember(Name="attributes", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "attributes")]
    public Dictionary<string, Object> Attributes { get; set; }

    /// <summary>
    /// Gets or Sets RejectReason
    /// </summary>
    [DataMember(Name="rejectReason", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "rejectReason")]
    public string RejectReason { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class RejectShipment {\n");
      sb.Append("  Attributes: ").Append(Attributes).Append("\n");
      sb.Append("  RejectReason: ").Append(RejectReason).Append("\n");
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
