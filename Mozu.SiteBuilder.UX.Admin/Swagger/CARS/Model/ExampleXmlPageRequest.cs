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
  public class ExampleXmlPageRequest {
    /// <summary>
    /// Gets or Sets Carrier
    /// </summary>
    [DataMember(Name="carrier", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "carrier")]
    public string Carrier { get; set; }

    /// <summary>
    /// Gets or Sets ExampleCARSRequest
    /// </summary>
    [DataMember(Name="exampleCARSRequest", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "exampleCARSRequest")]
    public string ExampleCARSRequest { get; set; }

    /// <summary>
    /// Gets or Sets ExampleGeneratedXml
    /// </summary>
    [DataMember(Name="exampleGeneratedXml", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "exampleGeneratedXml")]
    public string ExampleGeneratedXml { get; set; }

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
    /// Gets or Sets ServiceResponse
    /// </summary>
    [DataMember(Name="serviceResponse", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "serviceResponse")]
    public string ServiceResponse { get; set; }

    /// <summary>
    /// Gets or Sets TenantID
    /// </summary>
    [DataMember(Name="tenantID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "tenantID")]
    public int? TenantID { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class ExampleXmlPageRequest {\n");
      sb.Append("  Carrier: ").Append(Carrier).Append("\n");
      sb.Append("  ExampleCARSRequest: ").Append(ExampleCARSRequest).Append("\n");
      sb.Append("  ExampleGeneratedXml: ").Append(ExampleGeneratedXml).Append("\n");
      sb.Append("  LocationCode: ").Append(LocationCode).Append("\n");
      sb.Append("  OperationType: ").Append(OperationType).Append("\n");
      sb.Append("  ServiceResponse: ").Append(ServiceResponse).Append("\n");
      sb.Append("  TenantID: ").Append(TenantID).Append("\n");
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
