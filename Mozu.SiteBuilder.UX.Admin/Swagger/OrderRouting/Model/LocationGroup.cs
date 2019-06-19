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
  public class LocationGroup {
    /// <summary>
    /// Gets or Sets Active
    /// </summary>
    [DataMember(Name="active", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "active")]
    public bool? Active { get; set; }

    /// <summary>
    /// Gets or Sets AfterActionNone
    /// </summary>
    [DataMember(Name="afterActionNone", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "afterActionNone")]
    public GroupAfterAction AfterActionNone { get; set; }

    /// <summary>
    /// Gets or Sets AfterActionPartial
    /// </summary>
    [DataMember(Name="afterActionPartial", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "afterActionPartial")]
    public GroupAfterAction AfterActionPartial { get; set; }

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
    /// Gets or Sets Description
    /// </summary>
    [DataMember(Name="description", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "description")]
    public string Description { get; set; }

    /// <summary>
    /// Gets or Sets EnvironmentID
    /// </summary>
    [DataMember(Name="environmentID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "environmentID")]
    public int? EnvironmentID { get; set; }

    /// <summary>
    /// Gets or Sets ExcludedLocationsFromDefaultGroup
    /// </summary>
    [DataMember(Name="excludedLocationsFromDefaultGroup", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "excludedLocationsFromDefaultGroup")]
    public List<int?> ExcludedLocationsFromDefaultGroup { get; set; }

    /// <summary>
    /// Gets or Sets Filters
    /// </summary>
    [DataMember(Name="filters", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "filters")]
    public List<AbstractFilter> Filters { get; set; }

    /// <summary>
    /// Gets or Sets FulfillmentLimit
    /// </summary>
    [DataMember(Name="fulfillmentLimit", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "fulfillmentLimit")]
    public FulfillmentLimit FulfillmentLimit { get; set; }

    /// <summary>
    /// Gets or Sets GroupID
    /// </summary>
    [DataMember(Name="groupID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "groupID")]
    public int? GroupID { get; set; }

    /// <summary>
    /// Gets or Sets IsDefaultGroup
    /// </summary>
    [DataMember(Name="isDefaultGroup", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "isDefaultGroup")]
    public bool? IsDefaultGroup { get; set; }

    /// <summary>
    /// Gets or Sets LocationIDs
    /// </summary>
    [DataMember(Name="locationIDs", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationIDs")]
    public List<int?> LocationIDs { get; set; }

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
    /// Gets or Sets Rank
    /// </summary>
    [DataMember(Name="rank", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "rank")]
    public int? Rank { get; set; }

    /// <summary>
    /// Gets or Sets RankedLocations
    /// </summary>
    [DataMember(Name="rankedLocations", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "rankedLocations")]
    public List<RankedLocation> RankedLocations { get; set; }

    /// <summary>
    /// Gets or Sets RequestLogic
    /// </summary>
    [DataMember(Name="requestLogic", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "requestLogic")]
    public string RequestLogic { get; set; }

    /// <summary>
    /// Gets or Sets SiteID
    /// </summary>
    [DataMember(Name="siteID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "siteID")]
    public int? SiteID { get; set; }

    /// <summary>
    /// Gets or Sets Sorts
    /// </summary>
    [DataMember(Name="sorts", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "sorts")]
    public List<LocationSort> Sorts { get; set; }

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
    /// Gets or Sets UseRetailerExclusionList
    /// </summary>
    [DataMember(Name="useRetailerExclusionList", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "useRetailerExclusionList")]
    public bool? UseRetailerExclusionList { get; set; }

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
      sb.Append("class LocationGroup {\n");
      sb.Append("  Active: ").Append(Active).Append("\n");
      sb.Append("  AfterActionNone: ").Append(AfterActionNone).Append("\n");
      sb.Append("  AfterActionPartial: ").Append(AfterActionPartial).Append("\n");
      sb.Append("  Created: ").Append(Created).Append("\n");
      sb.Append("  CreatorUsername: ").Append(CreatorUsername).Append("\n");
      sb.Append("  Description: ").Append(Description).Append("\n");
      sb.Append("  EnvironmentID: ").Append(EnvironmentID).Append("\n");
      sb.Append("  ExcludedLocationsFromDefaultGroup: ").Append(ExcludedLocationsFromDefaultGroup).Append("\n");
      sb.Append("  Filters: ").Append(Filters).Append("\n");
      sb.Append("  FulfillmentLimit: ").Append(FulfillmentLimit).Append("\n");
      sb.Append("  GroupID: ").Append(GroupID).Append("\n");
      sb.Append("  IsDefaultGroup: ").Append(IsDefaultGroup).Append("\n");
      sb.Append("  LocationIDs: ").Append(LocationIDs).Append("\n");
      sb.Append("  Name: ").Append(Name).Append("\n");
      sb.Append("  PathString: ").Append(PathString).Append("\n");
      sb.Append("  Persisted: ").Append(Persisted).Append("\n");
      sb.Append("  Rank: ").Append(Rank).Append("\n");
      sb.Append("  RankedLocations: ").Append(RankedLocations).Append("\n");
      sb.Append("  RequestLogic: ").Append(RequestLogic).Append("\n");
      sb.Append("  SiteID: ").Append(SiteID).Append("\n");
      sb.Append("  Sorts: ").Append(Sorts).Append("\n");
      sb.Append("  TenantID: ").Append(TenantID).Append("\n");
      sb.Append("  Updated: ").Append(Updated).Append("\n");
      sb.Append("  UpdaterUsername: ").Append(UpdaterUsername).Append("\n");
      sb.Append("  UseRetailerExclusionList: ").Append(UseRetailerExclusionList).Append("\n");
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
