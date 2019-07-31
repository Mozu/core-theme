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
  public class Rate {
    /// <summary>
    /// Gets or Sets Carrier
    /// </summary>
    [DataMember(Name="carrier", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "carrier")]
    public string Carrier { get; set; }

    /// <summary>
    /// Gets or Sets Currency
    /// </summary>
    [DataMember(Name="currency", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "currency")]
    public string Currency { get; set; }

    /// <summary>
    /// Gets or Sets ExpectedDelivery
    /// </summary>
    [DataMember(Name="expectedDelivery", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "expectedDelivery")]
    public DateTime? ExpectedDelivery { get; set; }

    /// <summary>
    /// Gets or Sets Failure
    /// </summary>
    [DataMember(Name="failure", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "failure")]
    public string Failure { get; set; }

    /// <summary>
    /// Gets or Sets NoFasterThan
    /// </summary>
    [DataMember(Name="noFasterThan", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "noFasterThan")]
    public string NoFasterThan { get; set; }

    /// <summary>
    /// Gets or Sets Price
    /// </summary>
    [DataMember(Name="price", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "price")]
    public decimal Price { get; set; }

    /// <summary>
    /// Gets or Sets ServiceType
    /// </summary>
    [DataMember(Name="serviceType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "serviceType")]
    public string ServiceType { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class Rate {\n");
      sb.Append("  Carrier: ").Append(Carrier).Append("\n");
      sb.Append("  Currency: ").Append(Currency).Append("\n");
      sb.Append("  ExpectedDelivery: ").Append(ExpectedDelivery).Append("\n");
      sb.Append("  Failure: ").Append(Failure).Append("\n");
      sb.Append("  NoFasterThan: ").Append(NoFasterThan).Append("\n");
      sb.Append("  Price: ").Append(Price).Append("\n");
      sb.Append("  ServiceType: ").Append(ServiceType).Append("\n");
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
