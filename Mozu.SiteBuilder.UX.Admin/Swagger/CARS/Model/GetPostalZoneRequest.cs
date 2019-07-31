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
  public class GetPostalZoneRequest {
    /// <summary>
    /// Gets or Sets Carrier
    /// </summary>
    [DataMember(Name="carrier", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "carrier")]
    public string Carrier { get; set; }

    /// <summary>
    /// Gets or Sets FromZipCodes
    /// </summary>
    [DataMember(Name="fromZipCodes", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "fromZipCodes")]
    public List<string> FromZipCodes { get; set; }

    /// <summary>
    /// Gets or Sets Locale
    /// </summary>
    [DataMember(Name="locale", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locale")]
    public string Locale { get; set; }

    /// <summary>
    /// Gets or Sets ToZipCode
    /// </summary>
    [DataMember(Name="toZipCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "toZipCode")]
    public string ToZipCode { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class GetPostalZoneRequest {\n");
      sb.Append("  Carrier: ").Append(Carrier).Append("\n");
      sb.Append("  FromZipCodes: ").Append(FromZipCodes).Append("\n");
      sb.Append("  Locale: ").Append(Locale).Append("\n");
      sb.Append("  ToZipCode: ").Append(ToZipCode).Append("\n");
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
