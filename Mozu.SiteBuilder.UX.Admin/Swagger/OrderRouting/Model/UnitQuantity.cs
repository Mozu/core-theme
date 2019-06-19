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
  public class UnitQuantity {
    /// <summary>
    /// Gets or Sets Dimension
    /// </summary>
    [DataMember(Name="dimension", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "dimension")]
    public Dimension Dimension { get; set; }

    /// <summary>
    /// Gets or Sets StandardUnit
    /// </summary>
    [DataMember(Name="standardUnit", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "standardUnit")]
    public Unitobject StandardUnit { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class UnitQuantity {\n");
      sb.Append("  Dimension: ").Append(Dimension).Append("\n");
      sb.Append("  StandardUnit: ").Append(StandardUnit).Append("\n");
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
