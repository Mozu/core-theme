using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// Response for each export job creation
    /// </summary>
    [DataContract]
  public class ExportInventoryJobResponse {
    /// <summary>
    /// Export Settings ID
    /// </summary>
    /// <value>Export Settings ID</value>
    [DataMember(Name="exportSettingsID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "exportSettingsID")]
    public int? ExportSettingsID { get; set; }

    /// <summary>
    /// ID of newly created job
    /// </summary>
    /// <value>ID of newly created job</value>
    [DataMember(Name="jobID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "jobID")]
    public int? JobID { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class ExportInventoryJobResponse {\n");
      sb.Append("  ExportSettingsID: ").Append(ExportSettingsID).Append("\n");
      sb.Append("  JobID: ").Append(JobID).Append("\n");
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
