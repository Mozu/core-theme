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
  public class EndiciaChangePassPhraseRequest {
    /// <summary>
    /// Gets or Sets Carrier
    /// </summary>
    [DataMember(Name="carrier", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "carrier")]
    public string Carrier { get; set; }

    /// <summary>
    /// Gets or Sets LocationCode
    /// </summary>
    [DataMember(Name="locationCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationCode")]
    public string LocationCode { get; set; }

    /// <summary>
    /// Gets or Sets NewPassPhrase
    /// </summary>
    [DataMember(Name="newPassPhrase", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "newPassPhrase")]
    public string NewPassPhrase { get; set; }

    /// <summary>
    /// Gets or Sets OldPassPhrase
    /// </summary>
    [DataMember(Name="oldPassPhrase", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "oldPassPhrase")]
    public string OldPassPhrase { get; set; }

    /// <summary>
    /// Gets or Sets OnlyUpdateInDB
    /// </summary>
    [DataMember(Name="onlyUpdateInDB", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "onlyUpdateInDB")]
    public bool? OnlyUpdateInDB { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class EndiciaChangePassPhraseRequest {\n");
      sb.Append("  Carrier: ").Append(Carrier).Append("\n");
      sb.Append("  LocationCode: ").Append(LocationCode).Append("\n");
      sb.Append("  NewPassPhrase: ").Append(NewPassPhrase).Append("\n");
      sb.Append("  OldPassPhrase: ").Append(OldPassPhrase).Append("\n");
      sb.Append("  OnlyUpdateInDB: ").Append(OnlyUpdateInDB).Append("\n");
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
