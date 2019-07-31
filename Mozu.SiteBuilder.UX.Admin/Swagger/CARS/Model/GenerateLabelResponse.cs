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
  public class GenerateLabelResponse {
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
      sb.Append("class GenerateLabelResponse {\n");
      sb.Append("  ImageURL: ").Append(ImageURL).Append("\n");
      sb.Append("  Price: ").Append(Price).Append("\n");
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
