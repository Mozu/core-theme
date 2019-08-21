using System.Text;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// Delete Item Model
    /// </summary>
    [DataContract]
  public class MDeleteItem {
    /// <summary>
    /// Product Identifier
    /// </summary>
    /// <value>Product Identifier</value>
    [DataMember(Name="productID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "productID")]
    public int? ProductID { get; set; }

    /// <summary>
    /// List of inventory identifiers associated with the deleted item
    /// </summary>
    /// <value>List of inventory identifiers associated with the deleted item</value>
    [DataMember(Name="inventoryIDs", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "inventoryIDs")]
    public List<int?> InventoryIDs { get; set; }

    /// <summary>
    /// List of location identifiers associated with the deleted item
    /// </summary>
    /// <value>List of location identifiers associated with the deleted item</value>
    [DataMember(Name="locationIDs", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationIDs")]
    public List<int?> LocationIDs { get; set; }

    /// <summary>
    /// List of audit identifiers associated with the deleted item
    /// </summary>
    /// <value>List of audit identifiers associated with the deleted item</value>
    [DataMember(Name="auditIDs", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "auditIDs")]
    public List<int?> AuditIDs { get; set; }

    /// <summary>
    /// List of pick wave identifiers associated with the deleted item
    /// </summary>
    /// <value>List of pick wave identifiers associated with the deleted item</value>
    [DataMember(Name="pickWaveIDs", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "pickWaveIDs")]
    public List<int?> PickWaveIDs { get; set; }

    /// <summary>
    /// Gets or Sets ItemIdentifier
    /// </summary>
    [DataMember(Name="itemIdentifier", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "itemIdentifier")]
    public MItemIdentifier ItemIdentifier { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class MDeleteItem {\n");
      sb.Append("  ProductID: ").Append(ProductID).Append("\n");
      sb.Append("  InventoryIDs: ").Append(InventoryIDs).Append("\n");
      sb.Append("  LocationIDs: ").Append(LocationIDs).Append("\n");
      sb.Append("  AuditIDs: ").Append(AuditIDs).Append("\n");
      sb.Append("  PickWaveIDs: ").Append(PickWaveIDs).Append("\n");
      sb.Append("  ItemIdentifier: ").Append(ItemIdentifier).Append("\n");
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
