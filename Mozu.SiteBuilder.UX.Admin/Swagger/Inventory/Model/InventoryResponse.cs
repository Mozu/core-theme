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
  public class InventoryResponse : BaseResponse {
    /// <summary>
    /// Location Name
    /// </summary>
    /// <value>Location Name</value>
    [DataMember(Name="locationName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationName")]
    public string LocationName { get; set; }

    /// <summary>
    /// Location Code
    /// </summary>
    /// <value>Location Code</value>
    [DataMember(Name="locationCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationCode")]
    public string LocationCode { get; set; }

    /// <summary>
    /// Tenant Identifier
    /// </summary>
    /// <value>Tenant Identifier</value>
    [DataMember(Name="tenantID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "tenantID")]
    public int? TenantID { get; set; }

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
    /// The quantity the location has that are already allocated.
    /// </summary>
    /// <value>The quantity the location has that are already allocated.</value>
    [DataMember(Name="allocated", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "allocated")]
    public int? Allocated { get; set; }

    /// <summary>
    /// The quantity the location has that are pending.
    /// </summary>
    /// <value>The quantity the location has that are pending.</value>
    [DataMember(Name="pending", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "pending")]
    public int? Pending { get; set; }

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
    public decimal Ltd { get; set; }

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
    /// The distance in miles from this location to the item's destination
    /// </summary>
    /// <value>The distance in miles from this location to the item's destination</value>
    [DataMember(Name="distance", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "distance")]
    public decimal Distance { get; set; }

    /// <summary>
    /// Whether this location can ship to a consumer
    /// </summary>
    /// <value>Whether this location can ship to a consumer</value>
    [DataMember(Name="directShip", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "directShip")]
    public bool? DirectShip { get; set; }

    /// <summary>
    /// Whether the location can ship to another location (store), thus restocking that location.
    /// </summary>
    /// <value>Whether the location can ship to another location (store), thus restocking that location.</value>
    [DataMember(Name="transferEnabled", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "transferEnabled")]
    public bool? TransferEnabled { get; set; }

    /// <summary>
    /// Whether a consumer can pick up product at this location (store)
    /// </summary>
    /// <value>Whether a consumer can pick up product at this location (store)</value>
    [DataMember(Name="pickup", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "pickup")]
    public bool? Pickup { get; set; }

    /// <summary>
    /// The country code of this location
    /// </summary>
    /// <value>The country code of this location</value>
    [DataMember(Name="countryCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "countryCode")]
    public string CountryCode { get; set; }

    /// <summary>
    /// The currency identifier for the retailPrice
    /// </summary>
    /// <value>The currency identifier for the retailPrice</value>
    [DataMember(Name="currencyID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "currencyID")]
    public int? CurrencyID { get; set; }

    /// <summary>
    /// The price of the product at this location
    /// </summary>
    /// <value>The price of the product at this location</value>
    [DataMember(Name="retailPrice", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "retailPrice")]
    public decimal RetailPrice { get; set; }

    /// <summary>
    /// List of Inventory Attributes
    /// </summary>
    /// <value>List of Inventory Attributes</value>
    [DataMember(Name="attributes", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "attributes")]
    public List<string> Attributes { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class InventoryResponse {\n");
      sb.Append("  LocationName: ").Append(LocationName).Append("\n");
      sb.Append("  LocationCode: ").Append(LocationCode).Append("\n");
      sb.Append("  TenantID: ").Append(TenantID).Append("\n");
      sb.Append("  OnHand: ").Append(OnHand).Append("\n");
      sb.Append("  Available: ").Append(Available).Append("\n");
      sb.Append("  Allocated: ").Append(Allocated).Append("\n");
      sb.Append("  Pending: ").Append(Pending).Append("\n");
      sb.Append("  PartNumber: ").Append(PartNumber).Append("\n");
      sb.Append("  Upc: ").Append(Upc).Append("\n");
      sb.Append("  Sku: ").Append(Sku).Append("\n");
      sb.Append("  Ltd: ").Append(Ltd).Append("\n");
      sb.Append("  Floor: ").Append(Floor).Append("\n");
      sb.Append("  SafetyStock: ").Append(SafetyStock).Append("\n");
      sb.Append("  Distance: ").Append(Distance).Append("\n");
      sb.Append("  DirectShip: ").Append(DirectShip).Append("\n");
      sb.Append("  TransferEnabled: ").Append(TransferEnabled).Append("\n");
      sb.Append("  Pickup: ").Append(Pickup).Append("\n");
      sb.Append("  CountryCode: ").Append(CountryCode).Append("\n");
      sb.Append("  CurrencyID: ").Append(CurrencyID).Append("\n");
      sb.Append("  RetailPrice: ").Append(RetailPrice).Append("\n");
      sb.Append("  Attributes: ").Append(Attributes).Append("\n");
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
