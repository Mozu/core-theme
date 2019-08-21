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
  public class CreateAuditRequest : BaseRequest {
    /// <summary>
    /// List of Create Audit Request Bins
    /// </summary>
    /// <value>List of Create Audit Request Bins</value>
    [DataMember(Name="bins", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "bins")]
    public List<CreateAuditRequestBin> Bins { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class CreateAuditRequest {\n");
      sb.Append("  Bins: ").Append(Bins).Append("\n");
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
