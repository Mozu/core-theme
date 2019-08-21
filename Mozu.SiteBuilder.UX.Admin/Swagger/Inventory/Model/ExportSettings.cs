using System.Text;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// Export Settings
    /// </summary>
    [DataContract]
  public class ExportSettings {
    /// <summary>
    /// Export Settings Name
    /// </summary>
    /// <value>Export Settings Name</value>
    [DataMember(Name="name", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "name")]
    public string Name { get; set; }

    /// <summary>
    /// Format for the export file
    /// </summary>
    /// <value>Format for the export file</value>
    [DataMember(Name="fileFormat", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "fileFormat")]
    public string FileFormat { get; set; }

    /// <summary>
    /// Type of exportGG for the settings
    /// </summary>
    /// <value>Type of exportGG for the settings</value>
    [DataMember(Name="exportType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "exportType")]
    public string ExportType { get; set; }

    /// <summary>
    /// Flag for only sending available
    /// </summary>
    /// <value>Flag for only sending available</value>
    [DataMember(Name="onlySendAvailable", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "onlySendAvailable")]
    public bool? OnlySendAvailable { get; set; }

    /// <summary>
    /// Flag for only sending from active locations
    /// </summary>
    /// <value>Flag for only sending from active locations</value>
    [DataMember(Name="onlySendActiveLocations", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "onlySendActiveLocations")]
    public bool? OnlySendActiveLocations { get; set; }

    /// <summary>
    /// List of export FTP settings
    /// </summary>
    /// <value>List of export FTP settings</value>
    [DataMember(Name="ftpInformation", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "ftpInformation")]
    public List<ExportSettingsFTP> FtpInformation { get; set; }

    /// <summary>
    /// List of export S3 settings
    /// </summary>
    /// <value>List of export S3 settings</value>
    [DataMember(Name="s3Information", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "s3Information")]
    public List<ExportSettingsS3> S3Information { get; set; }

    /// <summary>
    /// Flag for exporting as a single file
    /// </summary>
    /// <value>Flag for exporting as a single file</value>
    [DataMember(Name="exportSingleFile", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "exportSingleFile")]
    public bool? ExportSingleFile { get; set; }

    /// <summary>
    /// Safety Stock
    /// </summary>
    /// <value>Safety Stock</value>
    [DataMember(Name="safetyStock", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "safetyStock")]
    public string SafetyStock { get; set; }

    /// <summary>
    /// Floor
    /// </summary>
    /// <value>Floor</value>
    [DataMember(Name="floor", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "floor")]
    public string Floor { get; set; }

    /// <summary>
    /// LTD
    /// </summary>
    /// <value>LTD</value>
    [DataMember(Name="ltd", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "ltd")]
    public string Ltd { get; set; }

    /// <summary>
    /// Name for the export file
    /// </summary>
    /// <value>Name for the export file</value>
    [DataMember(Name="fileName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "fileName")]
    public string FileName { get; set; }

    /// <summary>
    /// Flag for including attributes
    /// </summary>
    /// <value>Flag for including attributes</value>
    [DataMember(Name="includeAttributes", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "includeAttributes")]
    public bool? IncludeAttributes { get; set; }

    /// <summary>
    /// Flag for zipping the files
    /// </summary>
    /// <value>Flag for zipping the files</value>
    [DataMember(Name="zipFiles", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "zipFiles")]
    public bool? ZipFiles { get; set; }

    /// <summary>
    /// Name for the zipped file
    /// </summary>
    /// <value>Name for the zipped file</value>
    [DataMember(Name="zipFileName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "zipFileName")]
    public string ZipFileName { get; set; }

    /// <summary>
    /// Untransformed File Name
    /// </summary>
    /// <value>Untransformed File Name</value>
    [DataMember(Name="untransformedFileName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "untransformedFileName")]
    public string UntransformedFileName { get; set; }

    /// <summary>
    /// Untransformed Zip File Name
    /// </summary>
    /// <value>Untransformed Zip File Name</value>
    [DataMember(Name="untransformedZipFileName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "untransformedZipFileName")]
    public string UntransformedZipFileName { get; set; }

    /// <summary>
    /// Location Group Ids associated with the settings
    /// </summary>
    /// <value>Location Group Ids associated with the settings</value>
    [DataMember(Name="locationGroupIDs", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationGroupIDs")]
    public List<int?> LocationGroupIDs { get; set; }

    /// <summary>
    /// Site Ids associated with the settings
    /// </summary>
    /// <value>Site Ids associated with the settings</value>
    [DataMember(Name="siteIDs", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "siteIDs")]
    public List<int?> SiteIDs { get; set; }

    /// <summary>
    /// Flag for only using locations with Direct Ship enabled
    /// </summary>
    /// <value>Flag for only using locations with Direct Ship enabled</value>
    [DataMember(Name="directShip", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "directShip")]
    public bool? DirectShip { get; set; }

    /// <summary>
    /// Flag for only using locations with In Store Pickup enabled
    /// </summary>
    /// <value>Flag for only using locations with In Store Pickup enabled</value>
    [DataMember(Name="pickup", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "pickup")]
    public bool? Pickup { get; set; }

    /// <summary>
    /// Flag for only using locations with Transfer enabled
    /// </summary>
    /// <value>Flag for only using locations with Transfer enabled</value>
    [DataMember(Name="transfer", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "transfer")]
    public bool? Transfer { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class ExportSettings {\n");
      sb.Append("  Name: ").Append(Name).Append("\n");
      sb.Append("  FileFormat: ").Append(FileFormat).Append("\n");
      sb.Append("  ExportType: ").Append(ExportType).Append("\n");
      sb.Append("  OnlySendAvailable: ").Append(OnlySendAvailable).Append("\n");
      sb.Append("  OnlySendActiveLocations: ").Append(OnlySendActiveLocations).Append("\n");
      sb.Append("  FtpInformation: ").Append(FtpInformation).Append("\n");
      sb.Append("  S3Information: ").Append(S3Information).Append("\n");
      sb.Append("  ExportSingleFile: ").Append(ExportSingleFile).Append("\n");
      sb.Append("  SafetyStock: ").Append(SafetyStock).Append("\n");
      sb.Append("  Floor: ").Append(Floor).Append("\n");
      sb.Append("  Ltd: ").Append(Ltd).Append("\n");
      sb.Append("  FileName: ").Append(FileName).Append("\n");
      sb.Append("  IncludeAttributes: ").Append(IncludeAttributes).Append("\n");
      sb.Append("  ZipFiles: ").Append(ZipFiles).Append("\n");
      sb.Append("  ZipFileName: ").Append(ZipFileName).Append("\n");
      sb.Append("  UntransformedFileName: ").Append(UntransformedFileName).Append("\n");
      sb.Append("  UntransformedZipFileName: ").Append(UntransformedZipFileName).Append("\n");
      sb.Append("  LocationGroupIDs: ").Append(LocationGroupIDs).Append("\n");
      sb.Append("  SiteIDs: ").Append(SiteIDs).Append("\n");
      sb.Append("  DirectShip: ").Append(DirectShip).Append("\n");
      sb.Append("  Pickup: ").Append(Pickup).Append("\n");
      sb.Append("  Transfer: ").Append(Transfer).Append("\n");
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
