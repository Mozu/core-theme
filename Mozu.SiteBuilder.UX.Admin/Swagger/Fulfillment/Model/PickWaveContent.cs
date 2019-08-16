using System;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Fulfillment.Contracts.Model {

  /// <summary>
  /// 
  /// </summary>
  [DataContract]
  public class PickWaveContent {
    /// <summary>
    /// Gets or Sets ActualQuantity
    /// </summary>
    [DataMember(Name="actualQuantity", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "actualQuantity")]
    public int? ActualQuantity { get; set; }

    /// <summary>
    /// Gets or Sets Attributes
    /// </summary>
    [DataMember(Name="attributes", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "attributes")]
    public Dictionary<string, Object> Attributes { get; set; }

    /// <summary>
    /// Gets or Sets AuditInfo
    /// </summary>
    [DataMember(Name="auditInfo", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "auditInfo")]
    public AuditInfo AuditInfo { get; set; }

    /// <summary>
    /// Gets or Sets BinId
    /// </summary>
    [DataMember(Name="binId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "binId")]
    public int? BinId { get; set; }

    /// <summary>
    /// Gets or Sets BinName
    /// </summary>
    [DataMember(Name="binName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "binName")]
    public string BinName { get; set; }

    /// <summary>
    /// Gets or Sets ContentId
    /// </summary>
    [DataMember(Name="contentId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "contentId")]
    public string ContentId { get; set; }

    /// <summary>
    /// Gets or Sets ImageUrl
    /// </summary>
    [DataMember(Name="imageUrl", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "imageUrl")]
    public string ImageUrl { get; set; }

    /// <summary>
    /// Gets or Sets InventoryId
    /// </summary>
    [DataMember(Name="inventoryId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "inventoryId")]
    public int? InventoryId { get; set; }

    /// <summary>
    /// Gets or Sets ItemLineId
    /// </summary>
    [DataMember(Name="itemLineId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "itemLineId")]
    public int? ItemLineId { get; set; }

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
    /// Gets or Sets OrderNumber
    /// </summary>
    [DataMember(Name="orderNumber", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "orderNumber")]
    public int? OrderNumber { get; set; }

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
    /// Gets or Sets ShipmentNumber
    /// </summary>
    [DataMember(Name="shipmentNumber", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shipmentNumber")]
    public int? ShipmentNumber { get; set; }

    /// <summary>
    /// Gets or Sets Sku
    /// </summary>
    [DataMember(Name="sku", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "sku")]
    public string Sku { get; set; }

    /// <summary>
    /// Gets or Sets Status
    /// </summary>
    [DataMember(Name="status", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "status")]
    public string Status { get; set; }

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
      sb.Append("class PickWaveContent {\n");
      sb.Append("  ActualQuantity: ").Append(ActualQuantity).Append("\n");
      sb.Append("  Attributes: ").Append(Attributes).Append("\n");
      sb.Append("  AuditInfo: ").Append(AuditInfo).Append("\n");
      sb.Append("  BinId: ").Append(BinId).Append("\n");
      sb.Append("  BinName: ").Append(BinName).Append("\n");
      sb.Append("  ContentId: ").Append(ContentId).Append("\n");
      sb.Append("  ImageUrl: ").Append(ImageUrl).Append("\n");
      sb.Append("  InventoryId: ").Append(InventoryId).Append("\n");
      sb.Append("  ItemLineId: ").Append(ItemLineId).Append("\n");
      sb.Append("  Name: ").Append(Name).Append("\n");
      sb.Append("  OptionAttributeFQN: ").Append(OptionAttributeFQN).Append("\n");
      sb.Append("  OrderNumber: ").Append(OrderNumber).Append("\n");
      sb.Append("  PartNumber: ").Append(PartNumber).Append("\n");
      sb.Append("  ProductCode: ").Append(ProductCode).Append("\n");
      sb.Append("  Quantity: ").Append(Quantity).Append("\n");
      sb.Append("  ShipmentNumber: ").Append(ShipmentNumber).Append("\n");
      sb.Append("  Sku: ").Append(Sku).Append("\n");
      sb.Append("  Status: ").Append(Status).Append("\n");
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
