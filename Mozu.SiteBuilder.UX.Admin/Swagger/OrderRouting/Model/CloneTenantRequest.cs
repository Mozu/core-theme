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
  public class CloneTenantRequest {
    /// <summary>
    /// Gets or Sets SourceTenantID
    /// </summary>
    [DataMember(Name="sourceTenantID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "sourceTenantID")]
    public int? SourceTenantID { get; set; }

    /// <summary>
    /// Gets or Sets TargetTenantID
    /// </summary>
    [DataMember(Name="targetTenantID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "targetTenantID")]
    public int? TargetTenantID { get; set; }

    /// <summary>
    /// Gets or Sets TargetTenantName
    /// </summary>
    [DataMember(Name="targetTenantName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "targetTenantName")]
    public string TargetTenantName { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class CloneTenantRequest {\n");
      sb.Append("  SourceTenantID: ").Append(SourceTenantID).Append("\n");
      sb.Append("  TargetTenantID: ").Append(TargetTenantID).Append("\n");
      sb.Append("  TargetTenantName: ").Append(TargetTenantName).Append("\n");
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
