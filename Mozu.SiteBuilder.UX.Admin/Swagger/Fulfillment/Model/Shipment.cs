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
  public class Shipment {
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
    /// Gets or Sets CustomerAccountId
    /// </summary>
    [DataMember(Name="customerAccountId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "customerAccountId")]
    public int? CustomerAccountId { get; set; }

    /// <summary>
    /// Gets or Sets CustomerAddressId
    /// </summary>
    [DataMember(Name="customerAddressId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "customerAddressId")]
    public int? CustomerAddressId { get; set; }

    /// <summary>
    /// Gets or Sets CustomerTaxId
    /// </summary>
    [DataMember(Name="customerTaxId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "customerTaxId")]
    public string CustomerTaxId { get; set; }

    /// <summary>
    /// Gets or Sets Data
    /// </summary>
    [DataMember(Name="data", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "data")]
    public Object Data { get; set; }

    /// <summary>
    /// Gets or Sets DestinationContact
    /// </summary>
    [DataMember(Name="destinationContact", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "destinationContact")]
    public Contact DestinationContact { get; set; }

    /// <summary>
    /// Gets or Sets DutyAdjustment
    /// </summary>
    [DataMember(Name="dutyAdjustment", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "dutyAdjustment")]
    public decimal DutyAdjustment { get; set; }

    /// <summary>
    /// Gets or Sets DutyTotal
    /// </summary>
    [DataMember(Name="dutyTotal", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "dutyTotal")]
    public decimal DutyTotal { get; set; }

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
    /// Gets or Sets FulfillmentStatus
    /// </summary>
    [DataMember(Name="fulfillmentStatus", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "fulfillmentStatus")]
    public string FulfillmentStatus { get; set; }

    /// <summary>
    /// Gets or Sets HandlingAdjustment
    /// </summary>
    [DataMember(Name="handlingAdjustment", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "handlingAdjustment")]
    public decimal HandlingAdjustment { get; set; }

    /// <summary>
    /// Gets or Sets HandlingSubtotal
    /// </summary>
    [DataMember(Name="handlingSubtotal", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "handlingSubtotal")]
    public decimal HandlingSubtotal { get; set; }

    /// <summary>
    /// Gets or Sets HandlingTaxAdjustment
    /// </summary>
    [DataMember(Name="handlingTaxAdjustment", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "handlingTaxAdjustment")]
    public decimal HandlingTaxAdjustment { get; set; }

    /// <summary>
    /// Gets or Sets HandlingTaxTotal
    /// </summary>
    [DataMember(Name="handlingTaxTotal", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "handlingTaxTotal")]
    public decimal HandlingTaxTotal { get; set; }

    /// <summary>
    /// Gets or Sets HandlingTotal
    /// </summary>
    [DataMember(Name="handlingTotal", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "handlingTotal")]
    public decimal HandlingTotal { get; set; }

    /// <summary>
    /// Gets or Sets Items
    /// </summary>
    [DataMember(Name="items", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "items")]
    public List<Item> Items { get; set; }

    /// <summary>
    /// Gets or Sets LineItemSubtotal
    /// </summary>
    [DataMember(Name="lineItemSubtotal", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "lineItemSubtotal")]
    public decimal LineItemSubtotal { get; set; }

    /// <summary>
    /// Gets or Sets LineItemTaxAdjustment
    /// </summary>
    [DataMember(Name="lineItemTaxAdjustment", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "lineItemTaxAdjustment")]
    public decimal LineItemTaxAdjustment { get; set; }

    /// <summary>
    /// Gets or Sets LineItemTaxTotal
    /// </summary>
    [DataMember(Name="lineItemTaxTotal", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "lineItemTaxTotal")]
    public decimal LineItemTaxTotal { get; set; }

    /// <summary>
    /// Gets or Sets LineItemTotal
    /// </summary>
    [DataMember(Name="lineItemTotal", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "lineItemTotal")]
    public decimal LineItemTotal { get; set; }

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
    /// Gets or Sets ShipmentAdjustment
    /// </summary>
    [DataMember(Name="shipmentAdjustment", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shipmentAdjustment")]
    public decimal ShipmentAdjustment { get; set; }

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
    /// Gets or Sets ShippingAdjustment
    /// </summary>
    [DataMember(Name="shippingAdjustment", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shippingAdjustment")]
    public decimal ShippingAdjustment { get; set; }

    /// <summary>
    /// Gets or Sets ShippingMethodCode
    /// </summary>
    [DataMember(Name="shippingMethodCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shippingMethodCode")]
    public string ShippingMethodCode { get; set; }

    /// <summary>
    /// Gets or Sets ShippingMethodName
    /// </summary>
    [DataMember(Name="shippingMethodName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shippingMethodName")]
    public string ShippingMethodName { get; set; }

    /// <summary>
    /// Gets or Sets ShippingSubtotal
    /// </summary>
    [DataMember(Name="shippingSubtotal", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shippingSubtotal")]
    public decimal ShippingSubtotal { get; set; }

    /// <summary>
    /// Gets or Sets ShippingTaxAdjustment
    /// </summary>
    [DataMember(Name="shippingTaxAdjustment", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shippingTaxAdjustment")]
    public decimal ShippingTaxAdjustment { get; set; }

    /// <summary>
    /// Gets or Sets ShippingTaxTotal
    /// </summary>
    [DataMember(Name="shippingTaxTotal", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shippingTaxTotal")]
    public decimal ShippingTaxTotal { get; set; }

    /// <summary>
    /// Gets or Sets ShippingTotal
    /// </summary>
    [DataMember(Name="shippingTotal", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shippingTotal")]
    public decimal ShippingTotal { get; set; }

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
    /// Gets or Sets TaxData
    /// </summary>
    [DataMember(Name="taxData", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "taxData")]
    public Object TaxData { get; set; }

    /// <summary>
    /// Gets or Sets TenantId
    /// </summary>
    [DataMember(Name="tenantId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "tenantId")]
    public int? TenantId { get; set; }

    /// <summary>
    /// Gets or Sets Total
    /// </summary>
    [DataMember(Name="total", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "total")]
    public decimal Total { get; set; }

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
      sb.Append("  Attributes: ").Append(Attributes).Append("\n");
      sb.Append("  AuditInfo: ").Append(AuditInfo).Append("\n");
      sb.Append("  CanceledItems: ").Append(CanceledItems).Append("\n");
      sb.Append("  ChangeMessages: ").Append(ChangeMessages).Append("\n");
      sb.Append("  ChildShipmentNumbers: ").Append(ChildShipmentNumbers).Append("\n");
      sb.Append("  Cost: ").Append(Cost).Append("\n");
      sb.Append("  CreateDate: ").Append(CreateDate).Append("\n");
      sb.Append("  CurrencyCode: ").Append(CurrencyCode).Append("\n");
      sb.Append("  CustomerAccountId: ").Append(CustomerAccountId).Append("\n");
      sb.Append("  CustomerAddressId: ").Append(CustomerAddressId).Append("\n");
      sb.Append("  CustomerTaxId: ").Append(CustomerTaxId).Append("\n");
      sb.Append("  Data: ").Append(Data).Append("\n");
      sb.Append("  DestinationContact: ").Append(DestinationContact).Append("\n");
      sb.Append("  DutyAdjustment: ").Append(DutyAdjustment).Append("\n");
      sb.Append("  DutyTotal: ").Append(DutyTotal).Append("\n");
      sb.Append("  ExternalShipmentId: ").Append(ExternalShipmentId).Append("\n");
      sb.Append("  FulfillmentDate: ").Append(FulfillmentDate).Append("\n");
      sb.Append("  FulfillmentStatus: ").Append(FulfillmentStatus).Append("\n");
      sb.Append("  HandlingAdjustment: ").Append(HandlingAdjustment).Append("\n");
      sb.Append("  HandlingSubtotal: ").Append(HandlingSubtotal).Append("\n");
      sb.Append("  HandlingTaxAdjustment: ").Append(HandlingTaxAdjustment).Append("\n");
      sb.Append("  HandlingTaxTotal: ").Append(HandlingTaxTotal).Append("\n");
      sb.Append("  HandlingTotal: ").Append(HandlingTotal).Append("\n");
      sb.Append("  Items: ").Append(Items).Append("\n");
      sb.Append("  LineItemSubtotal: ").Append(LineItemSubtotal).Append("\n");
      sb.Append("  LineItemTaxAdjustment: ").Append(LineItemTaxAdjustment).Append("\n");
      sb.Append("  LineItemTaxTotal: ").Append(LineItemTaxTotal).Append("\n");
      sb.Append("  LineItemTotal: ").Append(LineItemTotal).Append("\n");
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
      sb.Append("  ShipmentAdjustment: ").Append(ShipmentAdjustment).Append("\n");
      sb.Append("  ShipmentNumber: ").Append(ShipmentNumber).Append("\n");
      sb.Append("  ShipmentStatus: ").Append(ShipmentStatus).Append("\n");
      sb.Append("  ShipmentType: ").Append(ShipmentType).Append("\n");
      sb.Append("  ShippingAdjustment: ").Append(ShippingAdjustment).Append("\n");
      sb.Append("  ShippingMethodCode: ").Append(ShippingMethodCode).Append("\n");
      sb.Append("  ShippingMethodName: ").Append(ShippingMethodName).Append("\n");
      sb.Append("  ShippingSubtotal: ").Append(ShippingSubtotal).Append("\n");
      sb.Append("  ShippingTaxAdjustment: ").Append(ShippingTaxAdjustment).Append("\n");
      sb.Append("  ShippingTaxTotal: ").Append(ShippingTaxTotal).Append("\n");
      sb.Append("  ShippingTotal: ").Append(ShippingTotal).Append("\n");
      sb.Append("  SignatureRequired: ").Append(SignatureRequired).Append("\n");
      sb.Append("  SiteId: ").Append(SiteId).Append("\n");
      sb.Append("  TaxData: ").Append(TaxData).Append("\n");
      sb.Append("  TenantId: ").Append(TenantId).Append("\n");
      sb.Append("  Total: ").Append(Total).Append("\n");
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
