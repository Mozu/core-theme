using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// 
    /// </summary>
    [DataContract]
  public class UpdateExportSettingsFTPRequest : BaseRequest {
    /// <summary>
    /// Export Settings Name to associate the ftp settings with
    /// </summary>
    /// <value>Export Settings Name to associate the ftp settings with</value>
    [DataMember(Name="exportSettingsName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "exportSettingsName")]
    public string ExportSettingsName { get; set; }

    /// <summary>
    /// Gets or Sets ExportSettingsFTP
    /// </summary>
    [DataMember(Name="exportSettingsFTP", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "exportSettingsFTP")]
    public ExportSettingsFTP ExportSettingsFTP { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class UpdateExportSettingsFTPRequest {\n");
      sb.Append("  ExportSettingsName: ").Append(ExportSettingsName).Append("\n");
      sb.Append("  ExportSettingsFTP: ").Append(ExportSettingsFTP).Append("\n");
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
