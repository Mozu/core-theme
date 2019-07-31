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
  public class GetRateRequest {
    /// <summary>
    /// Gets or Sets Aggregator
    /// </summary>
    [DataMember(Name="aggregator", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "aggregator")]
    public bool? Aggregator { get; set; }

    /// <summary>
    /// Gets or Sets Carrier
    /// </summary>
    [DataMember(Name="carrier", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "carrier")]
    public string Carrier { get; set; }

    /// <summary>
    /// Gets or Sets CustomerPromiseDate
    /// </summary>
    [DataMember(Name="customerPromiseDate", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "customerPromiseDate")]
    public DateTime? CustomerPromiseDate { get; set; }

    /// <summary>
    /// Gets or Sets DummyDimensions
    /// </summary>
    [DataMember(Name="dummyDimensions", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "dummyDimensions")]
    public bool? DummyDimensions { get; set; }

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
    /// Gets or Sets PackagingTypes
    /// </summary>
    [DataMember(Name="packagingTypes", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "packagingTypes")]
    public Dictionary<string, string> PackagingTypes { get; set; }

    /// <summary>
    /// Gets or Sets ServiceTypes
    /// </summary>
    [DataMember(Name="serviceTypes", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "serviceTypes")]
    public Dictionary<string, List<string>> ServiceTypes { get; set; }

    /// <summary>
    /// Gets or Sets Shipment
    /// </summary>
    [DataMember(Name="shipment", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shipment")]
    public ShippingRequest Shipment { get; set; }

    /// <summary>
    /// Gets or Sets SortBy
    /// </summary>
    [DataMember(Name="sortBy", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "sortBy")]
    public string SortBy { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class GetRateRequest {\n");
      sb.Append("  Aggregator: ").Append(Aggregator).Append("\n");
      sb.Append("  Carrier: ").Append(Carrier).Append("\n");
      sb.Append("  CustomerPromiseDate: ").Append(CustomerPromiseDate).Append("\n");
      sb.Append("  DummyDimensions: ").Append(DummyDimensions).Append("\n");
      sb.Append("  LocationCode: ").Append(LocationCode).Append("\n");
      sb.Append("  OperationType: ").Append(OperationType).Append("\n");
      sb.Append("  PackagingTypes: ").Append(PackagingTypes).Append("\n");
      sb.Append("  ServiceTypes: ").Append(ServiceTypes).Append("\n");
      sb.Append("  Shipment: ").Append(Shipment).Append("\n");
      sb.Append("  SortBy: ").Append(SortBy).Append("\n");
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
