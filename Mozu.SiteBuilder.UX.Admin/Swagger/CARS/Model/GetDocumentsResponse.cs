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
  public class GetDocumentsResponse {
    /// <summary>
    /// Gets or Sets Documents
    /// </summary>
    [DataMember(Name="documents", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "documents")]
    public List<Document> Documents { get; set; }

    /// <summary>
    /// Gets or Sets Message
    /// </summary>
    [DataMember(Name="message", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "message")]
    public string Message { get; set; }

    /// <summary>
    /// Gets or Sets PackNotificationID
    /// </summary>
    [DataMember(Name="packNotificationID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "packNotificationID")]
    public int? PackNotificationID { get; set; }

    /// <summary>
    /// Gets or Sets Success
    /// </summary>
    [DataMember(Name="success", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "success")]
    public bool? Success { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class GetDocumentsResponse {\n");
      sb.Append("  Documents: ").Append(Documents).Append("\n");
      sb.Append("  Message: ").Append(Message).Append("\n");
      sb.Append("  PackNotificationID: ").Append(PackNotificationID).Append("\n");
      sb.Append("  Success: ").Append(Success).Append("\n");
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
