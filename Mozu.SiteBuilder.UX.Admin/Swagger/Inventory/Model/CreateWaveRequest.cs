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
  public class CreateWaveRequest : BaseRequest {
    /// <summary>
    /// Type of wave
    /// </summary>
    /// <value>Type of wave</value>
    [DataMember(Name="type", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "type")]
    public string Type { get; set; }

    /// <summary>
    /// Maximum number of orders
    /// </summary>
    /// <value>Maximum number of orders</value>
    [DataMember(Name="maxOrders", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "maxOrders")]
    public int? MaxOrders { get; set; }

    /// <summary>
    /// Order Type of the wave
    /// </summary>
    /// <value>Order Type of the wave</value>
    [DataMember(Name="includeZeroInventory", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "includeZeroInventory")]
    public string IncludeZeroInventory { get; set; }

    /// <summary>
    /// List of Bin Ranges
    /// </summary>
    /// <value>List of Bin Ranges</value>
    [DataMember(Name="binRanges", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "binRanges")]
    public List<BinRange> BinRanges { get; set; }

    /// <summary>
    /// Gets or Sets OrderDateRange
    /// </summary>
    [DataMember(Name="orderDateRange", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "orderDateRange")]
    public DateRange OrderDateRange { get; set; }

    /// <summary>
    /// Part/Product Number
    /// </summary>
    /// <value>Part/Product Number</value>
    [DataMember(Name="products", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "products")]
    public string Products { get; set; }

    /// <summary>
    /// Shipping Options
    /// </summary>
    /// <value>Shipping Options</value>
    [DataMember(Name="shippingOptions", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shippingOptions")]
    public string ShippingOptions { get; set; }

    /// <summary>
    /// Custom order item data
    /// </summary>
    /// <value>Custom order item data</value>
    [DataMember(Name="customOrderItemData", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "customOrderItemData")]
    public List<List<string>> CustomOrderItemData { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class CreateWaveRequest {\n");
      sb.Append("  Type: ").Append(Type).Append("\n");
      sb.Append("  MaxOrders: ").Append(MaxOrders).Append("\n");
      sb.Append("  IncludeZeroInventory: ").Append(IncludeZeroInventory).Append("\n");
      sb.Append("  BinRanges: ").Append(BinRanges).Append("\n");
      sb.Append("  OrderDateRange: ").Append(OrderDateRange).Append("\n");
      sb.Append("  Products: ").Append(Products).Append("\n");
      sb.Append("  ShippingOptions: ").Append(ShippingOptions).Append("\n");
      sb.Append("  CustomOrderItemData: ").Append(CustomOrderItemData).Append("\n");
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
