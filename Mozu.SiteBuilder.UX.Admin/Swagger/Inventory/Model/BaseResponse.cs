using System.Text;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// Base Response Model
    /// </summary>
    [DataContract]
  public class BaseResponse {
    /// <summary>
    /// Flag for success
    /// </summary>
    /// <value>Flag for success</value>
    [DataMember(Name="success", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "success")]
    public bool? Success { get; set; }

    /// <summary>
    /// List of messages
    /// </summary>
    /// <value>List of messages</value>
    [DataMember(Name="messages", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "messages")]
    public List<string> Messages { get; set; }

    /// <summary>
    /// Number of results
    /// </summary>
    /// <value>Number of results</value>
    [DataMember(Name="numResults", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "numResults")]
    public int? NumResults { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class BaseResponse {\n");
      sb.Append("  Success: ").Append(Success).Append("\n");
      sb.Append("  Messages: ").Append(Messages).Append("\n");
      sb.Append("  NumResults: ").Append(NumResults).Append("\n");
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
