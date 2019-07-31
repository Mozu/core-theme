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
  public class Shipment {
    /// <summary>
    /// Gets or Sets AdditionalHandlingFee
    /// </summary>
    [DataMember(Name="additionalHandlingFee", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "additionalHandlingFee")]
    public decimal AdditionalHandlingFee { get; set; }

    /// <summary>
    /// Gets or Sets AdditionalShippingFee
    /// </summary>
    [DataMember(Name="additionalShippingFee", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "additionalShippingFee")]
    public decimal AdditionalShippingFee { get; set; }

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
    /// Gets or Sets CanceledItems
    /// </summary>
    [DataMember(Name="canceledItems", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "canceledItems")]
    public List<CanceledItem> CanceledItems { get; set; }

    /// <summary>
    /// Gets or Sets ChangeMessages
    /// </summary>
    [DataMember(Name="changeMessages", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "changeMessages")]
    public List<ChangeMessage> ChangeMessages { get; set; }

    /// <summary>
    /// Gets or Sets ChildShipmentNumbers
    /// </summary>
    [DataMember(Name="childShipmentNumbers", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "childShipmentNumbers")]
    public List<int?> ChildShipmentNumbers { get; set; }

    /// <summary>
    /// Gets or Sets Cost
    /// </summary>
    [DataMember(Name="cost", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "cost")]
    public decimal Cost { get; set; }

    /// <summary>
    /// Gets or Sets CreateDate
    /// </summary>
    [DataMember(Name="createDate", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "createDate")]
    public DateTime? CreateDate { get; set; }

    /// <summary>
    /// Gets or Sets CurrencyCode
    /// </summary>
    [DataMember(Name="currencyCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "currencyCode")]
    public string CurrencyCode { get; set; }

    /// <summary>
    /// Gets or Sets CustomerAddressId
    /// </summary>
    [DataMember(Name="customerAddressId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "customerAddressId")]
    public int? CustomerAddressId { get; set; }

    /// <summary>
    /// Gets or Sets CustomerId
    /// </summary>
    [DataMember(Name="customerId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "customerId")]
    public string CustomerId { get; set; }

    /// <summary>
    /// Gets or Sets DestinationContact
    /// </summary>
    [DataMember(Name="destinationContact", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "destinationContact")]
    public Contact DestinationContact { get; set; }

    /// <summary>
    /// Gets or Sets ExternalShipmentId
    /// </summary>
    [DataMember(Name="externalShipmentId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "externalShipmentId")]
    public string ExternalShipmentId { get; set; }

    /// <summary>
    /// Gets or Sets FulfillmentDate
    /// </summary>
    [DataMember(Name="fulfillmentDate", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "fulfillmentDate")]
    public DateTime? FulfillmentDate { get; set; }

    /// <summary>
    /// Gets or Sets ItemHandlingFee
    /// </summary>
    [DataMember(Name="itemHandlingFee", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "itemHandlingFee")]
    public decimal ItemHandlingFee { get; set; }

    /// <summary>
    /// Gets or Sets ItemShippingFee
    /// </summary>
    [DataMember(Name="itemShippingFee", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "itemShippingFee")]
    public decimal ItemShippingFee { get; set; }

    /// <summary>
    /// Gets or Sets Items
    /// </summary>
    [DataMember(Name="items", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "items")]
    public List<Item> Items { get; set; }

    /// <summary>
    /// Gets or Sets LocationCode
    /// </summary>
    [DataMember(Name="locationCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationCode")]
    public string LocationCode { get; set; }

    /// <summary>
    /// Gets or Sets OrderId
    /// </summary>
    [DataMember(Name="orderId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "orderId")]
    public string OrderId { get; set; }

    /// <summary>
    /// Gets or Sets OrderNumber
    /// </summary>
    [DataMember(Name="orderNumber", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "orderNumber")]
    public int? OrderNumber { get; set; }

    /// <summary>
    /// Gets or Sets OrderSubmitDate
    /// </summary>
    [DataMember(Name="orderSubmitDate", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "orderSubmitDate")]
    public DateTime? OrderSubmitDate { get; set; }

    /// <summary>
    /// Gets or Sets OriginContact
    /// </summary>
    [DataMember(Name="originContact", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "originContact")]
    public Contact OriginContact { get; set; }

    /// <summary>
    /// Gets or Sets OriginalOrderId
    /// </summary>
    [DataMember(Name="originalOrderId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "originalOrderId")]
    public string OriginalOrderId { get; set; }

    /// <summary>
    /// Gets or Sets OriginalShipmentNumber
    /// </summary>
    [DataMember(Name="originalShipmentNumber", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "originalShipmentNumber")]
    public int? OriginalShipmentNumber { get; set; }

    /// <summary>
    /// Gets or Sets Packages
    /// </summary>
    [DataMember(Name="packages", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "packages")]
    public List<Package> Packages { get; set; }

    /// <summary>
    /// Gets or Sets ParentShipmentNumber
    /// </summary>
    [DataMember(Name="parentShipmentNumber", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "parentShipmentNumber")]
    public int? ParentShipmentNumber { get; set; }

    /// <summary>
    /// Gets or Sets PickStatus
    /// </summary>
    [DataMember(Name="pickStatus", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "pickStatus")]
    public string PickStatus { get; set; }

    /// <summary>
    /// Gets or Sets PickType
    /// </summary>
    [DataMember(Name="pickType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "pickType")]
    public string PickType { get; set; }

    /// <summary>
    /// Gets or Sets ShipDate
    /// </summary>
    [DataMember(Name="shipDate", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shipDate")]
    public DateTime? ShipDate { get; set; }

    /// <summary>
    /// Gets or Sets ShipmentId
    /// </summary>
    [DataMember(Name="shipmentId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shipmentId")]
    public string ShipmentId { get; set; }

    /// <summary>
    /// Gets or Sets ShipmentNumber
    /// </summary>
    [DataMember(Name="shipmentNumber", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shipmentNumber")]
    public int? ShipmentNumber { get; set; }

    /// <summary>
    /// Gets or Sets ShipmentStatus
    /// </summary>
    [DataMember(Name="shipmentStatus", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shipmentStatus")]
    public string ShipmentStatus { get; set; }

    /// <summary>
    /// Gets or Sets ShipmentType
    /// </summary>
    [DataMember(Name="shipmentType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shipmentType")]
    public string ShipmentType { get; set; }

    /// <summary>
    /// Gets or Sets ShippingMethodCode
    /// </summary>
    [DataMember(Name="shippingMethodCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shippingMethodCode")]
    public string ShippingMethodCode { get; set; }

    /// <summary>
    /// Gets or Sets SignatureRequired
    /// </summary>
    [DataMember(Name="signatureRequired", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "signatureRequired")]
    public bool? SignatureRequired { get; set; }

    /// <summary>
    /// Gets or Sets SiteId
    /// </summary>
    [DataMember(Name="siteId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "siteId")]
    public int? SiteId { get; set; }

    /// <summary>
    /// Gets or Sets TaxRateItem
    /// </summary>
    [DataMember(Name="taxRateItem", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "taxRateItem")]
    public decimal TaxRateItem { get; set; }

    /// <summary>
    /// Gets or Sets TaxRateShippingFee
    /// </summary>
    [DataMember(Name="taxRateShippingFee", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "taxRateShippingFee")]
    public decimal TaxRateShippingFee { get; set; }

    /// <summary>
    /// Gets or Sets TaxTotalHandlingFee
    /// </summary>
    [DataMember(Name="taxTotalHandlingFee", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "taxTotalHandlingFee")]
    public decimal TaxTotalHandlingFee { get; set; }

    /// <summary>
    /// Gets or Sets TaxTotalItem
    /// </summary>
    [DataMember(Name="taxTotalItem", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "taxTotalItem")]
    public decimal TaxTotalItem { get; set; }

    /// <summary>
    /// Gets or Sets TaxTotalShippingFee
    /// </summary>
    [DataMember(Name="taxTotalShippingFee", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "taxTotalShippingFee")]
    public decimal TaxTotalShippingFee { get; set; }

    /// <summary>
    /// Gets or Sets TenantId
    /// </summary>
    [DataMember(Name="tenantId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "tenantId")]
    public int? TenantId { get; set; }

    /// <summary>
    /// Gets or Sets TotalHandlingFee
    /// </summary>
    [DataMember(Name="totalHandlingFee", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "totalHandlingFee")]
    public decimal TotalHandlingFee { get; set; }

    /// <summary>
    /// Gets or Sets TotalItem
    /// </summary>
    [DataMember(Name="totalItem", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "totalItem")]
    public decimal TotalItem { get; set; }

    /// <summary>
    /// Gets or Sets TotalItemDiscount
    /// </summary>
    [DataMember(Name="totalItemDiscount", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "totalItemDiscount")]
    public decimal TotalItemDiscount { get; set; }

    /// <summary>
    /// Gets or Sets TotalItemDiscountTax
    /// </summary>
    [DataMember(Name="totalItemDiscountTax", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "totalItemDiscountTax")]
    public decimal TotalItemDiscountTax { get; set; }

    /// <summary>
    /// Gets or Sets TotalShipment
    /// </summary>
    [DataMember(Name="totalShipment", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "totalShipment")]
    public decimal TotalShipment { get; set; }

    /// <summary>
    /// Gets or Sets TotalShippingFee
    /// </summary>
    [DataMember(Name="totalShippingFee", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "totalShippingFee")]
    public decimal TotalShippingFee { get; set; }

    /// <summary>
    /// Gets or Sets TotalTax
    /// </summary>
    [DataMember(Name="totalTax", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "totalTax")]
    public decimal TotalTax { get; set; }

    /// <summary>
    /// Gets or Sets TrackingNumbers
    /// </summary>
    [DataMember(Name="trackingNumbers", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "trackingNumbers")]
    public List<string> TrackingNumbers { get; set; }

    /// <summary>
    /// Gets or Sets UpdateDate
    /// </summary>
    [DataMember(Name="updateDate", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "updateDate")]
    public DateTime? UpdateDate { get; set; }

    /// <summary>
    /// Gets or Sets WorkflowState
    /// </summary>
    [DataMember(Name="workflowState", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "workflowState")]
    public WorkflowState WorkflowState { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class Shipment {\n");
      sb.Append("  AdditionalHandlingFee: ").Append(AdditionalHandlingFee).Append("\n");
      sb.Append("  AdditionalShippingFee: ").Append(AdditionalShippingFee).Append("\n");
      sb.Append("  Attributes: ").Append(Attributes).Append("\n");
      sb.Append("  AuditInfo: ").Append(AuditInfo).Append("\n");
      sb.Append("  CanceledItems: ").Append(CanceledItems).Append("\n");
      sb.Append("  ChangeMessages: ").Append(ChangeMessages).Append("\n");
      sb.Append("  ChildShipmentNumbers: ").Append(ChildShipmentNumbers).Append("\n");
      sb.Append("  Cost: ").Append(Cost).Append("\n");
      sb.Append("  CreateDate: ").Append(CreateDate).Append("\n");
      sb.Append("  CurrencyCode: ").Append(CurrencyCode).Append("\n");
      sb.Append("  CustomerAddressId: ").Append(CustomerAddressId).Append("\n");
      sb.Append("  CustomerId: ").Append(CustomerId).Append("\n");
      sb.Append("  DestinationContact: ").Append(DestinationContact).Append("\n");
      sb.Append("  ExternalShipmentId: ").Append(ExternalShipmentId).Append("\n");
      sb.Append("  FulfillmentDate: ").Append(FulfillmentDate).Append("\n");
      sb.Append("  ItemHandlingFee: ").Append(ItemHandlingFee).Append("\n");
      sb.Append("  ItemShippingFee: ").Append(ItemShippingFee).Append("\n");
      sb.Append("  Items: ").Append(Items).Append("\n");
      sb.Append("  LocationCode: ").Append(LocationCode).Append("\n");
      sb.Append("  OrderId: ").Append(OrderId).Append("\n");
      sb.Append("  OrderNumber: ").Append(OrderNumber).Append("\n");
      sb.Append("  OrderSubmitDate: ").Append(OrderSubmitDate).Append("\n");
      sb.Append("  OriginContact: ").Append(OriginContact).Append("\n");
      sb.Append("  OriginalOrderId: ").Append(OriginalOrderId).Append("\n");
      sb.Append("  OriginalShipmentNumber: ").Append(OriginalShipmentNumber).Append("\n");
      sb.Append("  Packages: ").Append(Packages).Append("\n");
      sb.Append("  ParentShipmentNumber: ").Append(ParentShipmentNumber).Append("\n");
      sb.Append("  PickStatus: ").Append(PickStatus).Append("\n");
      sb.Append("  PickType: ").Append(PickType).Append("\n");
      sb.Append("  ShipDate: ").Append(ShipDate).Append("\n");
      sb.Append("  ShipmentId: ").Append(ShipmentId).Append("\n");
      sb.Append("  ShipmentNumber: ").Append(ShipmentNumber).Append("\n");
      sb.Append("  ShipmentStatus: ").Append(ShipmentStatus).Append("\n");
      sb.Append("  ShipmentType: ").Append(ShipmentType).Append("\n");
      sb.Append("  ShippingMethodCode: ").Append(ShippingMethodCode).Append("\n");
      sb.Append("  SignatureRequired: ").Append(SignatureRequired).Append("\n");
      sb.Append("  SiteId: ").Append(SiteId).Append("\n");
      sb.Append("  TaxRateItem: ").Append(TaxRateItem).Append("\n");
      sb.Append("  TaxRateShippingFee: ").Append(TaxRateShippingFee).Append("\n");
      sb.Append("  TaxTotalHandlingFee: ").Append(TaxTotalHandlingFee).Append("\n");
      sb.Append("  TaxTotalItem: ").Append(TaxTotalItem).Append("\n");
      sb.Append("  TaxTotalShippingFee: ").Append(TaxTotalShippingFee).Append("\n");
      sb.Append("  TenantId: ").Append(TenantId).Append("\n");
      sb.Append("  TotalHandlingFee: ").Append(TotalHandlingFee).Append("\n");
      sb.Append("  TotalItem: ").Append(TotalItem).Append("\n");
      sb.Append("  TotalItemDiscount: ").Append(TotalItemDiscount).Append("\n");
      sb.Append("  TotalItemDiscountTax: ").Append(TotalItemDiscountTax).Append("\n");
      sb.Append("  TotalShipment: ").Append(TotalShipment).Append("\n");
      sb.Append("  TotalShippingFee: ").Append(TotalShippingFee).Append("\n");
      sb.Append("  TotalTax: ").Append(TotalTax).Append("\n");
      sb.Append("  TrackingNumbers: ").Append(TrackingNumbers).Append("\n");
      sb.Append("  UpdateDate: ").Append(UpdateDate).Append("\n");
      sb.Append("  WorkflowState: ").Append(WorkflowState).Append("\n");
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
