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
  public class Audit : BaseResponse {
    /// <summary>
    /// Audit identifier
    /// </summary>
    /// <value>Audit identifier</value>
    [DataMember(Name="auditID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "auditID")]
    public int? AuditID { get; set; }

    /// <summary>
    /// User identifier
    /// </summary>
    /// <value>User identifier</value>
    [DataMember(Name="userID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "userID")]
    public int? UserID { get; set; }

    /// <summary>
    /// Location code
    /// </summary>
    /// <value>Location code</value>
    [DataMember(Name="locationCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationCode")]
    public string LocationCode { get; set; }

    /// <summary>
    /// Audit status
    /// </summary>
    /// <value>Audit status</value>
    [DataMember(Name="status", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "status")]
    public string Status { get; set; }

    /// <summary>
    /// Date the audit was requested
    /// </summary>
    /// <value>Date the audit was requested</value>
    [DataMember(Name="dateRequested", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "dateRequested")]
    public string DateRequested { get; set; }

    /// <summary>
    /// Date the audit was started
    /// </summary>
    /// <value>Date the audit was started</value>
    [DataMember(Name="dateStarted", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "dateStarted")]
    public string DateStarted { get; set; }

    /// <summary>
    /// List of Audit Items
    /// </summary>
    /// <value>List of Audit Items</value>
    [DataMember(Name="items", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "items")]
    public List<AuditItem> Items { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class Audit {\n");
      sb.Append("  AuditID: ").Append(AuditID).Append("\n");
      sb.Append("  UserID: ").Append(UserID).Append("\n");
      sb.Append("  LocationCode: ").Append(LocationCode).Append("\n");
      sb.Append("  Status: ").Append(Status).Append("\n");
      sb.Append("  DateRequested: ").Append(DateRequested).Append("\n");
      sb.Append("  DateStarted: ").Append(DateStarted).Append("\n");
      sb.Append("  Items: ").Append(Items).Append("\n");
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
