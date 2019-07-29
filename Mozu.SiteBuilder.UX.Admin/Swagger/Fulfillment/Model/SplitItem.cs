using System;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Fulfiller.Contracts.Model {

  /// <summary>
  /// 
  /// </summary>
  [DataContract]
  public class SplitItem {
    /// <summary>
    /// Gets or Sets Attributes
    /// </summary>
    [DataMember(Name="attributes", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "attributes")]
    public Dictionary<string, Object> Attributes { get; set; }

    /// <summary>
    /// Gets or Sets Color
    /// </summary>
    [DataMember(Name="color", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "color")]
    public string Color { get; set; }

    /// <summary>
    /// Gets or Sets FulfillmentItemType
    /// </summary>
    [DataMember(Name="fulfillmentItemType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "fulfillmentItemType")]
    public string FulfillmentItemType { get; set; }

    /// <summary>
    /// Gets or Sets ImageUrl
    /// </summary>
    [DataMember(Name="imageUrl", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "imageUrl")]
    public string ImageUrl { get; set; }

    /// <summary>
    /// Gets or Sets LineId
    /// </summary>
    [DataMember(Name="lineId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "lineId")]
    public int? LineId { get; set; }

    /// <summary>
    /// Gets or Sets Name
    /// </summary>
    [DataMember(Name="name", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "name")]
    public string Name { get; set; }

    /// <summary>
    /// Gets or Sets OptionAttributeFQN
    /// </summary>
    [DataMember(Name="optionAttributeFQN", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "optionAttributeFQN")]
    public string OptionAttributeFQN { get; set; }

    /// <summary>
    /// Gets or Sets PartNumber
    /// </summary>
    [DataMember(Name="partNumber", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "partNumber")]
    public string PartNumber { get; set; }

    /// <summary>
    /// Gets or Sets ProductCode
    /// </summary>
    [DataMember(Name="productCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "productCode")]
    public string ProductCode { get; set; }

    /// <summary>
    /// Gets or Sets Quantity
    /// </summary>
    [DataMember(Name="quantity", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "quantity")]
    public int? Quantity { get; set; }

    /// <summary>
    /// Gets or Sets Reason
    /// </summary>
    [DataMember(Name="reason", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "reason")]
    public string Reason { get; set; }

    /// <summary>
    /// Gets or Sets RetailPrice
    /// </summary>
    [DataMember(Name="retailPrice", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "retailPrice")]
    public decimal RetailPrice { get; set; }

    /// <summary>
    /// Gets or Sets Size
    /// </summary>
    [DataMember(Name="size", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "size")]
    public string Size { get; set; }

    /// <summary>
    /// Gets or Sets Sku
    /// </summary>
    [DataMember(Name="sku", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "sku")]
    public string Sku { get; set; }

    /// <summary>
    /// Gets or Sets UnitPrice
    /// </summary>
    [DataMember(Name="unitPrice", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "unitPrice")]
    public decimal UnitPrice { get; set; }

    /// <summary>
    /// Gets or Sets Upc
    /// </summary>
    [DataMember(Name="upc", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "upc")]
    public string Upc { get; set; }

    /// <summary>
    /// Gets or Sets VariationProductCode
    /// </summary>
    [DataMember(Name="variationProductCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "variationProductCode")]
    public string VariationProductCode { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class SplitItem {\n");
      sb.Append("  Attributes: ").Append(Attributes).Append("\n");
      sb.Append("  Color: ").Append(Color).Append("\n");
      sb.Append("  FulfillmentItemType: ").Append(FulfillmentItemType).Append("\n");
      sb.Append("  ImageUrl: ").Append(ImageUrl).Append("\n");
      sb.Append("  LineId: ").Append(LineId).Append("\n");
      sb.Append("  Name: ").Append(Name).Append("\n");
      sb.Append("  OptionAttributeFQN: ").Append(OptionAttributeFQN).Append("\n");
      sb.Append("  PartNumber: ").Append(PartNumber).Append("\n");
      sb.Append("  ProductCode: ").Append(ProductCode).Append("\n");
      sb.Append("  Quantity: ").Append(Quantity).Append("\n");
      sb.Append("  Reason: ").Append(Reason).Append("\n");
      sb.Append("  RetailPrice: ").Append(RetailPrice).Append("\n");
      sb.Append("  Size: ").Append(Size).Append("\n");
      sb.Append("  Sku: ").Append(Sku).Append("\n");
      sb.Append("  UnitPrice: ").Append(UnitPrice).Append("\n");
      sb.Append("  Upc: ").Append(Upc).Append("\n");
      sb.Append("  VariationProductCode: ").Append(VariationProductCode).Append("\n");
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
