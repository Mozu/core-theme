using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// 
    /// </summary>
    [DataContract]
  public class UpdateExportSettingsFTPResponse : BaseResponse {
    /// <summary>
    /// Tenant ID
    /// </summary>
    /// <value>Tenant ID</value>
    [DataMember(Name="tenantID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "tenantID")]
    public int? TenantID { get; set; }

    /// <summary>
    /// Export Settings FTP Name
    /// </summary>
    /// <value>Export Settings FTP Name</value>
    [DataMember(Name="exportSettingsFTPName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "exportSettingsFTPName")]
    public string ExportSettingsFTPName { get; set; }

    /// <summary>
    /// Export Settings Name to associate the ftp settings with
    /// </summary>
    /// <value>Export Settings Name to associate the ftp settings with</value>
    [DataMember(Name="exportSettingsName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "exportSettingsName")]
    public string ExportSettingsName { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class UpdateExportSettingsFTPResponse {\n");
      sb.Append("  TenantID: ").Append(TenantID).Append("\n");
      sb.Append("  ExportSettingsFTPName: ").Append(ExportSettingsFTPName).Append("\n");
      sb.Append("  ExportSettingsName: ").Append(ExportSettingsName).Append("\n");
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
