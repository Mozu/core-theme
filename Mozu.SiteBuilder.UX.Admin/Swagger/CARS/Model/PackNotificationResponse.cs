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
  public class PackNotificationResponse {
    /// <summary>
    /// Gets or Sets DocumentsURL
    /// </summary>
    [DataMember(Name="documentsURL", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "documentsURL")]
    public string DocumentsURL { get; set; }

    /// <summary>
    /// Gets or Sets PackNotificationID
    /// </summary>
    [DataMember(Name="packNotificationID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "packNotificationID")]
    public string PackNotificationID { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class PackNotificationResponse {\n");
      sb.Append("  DocumentsURL: ").Append(DocumentsURL).Append("\n");
      sb.Append("  PackNotificationID: ").Append(PackNotificationID).Append("\n");
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
