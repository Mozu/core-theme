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
  public class BackorderShipmentRequest {
    /// <summary>
    /// Gets or Sets BackorderReleaseDate
    /// </summary>
    [DataMember(Name="backorderReleaseDate", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "backorderReleaseDate")]
    public DateTime? BackorderReleaseDate { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class BackorderShipmentRequest {\n");
      sb.Append("  BackorderReleaseDate: ").Append(BackorderReleaseDate).Append("\n");
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
