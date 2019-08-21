using System.Text;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// 
    /// </summary>
    [DataContract]
  public class InventoryRequest : BaseRequest {
    /// <summary>
    /// Inventory Request Type Enum
    /// </summary>
    /// <value>Inventory Request Type Enum</value>
    [DataMember(Name="type", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "type")]
    public string Type { get; set; }

    /// <summary>
    /// List of Items to search on
    /// </summary>
    /// <value>List of Items to search on</value>
    [DataMember(Name="items", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "items")]
    public List<ItemQuantity> Items { get; set; }

    /// <summary>
    /// Gets or Sets RequestLocation
    /// </summary>
    [DataMember(Name="requestLocation", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "requestLocation")]
    public RequestLocation RequestLocation { get; set; }

    /// <summary>
    /// The maximum number of results to return, defaults to 100 for most
    /// </summary>
    /// <value>The maximum number of results to return, defaults to 100 for most</value>
    [DataMember(Name="limit", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "limit")]
    public int? Limit { get; set; }

    /// <summary>
    /// List of location codes that are allowed to be included in results
    /// </summary>
    /// <value>List of location codes that are allowed to be included in results</value>
    [DataMember(Name="locationWhitelist", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationWhitelist")]
    public List<string> LocationWhitelist { get; set; }

    /// <summary>
    /// List of location codes that should be returned before all others, preventing them from being excluded by limit
    /// </summary>
    /// <value>List of location codes that should be returned before all others, preventing them from being excluded by limit</value>
    [DataMember(Name="locationPriorityList", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationPriorityList")]
    public List<string> LocationPriorityList { get; set; }

    /// <summary>
    /// List of location codes that are NOT allowed to be included in results
    /// </summary>
    /// <value>List of location codes that are NOT allowed to be included in results</value>
    [DataMember(Name="locationBlacklist", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationBlacklist")]
    public List<string> LocationBlacklist { get; set; }

    /// <summary>
    /// Whether to ignore the safety stock buffer put in place
    /// </summary>
    /// <value>Whether to ignore the safety stock buffer put in place</value>
    [DataMember(Name="ignoreSafetyStock", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "ignoreSafetyStock")]
    public bool? IgnoreSafetyStock { get; set; }

    /// <summary>
    /// Whether to allow items with negative inventory in the results
    /// </summary>
    /// <value>Whether to allow items with negative inventory in the results</value>
    [DataMember(Name="includeNegativeInventory", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "includeNegativeInventory")]
    public bool? IncludeNegativeInventory { get; set; }

    /// <summary>
    /// Whether to limit results to locations that are shipping enabled
    /// </summary>
    /// <value>Whether to limit results to locations that are shipping enabled</value>
    [DataMember(Name="directShip", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "directShip")]
    public bool? DirectShip { get; set; }

    /// <summary>
    /// Filter results by locations that have transfer enabled (true) or don't (false)
    /// </summary>
    /// <value>Filter results by locations that have transfer enabled (true) or don't (false)</value>
    [DataMember(Name="transferEnabled", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "transferEnabled")]
    public bool? TransferEnabled { get; set; }

    /// <summary>
    /// Filter results by locations that have finderbot enabled (true) or don't (false)
    /// </summary>
    /// <value>Filter results by locations that have finderbot enabled (true) or don't (false)</value>
    [DataMember(Name="pickup", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "pickup")]
    public bool? Pickup { get; set; }

    /// <summary>
    /// Filter results by locations that have aggregate export enabled (true) or don't (false)
    /// </summary>
    /// <value>Filter results by locations that have aggregate export enabled (true) or don't (false)</value>
    [DataMember(Name="includeInAggregateExport", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "includeInAggregateExport")]
    public bool? IncludeInAggregateExport { get; set; }

    /// <summary>
    /// Filter results by locations that have physical storefronts (true) or don't (false)
    /// </summary>
    /// <value>Filter results by locations that have physical storefronts (true) or don't (false)</value>
    [DataMember(Name="includeInLocationExport", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "includeInLocationExport")]
    public bool? IncludeInLocationExport { get; set; }

    /// <summary>
    /// Flag to include attributes or not
    /// </summary>
    /// <value>Flag to include attributes or not</value>
    [DataMember(Name="includeAttributes", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "includeAttributes")]
    public bool? IncludeAttributes { get; set; }

    /// <summary>
    /// What to sort the inventory results by. Only used for GetInventoryByLocation calls (locationCode must be set)
    /// </summary>
    /// <value>What to sort the inventory results by. Only used for GetInventoryByLocation calls (locationCode must be set)</value>
    [DataMember(Name="sortByEnum", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "sortByEnum")]
    public string SortByEnum { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class InventoryRequest {\n");
      sb.Append("  Type: ").Append(Type).Append("\n");
      sb.Append("  Items: ").Append(Items).Append("\n");
      sb.Append("  RequestLocation: ").Append(RequestLocation).Append("\n");
      sb.Append("  Limit: ").Append(Limit).Append("\n");
      sb.Append("  LocationWhitelist: ").Append(LocationWhitelist).Append("\n");
      sb.Append("  LocationPriorityList: ").Append(LocationPriorityList).Append("\n");
      sb.Append("  LocationBlacklist: ").Append(LocationBlacklist).Append("\n");
      sb.Append("  IgnoreSafetyStock: ").Append(IgnoreSafetyStock).Append("\n");
      sb.Append("  IncludeNegativeInventory: ").Append(IncludeNegativeInventory).Append("\n");
      sb.Append("  DirectShip: ").Append(DirectShip).Append("\n");
      sb.Append("  TransferEnabled: ").Append(TransferEnabled).Append("\n");
      sb.Append("  Pickup: ").Append(Pickup).Append("\n");
      sb.Append("  IncludeInAggregateExport: ").Append(IncludeInAggregateExport).Append("\n");
      sb.Append("  IncludeInLocationExport: ").Append(IncludeInLocationExport).Append("\n");
      sb.Append("  IncludeAttributes: ").Append(IncludeAttributes).Append("\n");
      sb.Append("  SortByEnum: ").Append(SortByEnum).Append("\n");
      sb.Append("}\n");
      return sb.ToString();
    }

    /// <summary>
    /// Get the JSON string presentation of the object
    /// </summary>
    /// <returns>JSON string presentation of the object</returns>
    public  new string ToJson() {
      return JsonConvert.SerializeObject(this, Formatting.Indented);
    }

}
}
