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
  public class GenerateLabelAggregateResponse {
    /// <summary>
    /// Gets or Sets Carrier
    /// </summary>
    [DataMember(Name="carrier", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "carrier")]
    public string Carrier { get; set; }

    /// <summary>
    /// Gets or Sets ImageURL
    /// </summary>
    [DataMember(Name="imageURL", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "imageURL")]
    public string ImageURL { get; set; }

    /// <summary>
    /// Gets or Sets Price
    /// </summary>
    [DataMember(Name="price", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "price")]
    public decimal Price { get; set; }

    /// <summary>
    /// Gets or Sets Rates
    /// </summary>
    [DataMember(Name="rates", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "rates")]
    public List<Rate> Rates { get; set; }

    /// <summary>
    /// Gets or Sets ServiceType
    /// </summary>
    [DataMember(Name="serviceType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "serviceType")]
    public string ServiceType { get; set; }

    /// <summary>
    /// Gets or Sets TrackingNumber
    /// </summary>
    [DataMember(Name="trackingNumber", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "trackingNumber")]
    public string TrackingNumber { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class GenerateLabelAggregateResponse {\n");
      sb.Append("  Carrier: ").Append(Carrier).Append("\n");
      sb.Append("  ImageURL: ").Append(ImageURL).Append("\n");
      sb.Append("  Price: ").Append(Price).Append("\n");
      sb.Append("  Rates: ").Append(Rates).Append("\n");
      sb.Append("  ServiceType: ").Append(ServiceType).Append("\n");
      sb.Append("  TrackingNumber: ").Append(TrackingNumber).Append("\n");
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
