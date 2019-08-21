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
  public class AggregateRequest : BaseRequest {
    /// <summary>
    /// List of Items to search on
    /// </summary>
    /// <value>List of Items to search on</value>
    [DataMember(Name="items", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "items")]
    public List<Item> Items { get; set; }

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
    /// Filter results by locations that apply tax (true) or don't (false)
    /// </summary>
    /// <value>Filter results by locations that apply tax (true) or don't (false)</value>
    [DataMember(Name="transferEnabled", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "transferEnabled")]
    public bool? TransferEnabled { get; set; }

    /// <summary>
    /// Filter results by pickup enabled (true) or not (false)
    /// </summary>
    /// <value>Filter results by pickup enabled (true) or not (false)</value>
    [DataMember(Name="pickup", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "pickup")]
    public bool? Pickup { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class AggregateRequest {\n");
      sb.Append("  Items: ").Append(Items).Append("\n");
      sb.Append("  IgnoreSafetyStock: ").Append(IgnoreSafetyStock).Append("\n");
      sb.Append("  IncludeNegativeInventory: ").Append(IncludeNegativeInventory).Append("\n");
      sb.Append("  DirectShip: ").Append(DirectShip).Append("\n");
      sb.Append("  TransferEnabled: ").Append(TransferEnabled).Append("\n");
      sb.Append("  Pickup: ").Append(Pickup).Append("\n");
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
