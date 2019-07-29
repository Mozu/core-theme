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
  public class WorkflowProcess {
    /// <summary>
    /// Gets or Sets Attributes
    /// </summary>
    [DataMember(Name="attributes", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "attributes")]
    public Dictionary<string, Object> Attributes { get; set; }

    /// <summary>
    /// Gets or Sets ContainerId
    /// </summary>
    [DataMember(Name="containerId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "containerId")]
    public string ContainerId { get; set; }

    /// <summary>
    /// Gets or Sets Id
    /// </summary>
    [DataMember(Name="id", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "id")]
    public string Id { get; set; }

    /// <summary>
    /// Gets or Sets Tasks
    /// </summary>
    [DataMember(Name="tasks", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "tasks")]
    public List<TaskDefinition> Tasks { get; set; }

    /// <summary>
    /// Gets or Sets Variables
    /// </summary>
    [DataMember(Name="variables", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "variables")]
    public List<WorkflowProcessVariable> Variables { get; set; }

    /// <summary>
    /// Gets or Sets Version
    /// </summary>
    [DataMember(Name="version", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "version")]
    public string Version { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class WorkflowProcess {\n");
      sb.Append("  Attributes: ").Append(Attributes).Append("\n");
      sb.Append("  ContainerId: ").Append(ContainerId).Append("\n");
      sb.Append("  Id: ").Append(Id).Append("\n");
      sb.Append("  Tasks: ").Append(Tasks).Append("\n");
      sb.Append("  Variables: ").Append(Variables).Append("\n");
      sb.Append("  Version: ").Append(Version).Append("\n");
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
