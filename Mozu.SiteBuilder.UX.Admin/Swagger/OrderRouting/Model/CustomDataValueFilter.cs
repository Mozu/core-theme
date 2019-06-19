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
  public class CustomDataValueFilter {
    /// <summary>
    /// Gets or Sets BooleanOperator
    /// </summary>
    [DataMember(Name="booleanOperator", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "booleanOperator")]
    public string BooleanOperator { get; set; }

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
    /// Gets or Sets CustomAttributeName
    /// </summary>
    [DataMember(Name="customAttributeName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "customAttributeName")]
    public string CustomAttributeName { get; set; }

    /// <summary>
    /// Gets or Sets CustomDataValue
    /// </summary>
    [DataMember(Name="customDataValue", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "customDataValue")]
    public CustomDataValueobject CustomDataValue { get; set; }

    /// <summary>
    /// Gets or Sets DotDelimitedPropertyName
    /// </summary>
    [DataMember(Name="dotDelimitedPropertyName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "dotDelimitedPropertyName")]
    public string DotDelimitedPropertyName { get; set; }

    /// <summary>
    /// Gets or Sets EnvironmentID
    /// </summary>
    [DataMember(Name="environmentID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "environmentID")]
    public int? EnvironmentID { get; set; }

    /// <summary>
    /// Gets or Sets FilterID
    /// </summary>
    [DataMember(Name="filterID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "filterID")]
    public int? FilterID { get; set; }

    /// <summary>
    /// Gets or Sets FilterUnit
    /// </summary>
    [DataMember(Name="filterUnit", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "filterUnit")]
    public Unitobject FilterUnit { get; set; }

    /// <summary>
    /// Gets or Sets Name
    /// </summary>
    [DataMember(Name="name", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "name")]
    public string Name { get; set; }

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
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class CustomDataValueFilter {\n");
      sb.Append("  BooleanOperator: ").Append(BooleanOperator).Append("\n");
      sb.Append("  Created: ").Append(Created).Append("\n");
      sb.Append("  CreatorUsername: ").Append(CreatorUsername).Append("\n");
      sb.Append("  CustomAttributeName: ").Append(CustomAttributeName).Append("\n");
      sb.Append("  CustomDataValue: ").Append(CustomDataValue).Append("\n");
      sb.Append("  DotDelimitedPropertyName: ").Append(DotDelimitedPropertyName).Append("\n");
      sb.Append("  EnvironmentID: ").Append(EnvironmentID).Append("\n");
      sb.Append("  FilterID: ").Append(FilterID).Append("\n");
      sb.Append("  FilterUnit: ").Append(FilterUnit).Append("\n");
      sb.Append("  Name: ").Append(Name).Append("\n");
      sb.Append("  PathString: ").Append(PathString).Append("\n");
      sb.Append("  Persisted: ").Append(Persisted).Append("\n");
      sb.Append("  SiteID: ").Append(SiteID).Append("\n");
      sb.Append("  TenantID: ").Append(TenantID).Append("\n");
      sb.Append("  Updated: ").Append(Updated).Append("\n");
      sb.Append("  UpdaterUsername: ").Append(UpdaterUsername).Append("\n");
      sb.Append("  UserContext: ").Append(UserContext).Append("\n");
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
