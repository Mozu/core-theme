using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// 
    /// </summary>
    [DataContract]
  public class UpdateExportSettingsS3Request : BaseRequest {
    /// <summary>
    /// Export Settings Name to associate the ftp settings with
    /// </summary>
    /// <value>Export Settings Name to associate the ftp settings with</value>
    [DataMember(Name="exportSettingsName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "exportSettingsName")]
    public string ExportSettingsName { get; set; }

    /// <summary>
    /// Gets or Sets ExportSettingsS3
    /// </summary>
    [DataMember(Name="exportSettingsS3", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "exportSettingsS3")]
    public ExportSettingsS3 ExportSettingsS3 { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class UpdateExportSettingsS3Request {\n");
      sb.Append("  ExportSettingsName: ").Append(ExportSettingsName).Append("\n");
      sb.Append("  ExportSettingsS3: ").Append(ExportSettingsS3).Append("\n");
      sb.Append("}\n");
      return sb.ToString();
    }

    /// <summary>
    /// Get the JSON string presentation of the object
    /// </summary>
    /// <returns>JSON string presentation of the object</returns>
    public  new string ToJson() {
      return JsonConvert.SerializeObject(this, Formatting.Indented);
    }

}
}
