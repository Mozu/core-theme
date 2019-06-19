using System;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace IO.Swagger.Model {

  /// <summary>
  /// 
  /// </summary>
  [DataContract]
  public class CustomDataList {
    /// <summary>
    /// Gets or Sets Created
    /// </summary>
    [DataMember(Name="created", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "created")]
    public DateTime? Created { get; set; }

    /// <summary>
    /// Gets or Sets CreatorUsername
    /// </summary>
    [DataMember(Name="creatorUsername", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "creatorUsername")]
    public string CreatorUsername { get; set; }

    /// <summary>
    /// Gets or Sets CustomDataListID
    /// </summary>
    [DataMember(Name="customDataListID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "customDataListID")]
    public int? CustomDataListID { get; set; }

    /// <summary>
    /// Gets or Sets DataType
    /// </summary>
    [DataMember(Name="dataType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "dataType")]
    public string DataType { get; set; }

    /// <summary>
    /// Gets or Sets Entries
    /// </summary>
    [DataMember(Name="entries", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "entries")]
    public List<CustomDataListEntry> Entries { get; set; }

    /// <summary>
    /// Gets or Sets EnvironmentID
    /// </summary>
    [DataMember(Name="environmentID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "environmentID")]
    public int? EnvironmentID { get; set; }

    /// <summary>
    /// Gets or Sets FileName
    /// </summary>
    [DataMember(Name="fileName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "fileName")]
    public string FileName { get; set; }

    /// <summary>
    /// Gets or Sets Name
    /// </summary>
    [DataMember(Name="name", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "name")]
    public string Name { get; set; }

    /// <summary>
    /// Gets or Sets Notes
    /// </summary>
    [DataMember(Name="notes", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "notes")]
    public string Notes { get; set; }

    /// <summary>
    /// Gets or Sets PathString
    /// </summary>
    [DataMember(Name="pathString", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "pathString")]
    public string PathString { get; set; }

    /// <summary>
    /// Gets or Sets Persisted
    /// </summary>
    [DataMember(Name="persisted", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "persisted")]
    public bool? Persisted { get; set; }

    /// <summary>
    /// Gets or Sets SiteID
    /// </summary>
    [DataMember(Name="siteID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "siteID")]
    public int? SiteID { get; set; }

    /// <summary>
    /// Gets or Sets State
    /// </summary>
    [DataMember(Name="state", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "state")]
    public string State { get; set; }

    /// <summary>
    /// Gets or Sets StringValues
    /// </summary>
    [DataMember(Name="stringValues", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "stringValues")]
    public List<string> StringValues { get; set; }

    /// <summary>
    /// Gets or Sets TenantID
    /// </summary>
    [DataMember(Name="tenantID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "tenantID")]
    public int? TenantID { get; set; }

    /// <summary>
    /// Gets or Sets Updated
    /// </summary>
    [DataMember(Name="updated", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "updated")]
    public DateTime? Updated { get; set; }

    /// <summary>
    /// Gets or Sets UpdaterUsername
    /// </summary>
    [DataMember(Name="updaterUsername", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "updaterUsername")]
    public string UpdaterUsername { get; set; }

    /// <summary>
    /// Gets or Sets UserContext
    /// </summary>
    [DataMember(Name="userContext", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "userContext")]
    public UserContextInformation UserContext { get; set; }

    /// <summary>
    /// Gets or Sets Values
    /// </summary>
    [DataMember(Name="values", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "values")]
    public List<Object> Values { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class CustomDataList {\n");
      sb.Append("  Created: ").Append(Created).Append("\n");
      sb.Append("  CreatorUsername: ").Append(CreatorUsername).Append("\n");
      sb.Append("  CustomDataListID: ").Append(CustomDataListID).Append("\n");
      sb.Append("  DataType: ").Append(DataType).Append("\n");
      sb.Append("  Entries: ").Append(Entries).Append("\n");
      sb.Append("  EnvironmentID: ").Append(EnvironmentID).Append("\n");
      sb.Append("  FileName: ").Append(FileName).Append("\n");
      sb.Append("  Name: ").Append(Name).Append("\n");
      sb.Append("  Notes: ").Append(Notes).Append("\n");
      sb.Append("  PathString: ").Append(PathString).Append("\n");
      sb.Append("  Persisted: ").Append(Persisted).Append("\n");
      sb.Append("  SiteID: ").Append(SiteID).Append("\n");
      sb.Append("  State: ").Append(State).Append("\n");
      sb.Append("  StringValues: ").Append(StringValues).Append("\n");
      sb.Append("  TenantID: ").Append(TenantID).Append("\n");
      sb.Append("  Updated: ").Append(Updated).Append("\n");
      sb.Append("  UpdaterUsername: ").Append(UpdaterUsername).Append("\n");
      sb.Append("  UserContext: ").Append(UserContext).Append("\n");
      sb.Append("  Values: ").Append(Values).Append("\n");
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
