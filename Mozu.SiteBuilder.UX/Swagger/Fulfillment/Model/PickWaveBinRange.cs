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
  public class PickWaveBinRange {
    /// <summary>
    /// Gets or Sets Attributes
    /// </summary>
    [DataMember(Name="attributes", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "attributes")]
    public Dictionary<string, Object> Attributes { get; set; }

    /// <summary>
    /// Gets or Sets EndBinName
    /// </summary>
    [DataMember(Name="endBinName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "endBinName")]
    public string EndBinName { get; set; }

    /// <summary>
    /// Gets or Sets StartBinName
    /// </summary>
    [DataMember(Name="startBinName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "startBinName")]
    public string StartBinName { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class PickWaveBinRange {\n");
      sb.Append("  Attributes: ").Append(Attributes).Append("\n");
      sb.Append("  EndBinName: ").Append(EndBinName).Append("\n");
      sb.Append("  StartBinName: ").Append(StartBinName).Append("\n");
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
