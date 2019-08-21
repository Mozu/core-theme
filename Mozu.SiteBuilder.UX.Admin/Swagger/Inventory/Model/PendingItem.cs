using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// 
    /// </summary>
    [DataContract]
  public class PendingItem : BaseResponse {
    /// <summary>
    /// Pending Item Identifier
    /// </summary>
    /// <value>Pending Item Identifier</value>
    [DataMember(Name="pendingItemID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "pendingItemID")]
    public int? PendingItemID { get; set; }

    /// <summary>
    /// Order Identifier
    /// </summary>
    /// <value>Order Identifier</value>
    [DataMember(Name="orderID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "orderID")]
    public int? OrderID { get; set; }

    /// <summary>
    /// Shipment Identifier
    /// </summary>
    /// <value>Shipment Identifier</value>
    [DataMember(Name="shipmentID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shipmentID")]
    public int? ShipmentID { get; set; }

    /// <summary>
    /// Pending Item type
    /// </summary>
    /// <value>Pending Item type</value>
    [DataMember(Name="type", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "type")]
    public string Type { get; set; }

    /// <summary>
    /// The number of items affected for this log entry
    /// </summary>
    /// <value>The number of items affected for this log entry</value>
    [DataMember(Name="quantity", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "quantity")]
    public int? Quantity { get; set; }

    /// <summary>
    /// Part/Product Number
    /// </summary>
    /// <value>Part/Product Number</value>
    [DataMember(Name="partNumber", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "partNumber")]
    public string PartNumber { get; set; }

    /// <summary>
    /// Universal Product Code
    /// </summary>
    /// <value>Universal Product Code</value>
    [DataMember(Name="upc", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "upc")]
    public string Upc { get; set; }

    /// <summary>
    /// Stock Keeping Unit
    /// </summary>
    /// <value>Stock Keeping Unit</value>
    [DataMember(Name="sku", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "sku")]
    public string Sku { get; set; }

    /// <summary>
    /// Product Identifier
    /// </summary>
    /// <value>Product Identifier</value>
    [DataMember(Name="productID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "productID")]
    public int? ProductID { get; set; }

    /// <summary>
    /// To Bin ID
    /// </summary>
    /// <value>To Bin ID</value>
    [DataMember(Name="toBin", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "toBin")]
    public string ToBin { get; set; }

    /// <summary>
    /// To Bin ID
    /// </summary>
    /// <value>To Bin ID</value>
    [DataMember(Name="toBinID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "toBinID")]
    public int? ToBinID { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class PendingItem {\n");
      sb.Append("  PendingItemID: ").Append(PendingItemID).Append("\n");
      sb.Append("  OrderID: ").Append(OrderID).Append("\n");
      sb.Append("  ShipmentID: ").Append(ShipmentID).Append("\n");
      sb.Append("  Type: ").Append(Type).Append("\n");
      sb.Append("  Quantity: ").Append(Quantity).Append("\n");
      sb.Append("  PartNumber: ").Append(PartNumber).Append("\n");
      sb.Append("  Upc: ").Append(Upc).Append("\n");
      sb.Append("  Sku: ").Append(Sku).Append("\n");
      sb.Append("  ProductID: ").Append(ProductID).Append("\n");
      sb.Append("  ToBin: ").Append(ToBin).Append("\n");
      sb.Append("  ToBinID: ").Append(ToBinID).Append("\n");
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
