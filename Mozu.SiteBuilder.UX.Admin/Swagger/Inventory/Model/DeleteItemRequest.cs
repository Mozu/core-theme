using System.Text;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// Request needed for deleting inventory
    /// </summary>
    [DataContract]
  public class DeleteItemRequest {
    /// <summary>
    /// Flag used to differentiate between a test and a non-test run.
    /// </summary>
    /// <value>Flag used to differentiate between a test and a non-test run.</value>
    [DataMember(Name="dryRun", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "dryRun")]
    public bool? DryRun { get; set; }

    /// <summary>
    /// Flag used to request explicit inventory, location, pick wave, and audit information for each request item.
    /// </summary>
    /// <value>Flag used to request explicit inventory, location, pick wave, and audit information for each request item.</value>
    [DataMember(Name="explicit", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "explicit")]
    public bool? Explicit { get; set; }

    /// <summary>
    /// An array of locationCodes to be considered for item-deletion purposes. Optional.     All locationCodes associated with the requesting tenant will be considered if no locationCodes are provided.
    /// </summary>
    /// <value>An array of locationCodes to be considered for item-deletion purposes. Optional.     All locationCodes associated with the requesting tenant will be considered if no locationCodes are provided.</value>
    [DataMember(Name="locationCodes", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationCodes")]
    public List<string> LocationCodes { get; set; }

    /// <summary>
    /// The part number of the item to be deleted. Supports basic regex operators: .*+?^$[]
    /// </summary>
    /// <value>The part number of the item to be deleted. Supports basic regex operators: .*+?^$[]</value>
    [DataMember(Name="partNumber", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "partNumber")]
    public string PartNumber { get; set; }

    /// <summary>
    /// The upc of the item to be deleted. Supports basic regex operators: .*+?^$[]
    /// </summary>
    /// <value>The upc of the item to be deleted. Supports basic regex operators: .*+?^$[]</value>
    [DataMember(Name="upc", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "upc")]
    public string Upc { get; set; }

    /// <summary>
    /// The sku of the item to be deleted. Supports basic regex operators: .*+?^$[]
    /// </summary>
    /// <value>The sku of the item to be deleted. Supports basic regex operators: .*+?^$[]</value>
    [DataMember(Name="sku", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "sku")]
    public string Sku { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class DeleteItemRequest {\n");
      sb.Append("  DryRun: ").Append(DryRun).Append("\n");
      sb.Append("  Explicit: ").Append(Explicit).Append("\n");
      sb.Append("  LocationCodes: ").Append(LocationCodes).Append("\n");
      sb.Append("  PartNumber: ").Append(PartNumber).Append("\n");
      sb.Append("  Upc: ").Append(Upc).Append("\n");
      sb.Append("  Sku: ").Append(Sku).Append("\n");
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
