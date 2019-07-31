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
  public class NotifyPickupResponse {
    /// <summary>
    /// Gets or Sets ErrorMessage
    /// </summary>
    [DataMember(Name="errorMessage", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "errorMessage")]
    public string ErrorMessage { get; set; }

    /// <summary>
    /// Gets or Sets LastNotificationDate
    /// </summary>
    [DataMember(Name="lastNotificationDate", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "lastNotificationDate")]
    public string LastNotificationDate { get; set; }

    /// <summary>
    /// Gets or Sets MessageCode
    /// </summary>
    [DataMember(Name="messageCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "messageCode")]
    public string MessageCode { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class NotifyPickupResponse {\n");
      sb.Append("  ErrorMessage: ").Append(ErrorMessage).Append("\n");
      sb.Append("  LastNotificationDate: ").Append(LastNotificationDate).Append("\n");
      sb.Append("  MessageCode: ").Append(MessageCode).Append("\n");
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
