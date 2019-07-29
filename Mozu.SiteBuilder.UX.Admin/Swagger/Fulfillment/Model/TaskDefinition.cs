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
  public class TaskDefinition {
    /// <summary>
    /// Gets or Sets Description
    /// </summary>
    [DataMember(Name="description", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "description")]
    public string Description { get; set; }

    /// <summary>
    /// Gets or Sets Inputs
    /// </summary>
    [DataMember(Name="inputs", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "inputs")]
    public List<TaskInput> Inputs { get; set; }

    /// <summary>
    /// Gets or Sets Name
    /// </summary>
    [DataMember(Name="name", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "name")]
    public string Name { get; set; }

    /// <summary>
    /// Gets or Sets Skippable
    /// </summary>
    [DataMember(Name="skippable", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "skippable")]
    public bool? Skippable { get; set; }

    /// <summary>
    /// Gets or Sets Subject
    /// </summary>
    [DataMember(Name="subject", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "subject")]
    public string Subject { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class TaskDefinition {\n");
      sb.Append("  Description: ").Append(Description).Append("\n");
      sb.Append("  Inputs: ").Append(Inputs).Append("\n");
      sb.Append("  Name: ").Append(Name).Append("\n");
      sb.Append("  Skippable: ").Append(Skippable).Append("\n");
      sb.Append("  Subject: ").Append(Subject).Append("\n");
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
