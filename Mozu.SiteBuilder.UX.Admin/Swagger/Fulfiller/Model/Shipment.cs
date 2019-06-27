using System;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Swagger.Fulfiller.Model {

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
    /// Gets or Sets DestinationContact
    /// </summary>
    [DataMember(Name="destinationContact", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "destinationContact")]
    public Contact DestinationContact { get; set; }

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
    /// Gets or Sets Packages
    /// </summary>
    [DataMember(Name="packages", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "packages")]
    public List<Package> Packages { get; set; }

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
    /// Gets or Sets TenantId
    /// </summary>
    [DataMember(Name="tenantId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "tenantId")]
    public int? TenantId { get; set; }

    /// <summary>
    /// Gets or Sets TrackingNumber
    /// </summary>
    [DataMember(Name="trackingNumber", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "trackingNumber")]
    public string TrackingNumber { get; set; }

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
      sb.Append("  CanceledItems: ").Append(CanceledItems).Append("\n");
      sb.Append("  ChangeMessages: ").Append(ChangeMessages).Append("\n");
      sb.Append("  Cost: ").Append(Cost).Append("\n");
      sb.Append("  CreateDate: ").Append(CreateDate).Append("\n");
      sb.Append("  CurrencyCode: ").Append(CurrencyCode).Append("\n");
      sb.Append("  DestinationContact: ").Append(DestinationContact).Append("\n");
      sb.Append("  Items: ").Append(Items).Append("\n");
      sb.Append("  LocationCode: ").Append(LocationCode).Append("\n");
      sb.Append("  OrderId: ").Append(OrderId).Append("\n");
      sb.Append("  OrderNumber: ").Append(OrderNumber).Append("\n");
      sb.Append("  OriginContact: ").Append(OriginContact).Append("\n");
      sb.Append("  OriginalOrderId: ").Append(OriginalOrderId).Append("\n");
      sb.Append("  Packages: ").Append(Packages).Append("\n");
      sb.Append("  ShipmentId: ").Append(ShipmentId).Append("\n");
      sb.Append("  ShipmentNumber: ").Append(ShipmentNumber).Append("\n");
      sb.Append("  ShipmentStatus: ").Append(ShipmentStatus).Append("\n");
      sb.Append("  ShipmentType: ").Append(ShipmentType).Append("\n");
      sb.Append("  ShippingMethodCode: ").Append(ShippingMethodCode).Append("\n");
      sb.Append("  SignatureRequired: ").Append(SignatureRequired).Append("\n");
      sb.Append("  SiteId: ").Append(SiteId).Append("\n");
      sb.Append("  TenantId: ").Append(TenantId).Append("\n");
      sb.Append("  TrackingNumber: ").Append(TrackingNumber).Append("\n");
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
