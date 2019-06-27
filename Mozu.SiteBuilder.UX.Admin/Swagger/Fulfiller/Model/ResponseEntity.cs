using System;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Swagger.Fulfiller.Model {

  /// <summary>
  /// 
  /// </summary>
  [DataContract]
  public class ResponseEntity {
    /// <summary>
    /// Gets or Sets Body
    /// </summary>
    [DataMember(Name="body", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "body")]
    public Object Body { get; set; }

    /// <summary>
    /// Gets or Sets StatusCode
    /// </summary>
    [DataMember(Name="statusCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "statusCode")]
    public string StatusCode { get; set; }

    /// <summary>
    /// Gets or Sets StatusCodeValue
    /// </summary>
    [DataMember(Name="statusCodeValue", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "statusCodeValue")]
    public int? StatusCodeValue { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class ResponseEntity {\n");
      sb.Append("  Body: ").Append(Body).Append("\n");
      sb.Append("  StatusCode: ").Append(StatusCode).Append("\n");
      sb.Append("  StatusCodeValue: ").Append(StatusCodeValue).Append("\n");
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
