using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// Export Settings S3
    /// </summary>
    [DataContract]
  public class ExportSettingsS3 {
    /// <summary>
    /// Export Settings ID
    /// </summary>
    /// <value>Export Settings ID</value>
    [DataMember(Name="exportSettingsID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "exportSettingsID")]
    public int? ExportSettingsID { get; set; }

    /// <summary>
    /// Export Settings S3 Name
    /// </summary>
    /// <value>Export Settings S3 Name</value>
    [DataMember(Name="name", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "name")]
    public string Name { get; set; }

    /// <summary>
    /// Flag for Active State
    /// </summary>
    /// <value>Flag for Active State</value>
    [DataMember(Name="active", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "active")]
    public bool? Active { get; set; }

    /// <summary>
    /// S3 Region
    /// </summary>
    /// <value>S3 Region</value>
    [DataMember(Name="region", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "region")]
    public string Region { get; set; }

    /// <summary>
    /// S3 Version
    /// </summary>
    /// <value>S3 Version</value>
    [DataMember(Name="version", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "version")]
    public string Version { get; set; }

    /// <summary>
    /// S3 Key
    /// </summary>
    /// <value>S3 Key</value>
    [DataMember(Name="s3Key", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "s3Key")]
    public string S3Key { get; set; }

    /// <summary>
    /// S3 Secret
    /// </summary>
    /// <value>S3 Secret</value>
    [DataMember(Name="secret", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "secret")]
    public string Secret { get; set; }

    /// <summary>
    /// S3 Bucket (directory)
    /// </summary>
    /// <value>S3 Bucket (directory)</value>
    [DataMember(Name="bucket", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "bucket")]
    public string Bucket { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class ExportSettingsS3 {\n");
      sb.Append("  ExportSettingsID: ").Append(ExportSettingsID).Append("\n");
      sb.Append("  Name: ").Append(Name).Append("\n");
      sb.Append("  Active: ").Append(Active).Append("\n");
      sb.Append("  Region: ").Append(Region).Append("\n");
      sb.Append("  Version: ").Append(Version).Append("\n");
      sb.Append("  S3Key: ").Append(S3Key).Append("\n");
      sb.Append("  Secret: ").Append(Secret).Append("\n");
      sb.Append("  Bucket: ").Append(Bucket).Append("\n");
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
