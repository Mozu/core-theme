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
  public class UserContextInformation {
    /// <summary>
    /// Gets or Sets AccessSecurityManager
    /// </summary>
    [DataMember(Name="accessSecurityManager", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "accessSecurityManager")]
    public AccessSecurityManager AccessSecurityManager { get; set; }

    /// <summary>
    /// Gets or Sets EnvironmentID
    /// </summary>
    [DataMember(Name="environmentID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "environmentID")]
    public int? EnvironmentID { get; set; }

    /// <summary>
    /// Gets or Sets Loaded
    /// </summary>
    [DataMember(Name="loaded", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "loaded")]
    public bool? Loaded { get; set; }

    /// <summary>
    /// Gets or Sets PathString
    /// </summary>
    [DataMember(Name="pathString", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "pathString")]
    public string PathString { get; set; }

    /// <summary>
    /// Gets or Sets SiteID
    /// </summary>
    [DataMember(Name="siteID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "siteID")]
    public int? SiteID { get; set; }

    /// <summary>
    /// Gets or Sets SiteService
    /// </summary>
    [DataMember(Name="siteService", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "siteService")]
    public SiteService SiteService { get; set; }

    /// <summary>
    /// Gets or Sets TenantID
    /// </summary>
    [DataMember(Name="tenantID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "tenantID")]
    public int? TenantID { get; set; }

    /// <summary>
    /// Gets or Sets TenantService
    /// </summary>
    [DataMember(Name="tenantService", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "tenantService")]
    public TenantService TenantService { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class UserContextInformation {\n");
      sb.Append("  AccessSecurityManager: ").Append(AccessSecurityManager).Append("\n");
      sb.Append("  EnvironmentID: ").Append(EnvironmentID).Append("\n");
      sb.Append("  Loaded: ").Append(Loaded).Append("\n");
      sb.Append("  PathString: ").Append(PathString).Append("\n");
      sb.Append("  SiteID: ").Append(SiteID).Append("\n");
      sb.Append("  SiteService: ").Append(SiteService).Append("\n");
      sb.Append("  TenantID: ").Append(TenantID).Append("\n");
      sb.Append("  TenantService: ").Append(TenantService).Append("\n");
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
