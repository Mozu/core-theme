using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// 
    /// </summary>
    [DataContract]
  public class ExportInventoryRequest : BaseRequest {
    /// <summary>
    /// Name of the Export Settings to use
    /// </summary>
    /// <value>Name of the Export Settings to use</value>
    [DataMember(Name="exportSettingsName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "exportSettingsName")]
    public string ExportSettingsName { get; set; }

    /// <summary>
    /// Name of the FTP Settings to use. Will only check for this if exportID is already set
    /// </summary>
    /// <value>Name of the FTP Settings to use. Will only check for this if exportID is already set</value>
    [DataMember(Name="exportSettingsFTPName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "exportSettingsFTPName")]
    public string ExportSettingsFTPName { get; set; }

    /// <summary>
    /// Name of the S3 Settings to use. Will only check for this if exportID is already set
    /// </summary>
    /// <value>Name of the S3 Settings to use. Will only check for this if exportID is already set</value>
    [DataMember(Name="exportSettingsS3Name", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "exportSettingsS3Name")]
    public string ExportSettingsS3Name { get; set; }

    /// <summary>
    /// Flag for sending the exports to the development droppoint
    /// </summary>
    /// <value>Flag for sending the exports to the development droppoint</value>
    [DataMember(Name="development", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "development")]
    public bool? Development { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class ExportInventoryRequest {\n");
      sb.Append("  ExportSettingsName: ").Append(ExportSettingsName).Append("\n");
      sb.Append("  ExportSettingsFTPName: ").Append(ExportSettingsFTPName).Append("\n");
      sb.Append("  ExportSettingsS3Name: ").Append(ExportSettingsS3Name).Append("\n");
      sb.Append("  Development: ").Append(Development).Append("\n");
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
