using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// Export Settings FTP
    /// </summary>
    [DataContract]
  public class ExportSettingsFTP {
    /// <summary>
    /// Flag for Active State
    /// </summary>
    /// <value>Flag for Active State</value>
    [DataMember(Name="active", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "active")]
    public bool? Active { get; set; }

    /// <summary>
    /// Export Settings ID
    /// </summary>
    /// <value>Export Settings ID</value>
    [DataMember(Name="exportSettingsID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "exportSettingsID")]
    public int? ExportSettingsID { get; set; }

    /// <summary>
    /// Export Settings FTP Name
    /// </summary>
    /// <value>Export Settings FTP Name</value>
    [DataMember(Name="name", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "name")]
    public string Name { get; set; }

    /// <summary>
    /// FTP Server Address
    /// </summary>
    /// <value>FTP Server Address</value>
    [DataMember(Name="ftpServer", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "ftpServer")]
    public string FtpServer { get; set; }

    /// <summary>
    /// FTP Server Port
    /// </summary>
    /// <value>FTP Server Port</value>
    [DataMember(Name="ftpPort", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "ftpPort")]
    public int? FtpPort { get; set; }

    /// <summary>
    /// FTP Server Directory
    /// </summary>
    /// <value>FTP Server Directory</value>
    [DataMember(Name="ftpDirectory", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "ftpDirectory")]
    public string FtpDirectory { get; set; }

    /// <summary>
    /// FTP Server Control File Directory
    /// </summary>
    /// <value>FTP Server Control File Directory</value>
    [DataMember(Name="ftpDirectoryControlFile", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "ftpDirectoryControlFile")]
    public string FtpDirectoryControlFile { get; set; }

    /// <summary>
    /// FTP Username
    /// </summary>
    /// <value>FTP Username</value>
    [DataMember(Name="ftpUser", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "ftpUser")]
    public string FtpUser { get; set; }

    /// <summary>
    /// FTP Password
    /// </summary>
    /// <value>FTP Password</value>
    [DataMember(Name="ftpPassword", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "ftpPassword")]
    public string FtpPassword { get; set; }

    /// <summary>
    /// FTP Delivery Class. Defaults to ExportDeliveryDefault
    /// </summary>
    /// <value>FTP Delivery Class. Defaults to ExportDeliveryDefault</value>
    [DataMember(Name="deliveryClass", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "deliveryClass")]
    public string DeliveryClass { get; set; }

    /// <summary>
    /// Control File
    /// </summary>
    /// <value>Control File</value>
    [DataMember(Name="controlFile", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "controlFile")]
    public string ControlFile { get; set; }

    /// <summary>
    /// Control File Email
    /// </summary>
    /// <value>Control File Email</value>
    [DataMember(Name="controlFileEmail", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "controlFileEmail")]
    public string ControlFileEmail { get; set; }

    /// <summary>
    /// Remote File Name
    /// </summary>
    /// <value>Remote File Name</value>
    [DataMember(Name="remoteFileName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "remoteFileName")]
    public string RemoteFileName { get; set; }

    /// <summary>
    /// Control File Name
    /// </summary>
    /// <value>Control File Name</value>
    [DataMember(Name="controlFileName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "controlFileName")]
    public string ControlFileName { get; set; }

    /// <summary>
    /// Endpoint
    /// </summary>
    /// <value>Endpoint</value>
    [DataMember(Name="endpoint", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "endpoint")]
    public string Endpoint { get; set; }

    /// <summary>
    /// Environment
    /// </summary>
    /// <value>Environment</value>
    [DataMember(Name="environment", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "environment")]
    public string Environment { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class ExportSettingsFTP {\n");
      sb.Append("  Active: ").Append(Active).Append("\n");
      sb.Append("  ExportSettingsID: ").Append(ExportSettingsID).Append("\n");
      sb.Append("  Name: ").Append(Name).Append("\n");
      sb.Append("  FtpServer: ").Append(FtpServer).Append("\n");
      sb.Append("  FtpPort: ").Append(FtpPort).Append("\n");
      sb.Append("  FtpDirectory: ").Append(FtpDirectory).Append("\n");
      sb.Append("  FtpDirectoryControlFile: ").Append(FtpDirectoryControlFile).Append("\n");
      sb.Append("  FtpUser: ").Append(FtpUser).Append("\n");
      sb.Append("  FtpPassword: ").Append(FtpPassword).Append("\n");
      sb.Append("  DeliveryClass: ").Append(DeliveryClass).Append("\n");
      sb.Append("  ControlFile: ").Append(ControlFile).Append("\n");
      sb.Append("  ControlFileEmail: ").Append(ControlFileEmail).Append("\n");
      sb.Append("  RemoteFileName: ").Append(RemoteFileName).Append("\n");
      sb.Append("  ControlFileName: ").Append(ControlFileName).Append("\n");
      sb.Append("  Endpoint: ").Append(Endpoint).Append("\n");
      sb.Append("  Environment: ").Append(Environment).Append("\n");
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
