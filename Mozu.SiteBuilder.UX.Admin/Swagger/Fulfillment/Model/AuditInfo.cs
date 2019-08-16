using System;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Fulfillment.Contracts.Model {

  /// <summary>
  /// 
  /// </summary>
  [DataContract]
  public class AuditInfo {
    /// <summary>
    /// Gets or Sets CreateBy
    /// </summary>
    [DataMember(Name="createBy", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "createBy")]
    public string CreateBy { get; set; }

    /// <summary>
    /// Gets or Sets CreateDate
    /// </summary>
    [DataMember(Name="createDate", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "createDate")]
    public DateTime? CreateDate { get; set; }

    /// <summary>
    /// Gets or Sets UpdateBy
    /// </summary>
    [DataMember(Name="updateBy", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "updateBy")]
    public string UpdateBy { get; set; }

    /// <summary>
    /// Gets or Sets UpdateDate
    /// </summary>
    [DataMember(Name="updateDate", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "updateDate")]
    public DateTime? UpdateDate { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class AuditInfo {\n");
      sb.Append("  CreateBy: ").Append(CreateBy).Append("\n");
      sb.Append("  CreateDate: ").Append(CreateDate).Append("\n");
      sb.Append("  UpdateBy: ").Append(UpdateBy).Append("\n");
      sb.Append("  UpdateDate: ").Append(UpdateDate).Append("\n");
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
