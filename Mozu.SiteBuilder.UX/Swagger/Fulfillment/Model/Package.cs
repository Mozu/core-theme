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
  public class Package {
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
    /// Gets or Sets AvailableActions
    /// </summary>
    [DataMember(Name="availableActions", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "availableActions")]
    public List<string> AvailableActions { get; set; }

    /// <summary>
    /// Gets or Sets ChangeMessages
    /// </summary>
    [DataMember(Name="changeMessages", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "changeMessages")]
    public List<ChangeMessage> ChangeMessages { get; set; }

    /// <summary>
    /// Gets or Sets Code
    /// </summary>
    [DataMember(Name="code", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "code")]
    public string Code { get; set; }

    /// <summary>
    /// Gets or Sets FulfillmentDate
    /// </summary>
    [DataMember(Name="fulfillmentDate", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "fulfillmentDate")]
    public DateTime? FulfillmentDate { get; set; }

    /// <summary>
    /// Gets or Sets HasLabel
    /// </summary>
    [DataMember(Name="hasLabel", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "hasLabel")]
    public bool? HasLabel { get; set; }

    /// <summary>
    /// Gets or Sets Items
    /// </summary>
    [DataMember(Name="items", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "items")]
    public List<PackageItem> Items { get; set; }

    /// <summary>
    /// Gets or Sets LabelUri
    /// </summary>
    [DataMember(Name="labelUri", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "labelUri")]
    public string LabelUri { get; set; }

    /// <summary>
    /// Gets or Sets Measurements
    /// </summary>
    [DataMember(Name="measurements", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "measurements")]
    public PackageMeasurements Measurements { get; set; }

    /// <summary>
    /// Gets or Sets PackageId
    /// </summary>
    [DataMember(Name="packageId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "packageId")]
    public string PackageId { get; set; }

    /// <summary>
    /// Gets or Sets PackagingType
    /// </summary>
    [DataMember(Name="packagingType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "packagingType")]
    public string PackagingType { get; set; }

    /// <summary>
    /// Gets or Sets ShipmentId
    /// </summary>
    [DataMember(Name="shipmentId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shipmentId")]
    public string ShipmentId { get; set; }

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
    /// Gets or Sets Status
    /// </summary>
    [DataMember(Name="status", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "status")]
    public string Status { get; set; }

    /// <summary>
    /// Gets or Sets TrackingNumbers
    /// </summary>
    [DataMember(Name="trackingNumbers", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "trackingNumbers")]
    public List<string> TrackingNumbers { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class Package {\n");
      sb.Append("  Attributes: ").Append(Attributes).Append("\n");
      sb.Append("  AuditInfo: ").Append(AuditInfo).Append("\n");
      sb.Append("  AvailableActions: ").Append(AvailableActions).Append("\n");
      sb.Append("  ChangeMessages: ").Append(ChangeMessages).Append("\n");
      sb.Append("  Code: ").Append(Code).Append("\n");
      sb.Append("  FulfillmentDate: ").Append(FulfillmentDate).Append("\n");
      sb.Append("  HasLabel: ").Append(HasLabel).Append("\n");
      sb.Append("  Items: ").Append(Items).Append("\n");
      sb.Append("  LabelUri: ").Append(LabelUri).Append("\n");
      sb.Append("  Measurements: ").Append(Measurements).Append("\n");
      sb.Append("  PackageId: ").Append(PackageId).Append("\n");
      sb.Append("  PackagingType: ").Append(PackagingType).Append("\n");
      sb.Append("  ShipmentId: ").Append(ShipmentId).Append("\n");
      sb.Append("  ShippingMethodCode: ").Append(ShippingMethodCode).Append("\n");
      sb.Append("  ShippingMethodName: ").Append(ShippingMethodName).Append("\n");
      sb.Append("  Status: ").Append(Status).Append("\n");
      sb.Append("  TrackingNumbers: ").Append(TrackingNumbers).Append("\n");
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
