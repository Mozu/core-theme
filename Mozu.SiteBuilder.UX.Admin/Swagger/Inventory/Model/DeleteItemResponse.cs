using System.Text;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// Delete Item Response
    /// </summary>
    [DataContract]
  public class DeleteItemResponse {
    /// <summary>
    /// Flag used to differentiate between a test and a non-test run.
    /// </summary>
    /// <value>Flag used to differentiate between a test and a non-test run.</value>
    [DataMember(Name="dryRun", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "dryRun")]
    public bool? DryRun { get; set; }

    /// <summary>
    /// Items deleted due to the request
    /// </summary>
    /// <value>Items deleted due to the request</value>
    [DataMember(Name="itemsDeleted", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "itemsDeleted")]
    public List<MDeleteItem> ItemsDeleted { get; set; }

    /// <summary>
    /// Flag used to differentiate between a test and a non-test run.
    /// </summary>
    /// <value>Flag used to differentiate between a test and a non-test run.</value>
    [DataMember(Name="totalAuditsDeleted", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "totalAuditsDeleted")]
    public bool? TotalAuditsDeleted { get; set; }

    /// <summary>
    /// Flag used to differentiate between a test and a non-test run.
    /// </summary>
    /// <value>Flag used to differentiate between a test and a non-test run.</value>
    [DataMember(Name="totalInventoryEntriesDeleted", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "totalInventoryEntriesDeleted")]
    public bool? TotalInventoryEntriesDeleted { get; set; }

    /// <summary>
    /// Flag used to differentiate between a test and a non-test run.
    /// </summary>
    /// <value>Flag used to differentiate between a test and a non-test run.</value>
    [DataMember(Name="totalLocationsAffected", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "totalLocationsAffected")]
    public bool? TotalLocationsAffected { get; set; }

    /// <summary>
    /// Flag used to differentiate between a test and a non-test run.
    /// </summary>
    /// <value>Flag used to differentiate between a test and a non-test run.</value>
    [DataMember(Name="totalPickWavesDeleted", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "totalPickWavesDeleted")]
    public bool? TotalPickWavesDeleted { get; set; }

    /// <summary>
    /// Flag used to differentiate between a test and a non-test run.
    /// </summary>
    /// <value>Flag used to differentiate between a test and a non-test run.</value>
    [DataMember(Name="totalProductsDeleted", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "totalProductsDeleted")]
    public bool? TotalProductsDeleted { get; set; }

    /// <summary>
    /// Flag used to differentiate between a test and a non-test run.
    /// </summary>
    /// <value>Flag used to differentiate between a test and a non-test run.</value>
    [DataMember(Name="jobIDs", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "jobIDs")]
    public bool? JobIDs { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class DeleteItemResponse {\n");
      sb.Append("  DryRun: ").Append(DryRun).Append("\n");
      sb.Append("  ItemsDeleted: ").Append(ItemsDeleted).Append("\n");
      sb.Append("  TotalAuditsDeleted: ").Append(TotalAuditsDeleted).Append("\n");
      sb.Append("  TotalInventoryEntriesDeleted: ").Append(TotalInventoryEntriesDeleted).Append("\n");
      sb.Append("  TotalLocationsAffected: ").Append(TotalLocationsAffected).Append("\n");
      sb.Append("  TotalPickWavesDeleted: ").Append(TotalPickWavesDeleted).Append("\n");
      sb.Append("  TotalProductsDeleted: ").Append(TotalProductsDeleted).Append("\n");
      sb.Append("  JobIDs: ").Append(JobIDs).Append("\n");
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
