using System.Text;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// 
    /// </summary>
    [DataContract]
  public class AuditSearchResponse : BaseResponse {
    /// <summary>
    /// List of found audits
    /// </summary>
    /// <value>List of found audits</value>
    [DataMember(Name="audits", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "audits")]
    public List<Audit> Audits { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class AuditSearchResponse {\n");
      sb.Append("  Audits: ").Append(Audits).Append("\n");
      sb.Append("}\n");
      return sb.ToString();
    }

    /// <summary>
    /// Get the JSON string presentation of the object
    /// </summary>
    /// <returns>JSON string presentation of the object</returns>
    public  new string ToJson() {
      return JsonConvert.SerializeObject(this, Formatting.Indented);
    }

}
}
