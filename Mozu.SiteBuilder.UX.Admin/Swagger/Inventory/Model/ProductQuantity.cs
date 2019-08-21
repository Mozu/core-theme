using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// A product and its associated quantity
    /// </summary>
    [DataContract]
  public class ProductQuantity {
    /// <summary>
    /// Part Number
    /// </summary>
    /// <value>Part Number</value>
    [DataMember(Name="partNumber", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "partNumber")]
    public string PartNumber { get; set; }

    /// <summary>
    /// UPC
    /// </summary>
    /// <value>UPC</value>
    [DataMember(Name="upc", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "upc")]
    public string Upc { get; set; }

    /// <summary>
    /// SKU
    /// </summary>
    /// <value>SKU</value>
    [DataMember(Name="sku", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "sku")]
    public string Sku { get; set; }

    /// <summary>
    /// Quantity of product
    /// </summary>
    /// <value>Quantity of product</value>
    [DataMember(Name="quantity", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "quantity")]
    public int? Quantity { get; set; }

    /// <summary>
    /// ID of associated bin
    /// </summary>
    /// <value>ID of associated bin</value>
    [DataMember(Name="binID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "binID")]
    public int? BinID { get; set; }

    /// <summary>
    /// Location Identifier of the owning location
    /// </summary>
    /// <value>Location Identifier of the owning location</value>
    [DataMember(Name="locationID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationID")]
    public int? LocationID { get; set; }

    /// <summary>
    /// Bin Type ID
    /// </summary>
    /// <value>Bin Type ID</value>
    [DataMember(Name="binTypeID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "binTypeID")]
    public int? BinTypeID { get; set; }

    /// <summary>
    /// Bin Status ID
    /// </summary>
    /// <value>Bin Status ID</value>
    [DataMember(Name="binStatusID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "binStatusID")]
    public int? BinStatusID { get; set; }

    /// <summary>
    /// Name of the product
    /// </summary>
    /// <value>Name of the product</value>
    [DataMember(Name="name", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "name")]
    public string Name { get; set; }

    /// <summary>
    /// Inventory ID
    /// </summary>
    /// <value>Inventory ID</value>
    [DataMember(Name="inventoryID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "inventoryID")]
    public int? InventoryID { get; set; }

    /// <summary>
    /// Tenant Location Product ID
    /// </summary>
    /// <value>Tenant Location Product ID</value>
    [DataMember(Name="tenantLocProductID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "tenantLocProductID")]
    public int? TenantLocProductID { get; set; }

    /// <summary>
    /// Audit Product ID
    /// </summary>
    /// <value>Audit Product ID</value>
    [DataMember(Name="auditProductID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "auditProductID")]
    public int? AuditProductID { get; set; }

    /// <summary>
    /// Audit ID
    /// </summary>
    /// <value>Audit ID</value>
    [DataMember(Name="auditID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "auditID")]
    public int? AuditID { get; set; }

    /// <summary>
    /// Amount of product on hand
    /// </summary>
    /// <value>Amount of product on hand</value>
    [DataMember(Name="onHand", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "onHand")]
    public int? OnHand { get; set; }

    /// <summary>
    /// Amount of product available
    /// </summary>
    /// <value>Amount of product available</value>
    [DataMember(Name="available", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "available")]
    public int? Available { get; set; }

    /// <summary>
    /// Amount of product allocated
    /// </summary>
    /// <value>Amount of product allocated</value>
    [DataMember(Name="allocated", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "allocated")]
    public int? Allocated { get; set; }

    /// <summary>
    /// Amount of product pending
    /// </summary>
    /// <value>Amount of product pending</value>
    [DataMember(Name="pending", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "pending")]
    public int? Pending { get; set; }

    /// <summary>
    /// Custom field used for store prioritization
    /// </summary>
    /// <value>Custom field used for store prioritization</value>
    [DataMember(Name="ltd", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "ltd")]
    public int? Ltd { get; set; }

    /// <summary>
    /// Absolute minimum quantity of this item that should be in stock at any time
    /// </summary>
    /// <value>Absolute minimum quantity of this item that should be in stock at any time</value>
    [DataMember(Name="floor", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "floor")]
    public int? Floor { get; set; }

    /// <summary>
    /// Quantity of this item the location wants to keep in stock to ensure stock isn't completely depleted
    /// </summary>
    /// <value>Quantity of this item the location wants to keep in stock to ensure stock isn't completely depleted</value>
    [DataMember(Name="safetystock", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "safetystock")]
    public int? Safetystock { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class ProductQuantity {\n");
      sb.Append("  PartNumber: ").Append(PartNumber).Append("\n");
      sb.Append("  Upc: ").Append(Upc).Append("\n");
      sb.Append("  Sku: ").Append(Sku).Append("\n");
      sb.Append("  Quantity: ").Append(Quantity).Append("\n");
      sb.Append("  BinID: ").Append(BinID).Append("\n");
      sb.Append("  LocationID: ").Append(LocationID).Append("\n");
      sb.Append("  BinTypeID: ").Append(BinTypeID).Append("\n");
      sb.Append("  BinStatusID: ").Append(BinStatusID).Append("\n");
      sb.Append("  Name: ").Append(Name).Append("\n");
      sb.Append("  InventoryID: ").Append(InventoryID).Append("\n");
      sb.Append("  TenantLocProductID: ").Append(TenantLocProductID).Append("\n");
      sb.Append("  AuditProductID: ").Append(AuditProductID).Append("\n");
      sb.Append("  AuditID: ").Append(AuditID).Append("\n");
      sb.Append("  OnHand: ").Append(OnHand).Append("\n");
      sb.Append("  Available: ").Append(Available).Append("\n");
      sb.Append("  Allocated: ").Append(Allocated).Append("\n");
      sb.Append("  Pending: ").Append(Pending).Append("\n");
      sb.Append("  Ltd: ").Append(Ltd).Append("\n");
      sb.Append("  Floor: ").Append(Floor).Append("\n");
      sb.Append("  Safetystock: ").Append(Safetystock).Append("\n");
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
