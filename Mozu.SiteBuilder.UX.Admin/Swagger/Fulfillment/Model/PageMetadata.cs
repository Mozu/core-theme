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
  public class PageMetadata {
    /// <summary>
    /// Gets or Sets Number
    /// </summary>
    [DataMember(Name="number", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "number")]
    public long? Number { get; set; }

    /// <summary>
    /// Gets or Sets Size
    /// </summary>
    [DataMember(Name="size", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "size")]
    public long? Size { get; set; }

    /// <summary>
    /// Gets or Sets TotalElements
    /// </summary>
    [DataMember(Name="totalElements", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "totalElements")]
    public long? TotalElements { get; set; }

    /// <summary>
    /// Gets or Sets TotalPages
    /// </summary>
    [DataMember(Name="totalPages", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "totalPages")]
    public long? TotalPages { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class PageMetadata {\n");
      sb.Append("  Number: ").Append(Number).Append("\n");
      sb.Append("  Size: ").Append(Size).Append("\n");
      sb.Append("  TotalElements: ").Append(TotalElements).Append("\n");
      sb.Append("  TotalPages: ").Append(TotalPages).Append("\n");
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
