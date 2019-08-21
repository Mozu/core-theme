using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// 
    /// </summary>
    [DataContract]
  public class CompleteWaveResponse : BaseResponse {
    /// <summary>
    /// Recovery Wave Identifier
    /// </summary>
    /// <value>Recovery Wave Identifier</value>
    [DataMember(Name="recoveryWaveID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "recoveryWaveID")]
    public int? RecoveryWaveID { get; set; }

    /// <summary>
    /// Audit Identifier
    /// </summary>
    /// <value>Audit Identifier</value>
    [DataMember(Name="auditID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "auditID")]
    public int? AuditID { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class CompleteWaveResponse {\n");
      sb.Append("  RecoveryWaveID: ").Append(RecoveryWaveID).Append("\n");
      sb.Append("  AuditID: ").Append(AuditID).Append("\n");
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
