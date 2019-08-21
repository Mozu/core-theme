using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// 
    /// </summary>
    [DataContract]
  public class OrderItemLogResponse : BaseResponse {
    /// <summary>
    /// Order Identifier
    /// </summary>
    /// <value>Order Identifier</value>
    [DataMember(Name="orderID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "orderID")]
    public int? OrderID { get; set; }

    /// <summary>
    /// Order Item Identifier
    /// </summary>
    /// <value>Order Item Identifier</value>
    [DataMember(Name="orderItemID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "orderItemID")]
    public int? OrderItemID { get; set; }

    /// <summary>
    /// Shipment Identifier
    /// </summary>
    /// <value>Shipment Identifier</value>
    [DataMember(Name="shipmentID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shipmentID")]
    public int? ShipmentID { get; set; }

    /// <summary>
    /// Inventory Identifier
    /// </summary>
    /// <value>Inventory Identifier</value>
    [DataMember(Name="inventoryID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "inventoryID")]
    public int? InventoryID { get; set; }

    /// <summary>
    /// Tenant Identifier
    /// </summary>
    /// <value>Tenant Identifier</value>
    [DataMember(Name="tenantID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "tenantID")]
    public int? TenantID { get; set; }

    /// <summary>
    /// Location Code Identifier
    /// </summary>
    /// <value>Location Code Identifier</value>
    [DataMember(Name="locationCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationCode")]
    public string LocationCode { get; set; }

    /// <summary>
    /// User Identifier
    /// </summary>
    /// <value>User Identifier</value>
    [DataMember(Name="userID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "userID")]
    public int? UserID { get; set; }

    /// <summary>
    /// The number of items affected for this log entry
    /// </summary>
    /// <value>The number of items affected for this log entry</value>
    [DataMember(Name="quantity", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "quantity")]
    public int? Quantity { get; set; }

    /// <summary>
    /// The type of logs to retrieve
    /// </summary>
    /// <value>The type of logs to retrieve</value>
    [DataMember(Name="type", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "type")]
    public string Type { get; set; }

    /// <summary>
    /// Whether this event is resolved
    /// </summary>
    /// <value>Whether this event is resolved</value>
    [DataMember(Name="resolved", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "resolved")]
    public bool? Resolved { get; set; }

    /// <summary>
    /// Whether this event has been fixed
    /// </summary>
    /// <value>Whether this event has been fixed</value>
    [DataMember(Name="fixed", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "fixed")]
    public bool? Fixed { get; set; }

    /// <summary>
    /// The date of this log entry
    /// </summary>
    /// <value>The date of this log entry</value>
    [DataMember(Name="date", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "date")]
    public string Date { get; set; }

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
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class OrderItemLogResponse {\n");
      sb.Append("  OrderID: ").Append(OrderID).Append("\n");
      sb.Append("  OrderItemID: ").Append(OrderItemID).Append("\n");
      sb.Append("  ShipmentID: ").Append(ShipmentID).Append("\n");
      sb.Append("  InventoryID: ").Append(InventoryID).Append("\n");
      sb.Append("  TenantID: ").Append(TenantID).Append("\n");
      sb.Append("  LocationCode: ").Append(LocationCode).Append("\n");
      sb.Append("  UserID: ").Append(UserID).Append("\n");
      sb.Append("  Quantity: ").Append(Quantity).Append("\n");
      sb.Append("  Type: ").Append(Type).Append("\n");
      sb.Append("  Resolved: ").Append(Resolved).Append("\n");
      sb.Append("  Fixed: ").Append(Fixed).Append("\n");
      sb.Append("  Date: ").Append(Date).Append("\n");
      sb.Append("  PartNumber: ").Append(PartNumber).Append("\n");
      sb.Append("  Upc: ").Append(Upc).Append("\n");
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
