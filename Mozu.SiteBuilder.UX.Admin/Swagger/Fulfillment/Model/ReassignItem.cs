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
  public class ReassignItem {
    /// <summary>
    /// Gets or Sets ActualPrice
    /// </summary>
    [DataMember(Name="actualPrice", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "actualPrice")]
    public decimal ActualPrice { get; set; }

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
    /// Gets or Sets BackorderReleaseDate
    /// </summary>
    [DataMember(Name="backorderReleaseDate", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "backorderReleaseDate")]
    public DateTime? BackorderReleaseDate { get; set; }

    /// <summary>
    /// Gets or Sets Color
    /// </summary>
    [DataMember(Name="color", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "color")]
    public string Color { get; set; }

    /// <summary>
    /// Gets or Sets Data
    /// </summary>
    [DataMember(Name="data", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "data")]
    public Object Data { get; set; }

    /// <summary>
    /// Gets or Sets Duty
    /// </summary>
    [DataMember(Name="duty", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "duty")]
    public decimal Duty { get; set; }

    /// <summary>
    /// Gets or Sets FulfillmentItemType
    /// </summary>
    [DataMember(Name="fulfillmentItemType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "fulfillmentItemType")]
    public string FulfillmentItemType { get; set; }

    /// <summary>
    /// Gets or Sets FulfillmentLocationCode
    /// </summary>
    [DataMember(Name="fulfillmentLocationCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "fulfillmentLocationCode")]
    public string FulfillmentLocationCode { get; set; }

    /// <summary>
    /// Gets or Sets Handling
    /// </summary>
    [DataMember(Name="handling", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "handling")]
    public decimal Handling { get; set; }

    /// <summary>
    /// Gets or Sets HandlingDiscount
    /// </summary>
    [DataMember(Name="handlingDiscount", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "handlingDiscount")]
    public decimal HandlingDiscount { get; set; }

    /// <summary>
    /// Gets or Sets HandlingTax
    /// </summary>
    [DataMember(Name="handlingTax", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "handlingTax")]
    public decimal HandlingTax { get; set; }

    /// <summary>
    /// Gets or Sets ImageUrl
    /// </summary>
    [DataMember(Name="imageUrl", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "imageUrl")]
    public string ImageUrl { get; set; }

    /// <summary>
    /// Gets or Sets IsTaxable
    /// </summary>
    [DataMember(Name="isTaxable", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "isTaxable")]
    public bool? IsTaxable { get; set; }

    /// <summary>
    /// Gets or Sets ItemDiscount
    /// </summary>
    [DataMember(Name="itemDiscount", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "itemDiscount")]
    public decimal ItemDiscount { get; set; }

    /// <summary>
    /// Gets or Sets ItemTax
    /// </summary>
    [DataMember(Name="itemTax", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "itemTax")]
    public decimal ItemTax { get; set; }

    /// <summary>
    /// Gets or Sets LineId
    /// </summary>
    [DataMember(Name="lineId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "lineId")]
    public int? LineId { get; set; }

    /// <summary>
    /// Gets or Sets LineItemCost
    /// </summary>
    [DataMember(Name="lineItemCost", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "lineItemCost")]
    public decimal LineItemCost { get; set; }

    /// <summary>
    /// Gets or Sets LocationCode
    /// </summary>
    [DataMember(Name="locationCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationCode")]
    public string LocationCode { get; set; }

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
    /// Gets or Sets OriginalOrderItemId
    /// </summary>
    [DataMember(Name="originalOrderItemId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "originalOrderItemId")]
    public string OriginalOrderItemId { get; set; }

    /// <summary>
    /// Gets or Sets ParentId
    /// </summary>
    [DataMember(Name="parentId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "parentId")]
    public string ParentId { get; set; }

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
    /// Gets or Sets Shipping
    /// </summary>
    [DataMember(Name="shipping", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shipping")]
    public decimal Shipping { get; set; }

    /// <summary>
    /// Gets or Sets ShippingDiscount
    /// </summary>
    [DataMember(Name="shippingDiscount", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shippingDiscount")]
    public decimal ShippingDiscount { get; set; }

    /// <summary>
    /// Gets or Sets ShippingTax
    /// </summary>
    [DataMember(Name="shippingTax", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shippingTax")]
    public decimal ShippingTax { get; set; }

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
    /// Gets or Sets TaxData
    /// </summary>
    [DataMember(Name="taxData", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "taxData")]
    public Object TaxData { get; set; }

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
    /// Gets or Sets Weight
    /// </summary>
    [DataMember(Name="weight", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "weight")]
    public decimal Weight { get; set; }

    /// <summary>
    /// Gets or Sets WeightUnit
    /// </summary>
    [DataMember(Name="weightUnit", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "weightUnit")]
    public string WeightUnit { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class ReassignItem {\n");
      sb.Append("  ActualPrice: ").Append(ActualPrice).Append("\n");
      sb.Append("  Attributes: ").Append(Attributes).Append("\n");
      sb.Append("  AuditInfo: ").Append(AuditInfo).Append("\n");
      sb.Append("  BackorderReleaseDate: ").Append(BackorderReleaseDate).Append("\n");
      sb.Append("  Color: ").Append(Color).Append("\n");
      sb.Append("  Data: ").Append(Data).Append("\n");
      sb.Append("  Duty: ").Append(Duty).Append("\n");
      sb.Append("  FulfillmentItemType: ").Append(FulfillmentItemType).Append("\n");
      sb.Append("  FulfillmentLocationCode: ").Append(FulfillmentLocationCode).Append("\n");
      sb.Append("  Handling: ").Append(Handling).Append("\n");
      sb.Append("  HandlingDiscount: ").Append(HandlingDiscount).Append("\n");
      sb.Append("  HandlingTax: ").Append(HandlingTax).Append("\n");
      sb.Append("  ImageUrl: ").Append(ImageUrl).Append("\n");
      sb.Append("  IsTaxable: ").Append(IsTaxable).Append("\n");
      sb.Append("  ItemDiscount: ").Append(ItemDiscount).Append("\n");
      sb.Append("  ItemTax: ").Append(ItemTax).Append("\n");
      sb.Append("  LineId: ").Append(LineId).Append("\n");
      sb.Append("  LineItemCost: ").Append(LineItemCost).Append("\n");
      sb.Append("  LocationCode: ").Append(LocationCode).Append("\n");
      sb.Append("  Name: ").Append(Name).Append("\n");
      sb.Append("  OptionAttributeFQN: ").Append(OptionAttributeFQN).Append("\n");
      sb.Append("  OriginalOrderItemId: ").Append(OriginalOrderItemId).Append("\n");
      sb.Append("  ParentId: ").Append(ParentId).Append("\n");
      sb.Append("  PartNumber: ").Append(PartNumber).Append("\n");
      sb.Append("  ProductCode: ").Append(ProductCode).Append("\n");
      sb.Append("  Quantity: ").Append(Quantity).Append("\n");
      sb.Append("  Reason: ").Append(Reason).Append("\n");
      sb.Append("  Shipping: ").Append(Shipping).Append("\n");
      sb.Append("  ShippingDiscount: ").Append(ShippingDiscount).Append("\n");
      sb.Append("  ShippingTax: ").Append(ShippingTax).Append("\n");
      sb.Append("  Size: ").Append(Size).Append("\n");
      sb.Append("  Sku: ").Append(Sku).Append("\n");
      sb.Append("  TaxData: ").Append(TaxData).Append("\n");
      sb.Append("  UnitPrice: ").Append(UnitPrice).Append("\n");
      sb.Append("  Upc: ").Append(Upc).Append("\n");
      sb.Append("  VariationProductCode: ").Append(VariationProductCode).Append("\n");
      sb.Append("  Weight: ").Append(Weight).Append("\n");
      sb.Append("  WeightUnit: ").Append(WeightUnit).Append("\n");
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
