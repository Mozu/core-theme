using System;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.CARS.Contracts.Model {

  /// <summary>
  /// 
  /// </summary>
  [DataContract]
  public class GenerateLabelRequest {
    /// <summary>
    /// Gets or Sets Carrier
    /// </summary>
    [DataMember(Name="carrier", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "carrier")]
    public string Carrier { get; set; }

    /// <summary>
    /// Gets or Sets CarrierForAggregator
    /// </summary>
    [DataMember(Name="carrierForAggregator", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "carrierForAggregator")]
    public string CarrierForAggregator { get; set; }

    /// <summary>
    /// Gets or Sets CarrierSpecificServices
    /// </summary>
    [DataMember(Name="carrierSpecificServices", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "carrierSpecificServices")]
    public List<string> CarrierSpecificServices { get; set; }

    /// <summary>
    /// Gets or Sets Currency
    /// </summary>
    [DataMember(Name="currency", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "currency")]
    public string Currency { get; set; }

    /// <summary>
    /// Gets or Sets CustomerReferences
    /// </summary>
    [DataMember(Name="customerReferences", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "customerReferences")]
    public Dictionary<string, string> CustomerReferences { get; set; }

    /// <summary>
    /// Gets or Sets Description
    /// </summary>
    [DataMember(Name="description", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "description")]
    public string Description { get; set; }

    /// <summary>
    /// Gets or Sets FromContact
    /// </summary>
    [DataMember(Name="fromContact", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "fromContact")]
    public Contact FromContact { get; set; }

    /// <summary>
    /// Gets or Sets LabelFormat
    /// </summary>
    [DataMember(Name="labelFormat", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "labelFormat")]
    public string LabelFormat { get; set; }

    /// <summary>
    /// Gets or Sets LocationCode
    /// </summary>
    [DataMember(Name="locationCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationCode")]
    public string LocationCode { get; set; }

    /// <summary>
    /// Gets or Sets OperationType
    /// </summary>
    [DataMember(Name="operationType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "operationType")]
    public string OperationType { get; set; }

    /// <summary>
    /// Gets or Sets OrderID
    /// </summary>
    [DataMember(Name="orderID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "orderID")]
    public string OrderID { get; set; }

    /// <summary>
    /// Gets or Sets PackageHeight
    /// </summary>
    [DataMember(Name="packageHeight", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "packageHeight")]
    public decimal PackageHeight { get; set; }

    /// <summary>
    /// Gets or Sets PackageLength
    /// </summary>
    [DataMember(Name="packageLength", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "packageLength")]
    public decimal PackageLength { get; set; }

    /// <summary>
    /// Gets or Sets PackageWeight
    /// </summary>
    [DataMember(Name="packageWeight", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "packageWeight")]
    public decimal PackageWeight { get; set; }

    /// <summary>
    /// Gets or Sets PackageWidth
    /// </summary>
    [DataMember(Name="packageWidth", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "packageWidth")]
    public decimal PackageWidth { get; set; }

    /// <summary>
    /// Gets or Sets PackagingType
    /// </summary>
    [DataMember(Name="packagingType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "packagingType")]
    public string PackagingType { get; set; }

    /// <summary>
    /// Gets or Sets Price
    /// </summary>
    [DataMember(Name="price", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "price")]
    public decimal Price { get; set; }

    /// <summary>
    /// Gets or Sets ReturnContact
    /// </summary>
    [DataMember(Name="returnContact", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "returnContact")]
    public Contact ReturnContact { get; set; }

    /// <summary>
    /// Gets or Sets ReturnShipment
    /// </summary>
    [DataMember(Name="returnShipment", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "returnShipment")]
    public bool? ReturnShipment { get; set; }

    /// <summary>
    /// Gets or Sets ServiceType
    /// </summary>
    [DataMember(Name="serviceType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "serviceType")]
    public string ServiceType { get; set; }

    /// <summary>
    /// Gets or Sets ShipmentID
    /// </summary>
    [DataMember(Name="shipmentID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shipmentID")]
    public string ShipmentID { get; set; }

    /// <summary>
    /// Gets or Sets Test
    /// </summary>
    [DataMember(Name="test", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "test")]
    public bool? Test { get; set; }

    /// <summary>
    /// Gets or Sets ToContact
    /// </summary>
    [DataMember(Name="toContact", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "toContact")]
    public Contact ToContact { get; set; }

    /// <summary>
    /// Gets or Sets UnitType
    /// </summary>
    [DataMember(Name="unitType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "unitType")]
    public string UnitType { get; set; }

    /// <summary>
    /// Gets or Sets ValidateAddress
    /// </summary>
    [DataMember(Name="validateAddress", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "validateAddress")]
    public bool? ValidateAddress { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class GenerateLabelRequest {\n");
      sb.Append("  Carrier: ").Append(Carrier).Append("\n");
      sb.Append("  CarrierForAggregator: ").Append(CarrierForAggregator).Append("\n");
      sb.Append("  CarrierSpecificServices: ").Append(CarrierSpecificServices).Append("\n");
      sb.Append("  Currency: ").Append(Currency).Append("\n");
      sb.Append("  CustomerReferences: ").Append(CustomerReferences).Append("\n");
      sb.Append("  Description: ").Append(Description).Append("\n");
      sb.Append("  FromContact: ").Append(FromContact).Append("\n");
      sb.Append("  LabelFormat: ").Append(LabelFormat).Append("\n");
      sb.Append("  LocationCode: ").Append(LocationCode).Append("\n");
      sb.Append("  OperationType: ").Append(OperationType).Append("\n");
      sb.Append("  OrderID: ").Append(OrderID).Append("\n");
      sb.Append("  PackageHeight: ").Append(PackageHeight).Append("\n");
      sb.Append("  PackageLength: ").Append(PackageLength).Append("\n");
      sb.Append("  PackageWeight: ").Append(PackageWeight).Append("\n");
      sb.Append("  PackageWidth: ").Append(PackageWidth).Append("\n");
      sb.Append("  PackagingType: ").Append(PackagingType).Append("\n");
      sb.Append("  Price: ").Append(Price).Append("\n");
      sb.Append("  ReturnContact: ").Append(ReturnContact).Append("\n");
      sb.Append("  ReturnShipment: ").Append(ReturnShipment).Append("\n");
      sb.Append("  ServiceType: ").Append(ServiceType).Append("\n");
      sb.Append("  ShipmentID: ").Append(ShipmentID).Append("\n");
      sb.Append("  Test: ").Append(Test).Append("\n");
      sb.Append("  ToContact: ").Append(ToContact).Append("\n");
      sb.Append("  UnitType: ").Append(UnitType).Append("\n");
      sb.Append("  ValidateAddress: ").Append(ValidateAddress).Append("\n");
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
