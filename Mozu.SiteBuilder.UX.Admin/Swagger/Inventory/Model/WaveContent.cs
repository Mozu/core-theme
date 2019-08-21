using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// 
    /// </summary>
    [DataContract]
  public class WaveContent : BaseResponse {
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
    /// Bin Name
    /// </summary>
    /// <value>Bin Name</value>
    [DataMember(Name="binName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "binName")]
    public string BinName { get; set; }

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
    /// Current Quantity of Item
    /// </summary>
    /// <value>Current Quantity of Item</value>
    [DataMember(Name="quantity", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "quantity")]
    public int? Quantity { get; set; }

    /// <summary>
    /// Actual Quantity of Item
    /// </summary>
    /// <value>Actual Quantity of Item</value>
    [DataMember(Name="actualQuantity", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "actualQuantity")]
    public int? ActualQuantity { get; set; }

    /// <summary>
    /// Slot Identifier
    /// </summary>
    /// <value>Slot Identifier</value>
    [DataMember(Name="slotID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "slotID")]
    public int? SlotID { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class WaveContent {\n");
      sb.Append("  OrderID: ").Append(OrderID).Append("\n");
      sb.Append("  ShipmentID: ").Append(ShipmentID).Append("\n");
      sb.Append("  BinName: ").Append(BinName).Append("\n");
      sb.Append("  PartNumber: ").Append(PartNumber).Append("\n");
      sb.Append("  Upc: ").Append(Upc).Append("\n");
      sb.Append("  Sku: ").Append(Sku).Append("\n");
      sb.Append("  Quantity: ").Append(Quantity).Append("\n");
      sb.Append("  ActualQuantity: ").Append(ActualQuantity).Append("\n");
      sb.Append("  SlotID: ").Append(SlotID).Append("\n");
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
