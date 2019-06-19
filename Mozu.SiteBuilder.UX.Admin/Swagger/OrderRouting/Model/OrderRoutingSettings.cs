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
  public class OrderRoutingSettings {
    /// <summary>
    /// Gets or Sets AllowInternationalAssignment
    /// </summary>
    [DataMember(Name="allowInternationalAssignment", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "allowInternationalAssignment")]
    public bool? AllowInternationalAssignment { get; set; }

    /// <summary>
    /// Gets or Sets AutoAssignLimit
    /// </summary>
    [DataMember(Name="autoAssignLimit", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "autoAssignLimit")]
    public int? AutoAssignLimit { get; set; }

    /// <summary>
    /// Gets or Sets DefaultStateChange
    /// </summary>
    [DataMember(Name="defaultStateChange", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "defaultStateChange")]
    public string DefaultStateChange { get; set; }

    /// <summary>
    /// Gets or Sets FailoverActions
    /// </summary>
    [DataMember(Name="failoverActions", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "failoverActions")]
    public List<string> FailoverActions { get; set; }

    /// <summary>
    /// Gets or Sets FilterAttributes
    /// </summary>
    [DataMember(Name="filterAttributes", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "filterAttributes")]
    public List<FilterAttribute> FilterAttributes { get; set; }

    /// <summary>
    /// Gets or Sets MaxFulfillingLocations
    /// </summary>
    [DataMember(Name="maxFulfillingLocations", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "maxFulfillingLocations")]
    public int? MaxFulfillingLocations { get; set; }

    /// <summary>
    /// Gets or Sets MaxSplitItemLocations
    /// </summary>
    [DataMember(Name="maxSplitItemLocations", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "maxSplitItemLocations")]
    public int? MaxSplitItemLocations { get; set; }

    /// <summary>
    /// Gets or Sets ProductIdentifierMapping
    /// </summary>
    [DataMember(Name="productIdentifierMapping", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "productIdentifierMapping")]
    public string ProductIdentifierMapping { get; set; }

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
    /// Gets or Sets TooManyAssignsAction
    /// </summary>
    [DataMember(Name="tooManyAssignsAction", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "tooManyAssignsAction")]
    public string TooManyAssignsAction { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class OrderRoutingSettings {\n");
      sb.Append("  AllowInternationalAssignment: ").Append(AllowInternationalAssignment).Append("\n");
      sb.Append("  AutoAssignLimit: ").Append(AutoAssignLimit).Append("\n");
      sb.Append("  DefaultStateChange: ").Append(DefaultStateChange).Append("\n");
      sb.Append("  FailoverActions: ").Append(FailoverActions).Append("\n");
      sb.Append("  FilterAttributes: ").Append(FilterAttributes).Append("\n");
      sb.Append("  MaxFulfillingLocations: ").Append(MaxFulfillingLocations).Append("\n");
      sb.Append("  MaxSplitItemLocations: ").Append(MaxSplitItemLocations).Append("\n");
      sb.Append("  ProductIdentifierMapping: ").Append(ProductIdentifierMapping).Append("\n");
      sb.Append("  SiteID: ").Append(SiteID).Append("\n");
      sb.Append("  TenantID: ").Append(TenantID).Append("\n");
      sb.Append("  TooManyAssignsAction: ").Append(TooManyAssignsAction).Append("\n");
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
