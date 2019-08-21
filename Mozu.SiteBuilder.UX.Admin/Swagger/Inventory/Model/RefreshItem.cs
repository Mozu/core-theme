using System.Text;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// Refresh Item
    /// </summary>
    [DataContract]
  public class RefreshItem {
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
    /// Bin Location Identifier
    /// </summary>
    /// <value>Bin Location Identifier</value>
    [DataMember(Name="binID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "binID")]
    public int? BinID { get; set; }

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
    /// Current Quantity of Item
    /// </summary>
    /// <value>Current Quantity of Item</value>
    [DataMember(Name="quantity", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "quantity")]
    public int? Quantity { get; set; }

    /// <summary>
    /// Stock Keeping Unit
    /// </summary>
    /// <value>Stock Keeping Unit</value>
    [DataMember(Name="retailPrice", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "retailPrice")]
    public decimal RetailPrice { get; set; }

    /// <summary>
    /// The price of the item
    /// </summary>
    /// <value>The price of the item</value>
    [DataMember(Name="currencyID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "currencyID")]
    public int? CurrencyID { get; set; }

    /// <summary>
    /// List of Item Attributes
    /// </summary>
    /// <value>List of Item Attributes</value>
    [DataMember(Name="attributes", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "attributes")]
    public List<string> Attributes { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class RefreshItem {\n");
      sb.Append("  PartNumber: ").Append(PartNumber).Append("\n");
      sb.Append("  Upc: ").Append(Upc).Append("\n");
      sb.Append("  Sku: ").Append(Sku).Append("\n");
      sb.Append("  BinID: ").Append(BinID).Append("\n");
      sb.Append("  Ltd: ").Append(Ltd).Append("\n");
      sb.Append("  Floor: ").Append(Floor).Append("\n");
      sb.Append("  SafetyStock: ").Append(SafetyStock).Append("\n");
      sb.Append("  Quantity: ").Append(Quantity).Append("\n");
      sb.Append("  RetailPrice: ").Append(RetailPrice).Append("\n");
      sb.Append("  CurrencyID: ").Append(CurrencyID).Append("\n");
      sb.Append("  Attributes: ").Append(Attributes).Append("\n");
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
