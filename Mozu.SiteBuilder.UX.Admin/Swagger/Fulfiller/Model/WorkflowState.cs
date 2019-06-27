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
  public class WorkflowState {
    /// <summary>
    /// Gets or Sets Attributes
    /// </summary>
    [DataMember(Name="attributes", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "attributes")]
    public Dictionary<string, Object> Attributes { get; set; }

    /// <summary>
    /// Gets or Sets CompletedDate
    /// </summary>
    [DataMember(Name="completedDate", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "completedDate")]
    public DateTime? CompletedDate { get; set; }

    /// <summary>
    /// Gets or Sets ProcessInstanceId
    /// </summary>
    [DataMember(Name="processInstanceId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "processInstanceId")]
    public string ProcessInstanceId { get; set; }

    /// <summary>
    /// Gets or Sets ShipmentState
    /// </summary>
    [DataMember(Name="shipmentState", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shipmentState")]
    public string ShipmentState { get; set; }

    /// <summary>
    /// Gets or Sets TaskList
    /// </summary>
    [DataMember(Name="taskList", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "taskList")]
    public List<Task> TaskList { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class WorkflowState {\n");
      sb.Append("  Attributes: ").Append(Attributes).Append("\n");
      sb.Append("  CompletedDate: ").Append(CompletedDate).Append("\n");
      sb.Append("  ProcessInstanceId: ").Append(ProcessInstanceId).Append("\n");
      sb.Append("  ShipmentState: ").Append(ShipmentState).Append("\n");
      sb.Append("  TaskList: ").Append(TaskList).Append("\n");
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
