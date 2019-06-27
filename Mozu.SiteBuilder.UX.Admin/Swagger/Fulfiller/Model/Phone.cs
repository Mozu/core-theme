using System;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Swagger.Fulfiller.Model {

  /// <summary>
  /// 
  /// </summary>
  [DataContract]
  public class Phone {
    /// <summary>
    /// Gets or Sets Attributes
    /// </summary>
    [DataMember(Name="attributes", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "attributes")]
    public Dictionary<string, Object> Attributes { get; set; }

    /// <summary>
    /// Gets or Sets Home
    /// </summary>
    [DataMember(Name="home", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "home")]
    public string Home { get; set; }

    /// <summary>
    /// Gets or Sets Mobile
    /// </summary>
    [DataMember(Name="mobile", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "mobile")]
    public string Mobile { get; set; }

    /// <summary>
    /// Gets or Sets Work
    /// </summary>
    [DataMember(Name="work", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "work")]
    public string Work { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class Phone {\n");
      sb.Append("  Attributes: ").Append(Attributes).Append("\n");
      sb.Append("  Home: ").Append(Home).Append("\n");
      sb.Append("  Mobile: ").Append(Mobile).Append("\n");
      sb.Append("  Work: ").Append(Work).Append("\n");
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
