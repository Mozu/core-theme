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
  public class ClosePickWave {
    /// <summary>
    /// Gets or Sets Attributes
    /// </summary>
    [DataMember(Name="attributes", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "attributes")]
    public Dictionary<string, Object> Attributes { get; set; }

    /// <summary>
    /// Gets or Sets CreateRecovery
    /// </summary>
    [DataMember(Name="createRecovery", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "createRecovery")]
    public bool? CreateRecovery { get; set; }

    /// <summary>
    /// Gets or Sets Quantities
    /// </summary>
    [DataMember(Name="quantities", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "quantities")]
    public List<BinShipmentProductQuantity> Quantities { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class ClosePickWave {\n");
      sb.Append("  Attributes: ").Append(Attributes).Append("\n");
      sb.Append("  CreateRecovery: ").Append(CreateRecovery).Append("\n");
      sb.Append("  Quantities: ").Append(Quantities).Append("\n");
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
