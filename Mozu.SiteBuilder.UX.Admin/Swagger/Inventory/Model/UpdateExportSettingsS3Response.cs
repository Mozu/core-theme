using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// 
    /// </summary>
    [DataContract]
  public class UpdateExportSettingsS3Response : BaseResponse {
    /// <summary>
    /// Tenant ID
    /// </summary>
    /// <value>Tenant ID</value>
    [DataMember(Name="tenantID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "tenantID")]
    public int? TenantID { get; set; }

    /// <summary>
    /// Export Settings S3 ID
    /// </summary>
    /// <value>Export Settings S3 ID</value>
    [DataMember(Name="exportSettingsS3ID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "exportSettingsS3ID")]
    public int? ExportSettingsS3ID { get; set; }

    /// <summary>
    /// Export Settings ID to associate the s3 settings with
    /// </summary>
    /// <value>Export Settings ID to associate the s3 settings with</value>
    [DataMember(Name="exportSettingsID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "exportSettingsID")]
    public int? ExportSettingsID { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class UpdateExportSettingsS3Response {\n");
      sb.Append("  TenantID: ").Append(TenantID).Append("\n");
      sb.Append("  ExportSettingsS3ID: ").Append(ExportSettingsS3ID).Append("\n");
      sb.Append("  ExportSettingsID: ").Append(ExportSettingsID).Append("\n");
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
