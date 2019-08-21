using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// Item for Allocation
    /// </summary>
    [DataContract]
  public class AllocateItem {
    /// <summary>
    /// part number
    /// </summary>
    /// <value>part number</value>
    [DataMember(Name="partNumber", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "partNumber")]
    public string PartNumber { get; set; }

    /// <summary>
    /// upc
    /// </summary>
    /// <value>upc</value>
    [DataMember(Name="upc", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "upc")]
    public string Upc { get; set; }

    /// <summary>
    /// sku
    /// </summary>
    /// <value>sku</value>
    [DataMember(Name="sku", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "sku")]
    public string Sku { get; set; }

    /// <summary>
    /// quantity
    /// </summary>
    /// <value>quantity</value>
    [DataMember(Name="quantity", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "quantity")]
    public int? Quantity { get; set; }

    /// <summary>
    /// order ID
    /// </summary>
    /// <value>order ID</value>
    [DataMember(Name="orderID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "orderID")]
    public int? OrderID { get; set; }

    /// <summary>
    /// order item ID
    /// </summary>
    /// <value>order item ID</value>
    [DataMember(Name="orderItemID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "orderItemID")]
    public int? OrderItemID { get; set; }

    /// <summary>
    /// shipment ID
    /// </summary>
    /// <value>shipment ID</value>
    [DataMember(Name="shipmentID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shipmentID")]
    public int? ShipmentID { get; set; }

    /// <summary>
    /// location Code
    /// </summary>
    /// <value>location Code</value>
    [DataMember(Name="locationCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationCode")]
    public string LocationCode { get; set; }

    /// <summary>
    /// previous order item ID
    /// </summary>
    /// <value>previous order item ID</value>
    [DataMember(Name="previousOrderItemID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "previousOrderItemID")]
    public int? PreviousOrderItemID { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class AllocateItem {\n");
      sb.Append("  PartNumber: ").Append(PartNumber).Append("\n");
      sb.Append("  Upc: ").Append(Upc).Append("\n");
      sb.Append("  Sku: ").Append(Sku).Append("\n");
      sb.Append("  Quantity: ").Append(Quantity).Append("\n");
      sb.Append("  OrderID: ").Append(OrderID).Append("\n");
      sb.Append("  OrderItemID: ").Append(OrderItemID).Append("\n");
      sb.Append("  ShipmentID: ").Append(ShipmentID).Append("\n");
      sb.Append("  LocationCode: ").Append(LocationCode).Append("\n");
      sb.Append("  PreviousOrderItemID: ").Append(PreviousOrderItemID).Append("\n");
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
