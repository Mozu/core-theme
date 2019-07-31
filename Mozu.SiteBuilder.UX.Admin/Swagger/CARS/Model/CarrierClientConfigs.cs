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
  public class CarrierClientConfigs {
    /// <summary>
    /// Gets or Sets Configs
    /// </summary>
    [DataMember(Name="configs", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "configs")]
    public Dictionary<string, string> Configs { get; set; }

    /// <summary>
    /// Gets or Sets Headers
    /// </summary>
    [DataMember(Name="headers", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "headers")]
    public Dictionary<string, string> Headers { get; set; }

    /// <summary>
    /// Gets or Sets HttpMethod
    /// </summary>
    [DataMember(Name="httpMethod", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "httpMethod")]
    public string HttpMethod { get; set; }

    /// <summary>
    /// Gets or Sets OutputType
    /// </summary>
    [DataMember(Name="outputType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "outputType")]
    public string OutputType { get; set; }

    /// <summary>
    /// Gets or Sets SchemaIdentifierID
    /// </summary>
    [DataMember(Name="schemaIdentifierID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "schemaIdentifierID")]
    public long? SchemaIdentifierID { get; set; }

    /// <summary>
    /// Gets or Sets Transformers
    /// </summary>
    [DataMember(Name="transformers", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "transformers")]
    public AllTextTransformers Transformers { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class CarrierClientConfigs {\n");
      sb.Append("  Configs: ").Append(Configs).Append("\n");
      sb.Append("  Headers: ").Append(Headers).Append("\n");
      sb.Append("  HttpMethod: ").Append(HttpMethod).Append("\n");
      sb.Append("  OutputType: ").Append(OutputType).Append("\n");
      sb.Append("  SchemaIdentifierID: ").Append(SchemaIdentifierID).Append("\n");
      sb.Append("  Transformers: ").Append(Transformers).Append("\n");
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
