using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// 
    /// </summary>
    [DataContract]
  public class CloneTenantRequest : BaseRequest {
    /// <summary>
    /// Target Tenant name
    /// </summary>
    /// <value>Target Tenant name</value>
    [DataMember(Name="targetTenantName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "targetTenantName")]
    public string TargetTenantName { get; set; }

    /// <summary>
    /// Source Tenant ID
    /// </summary>
    /// <value>Source Tenant ID</value>
    [DataMember(Name="sourceTenantID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "sourceTenantID")]
    public int? SourceTenantID { get; set; }

    /// <summary>
    /// Target Tenant ID
    /// </summary>
    /// <value>Target Tenant ID</value>
    [DataMember(Name="targetTenantID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "targetTenantID")]
    public int? TargetTenantID { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class CloneTenantRequest {\n");
      sb.Append("  TargetTenantName: ").Append(TargetTenantName).Append("\n");
      sb.Append("  SourceTenantID: ").Append(SourceTenantID).Append("\n");
      sb.Append("  TargetTenantID: ").Append(TargetTenantID).Append("\n");
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
