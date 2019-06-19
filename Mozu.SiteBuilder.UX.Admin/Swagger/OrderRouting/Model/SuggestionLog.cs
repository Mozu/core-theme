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
  public class SuggestionLog {
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
    /// Gets or Sets EnvironmentID
    /// </summary>
    [DataMember(Name="environmentID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "environmentID")]
    public int? EnvironmentID { get; set; }

    /// <summary>
    /// Gets or Sets Events
    /// </summary>
    [DataMember(Name="events", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "events")]
    public List<SuggestionEvent> Events { get; set; }

    /// <summary>
    /// Gets or Sets ExternalResponseID
    /// </summary>
    [DataMember(Name="externalResponseID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "externalResponseID")]
    public string ExternalResponseID { get; set; }

    /// <summary>
    /// Gets or Sets OrderID
    /// </summary>
    [DataMember(Name="orderID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "orderID")]
    public int? OrderID { get; set; }

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
    /// Gets or Sets SuggestionID
    /// </summary>
    [DataMember(Name="suggestionID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "suggestionID")]
    public int? SuggestionID { get; set; }

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
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class SuggestionLog {\n");
      sb.Append("  Created: ").Append(Created).Append("\n");
      sb.Append("  CreatorUsername: ").Append(CreatorUsername).Append("\n");
      sb.Append("  EnvironmentID: ").Append(EnvironmentID).Append("\n");
      sb.Append("  Events: ").Append(Events).Append("\n");
      sb.Append("  ExternalResponseID: ").Append(ExternalResponseID).Append("\n");
      sb.Append("  OrderID: ").Append(OrderID).Append("\n");
      sb.Append("  PathString: ").Append(PathString).Append("\n");
      sb.Append("  Persisted: ").Append(Persisted).Append("\n");
      sb.Append("  SiteID: ").Append(SiteID).Append("\n");
      sb.Append("  SuggestionID: ").Append(SuggestionID).Append("\n");
      sb.Append("  TenantID: ").Append(TenantID).Append("\n");
      sb.Append("  Updated: ").Append(Updated).Append("\n");
      sb.Append("  UpdaterUsername: ").Append(UpdaterUsername).Append("\n");
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
