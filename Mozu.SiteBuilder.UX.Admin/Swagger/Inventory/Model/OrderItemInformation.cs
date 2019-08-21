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
  public class OrderItemInformation : BaseResponse {
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
    /// Location Identifier
    /// </summary>
    /// <value>Location Identifier</value>
    [DataMember(Name="locationID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationID")]
    public int? LocationID { get; set; }

    /// <summary>
    /// Flag for whether the location is active
    /// </summary>
    /// <value>Flag for whether the location is active</value>
    [DataMember(Name="locationActive", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationActive")]
    public bool? LocationActive { get; set; }

    /// <summary>
    /// External Store Identifier
    /// </summary>
    /// <value>External Store Identifier</value>
    [DataMember(Name="locationCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationCode")]
    public int? LocationCode { get; set; }

    /// <summary>
    /// Location Name
    /// </summary>
    /// <value>Location Name</value>
    [DataMember(Name="locationName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationName")]
    public string LocationName { get; set; }

    /// <summary>
    /// Bin Identifier
    /// </summary>
    /// <value>Bin Identifier</value>
    [DataMember(Name="binID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "binID")]
    public int? BinID { get; set; }

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
    /// Custom field used for store prioritization
    /// </summary>
    /// <value>Custom field used for store prioritization</value>
    [DataMember(Name="ltd", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "ltd")]
    public string Ltd { get; set; }

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
    [DataMember(Name="safetyStock", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "safetyStock")]
    public int? SafetyStock { get; set; }

    /// <summary>
    /// The quantity the location has in its possession
    /// </summary>
    /// <value>The quantity the location has in its possession</value>
    [DataMember(Name="onHand", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "onHand")]
    public int? OnHand { get; set; }

    /// <summary>
    /// The quantity the location has that are available for purchase
    /// </summary>
    /// <value>The quantity the location has that are available for purchase</value>
    [DataMember(Name="available", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "available")]
    public int? Available { get; set; }

    /// <summary>
    /// The quantity the location has that are allocated
    /// </summary>
    /// <value>The quantity the location has that are allocated</value>
    [DataMember(Name="allocated", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "allocated")]
    public int? Allocated { get; set; }

    /// <summary>
    /// Total number of allocations
    /// </summary>
    /// <value>Total number of allocations</value>
    [DataMember(Name="allocates", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "allocates")]
    public int? Allocates { get; set; }

    /// <summary>
    /// Total number of deallocations
    /// </summary>
    /// <value>Total number of deallocations</value>
    [DataMember(Name="deallocates", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "deallocates")]
    public int? Deallocates { get; set; }

    /// <summary>
    /// Total number of fulfillments. Should never be greater than 1.
    /// </summary>
    /// <value>Total number of fulfillments. Should never be greater than 1.</value>
    [DataMember(Name="fulfills", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "fulfills")]
    public int? Fulfills { get; set; }

    /// <summary>
    /// Total number of picks (WMS only)
    /// </summary>
    /// <value>Total number of picks (WMS only)</value>
    [DataMember(Name="picks", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "picks")]
    public int? Picks { get; set; }

    /// <summary>
    /// Pending quantity (WMS only)
    /// </summary>
    /// <value>Pending quantity (WMS only)</value>
    [DataMember(Name="pendingQuantity", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "pendingQuantity")]
    public int? PendingQuantity { get; set; }

    /// <summary>
    /// Order Identifier
    /// </summary>
    /// <value>Order Identifier</value>
    [DataMember(Name="events", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "events")]
    public List<OrderItemInformationEvent> Events { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class OrderItemInformation {\n");
      sb.Append("  OrderID: ").Append(OrderID).Append("\n");
      sb.Append("  OrderItemID: ").Append(OrderItemID).Append("\n");
      sb.Append("  LocationID: ").Append(LocationID).Append("\n");
      sb.Append("  LocationActive: ").Append(LocationActive).Append("\n");
      sb.Append("  LocationCode: ").Append(LocationCode).Append("\n");
      sb.Append("  LocationName: ").Append(LocationName).Append("\n");
      sb.Append("  BinID: ").Append(BinID).Append("\n");
      sb.Append("  PartNumber: ").Append(PartNumber).Append("\n");
      sb.Append("  Upc: ").Append(Upc).Append("\n");
      sb.Append("  Sku: ").Append(Sku).Append("\n");
      sb.Append("  Ltd: ").Append(Ltd).Append("\n");
      sb.Append("  Floor: ").Append(Floor).Append("\n");
      sb.Append("  SafetyStock: ").Append(SafetyStock).Append("\n");
      sb.Append("  OnHand: ").Append(OnHand).Append("\n");
      sb.Append("  Available: ").Append(Available).Append("\n");
      sb.Append("  Allocated: ").Append(Allocated).Append("\n");
      sb.Append("  Allocates: ").Append(Allocates).Append("\n");
      sb.Append("  Deallocates: ").Append(Deallocates).Append("\n");
      sb.Append("  Fulfills: ").Append(Fulfills).Append("\n");
      sb.Append("  Picks: ").Append(Picks).Append("\n");
      sb.Append("  PendingQuantity: ").Append(PendingQuantity).Append("\n");
      sb.Append("  Events: ").Append(Events).Append("\n");
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
