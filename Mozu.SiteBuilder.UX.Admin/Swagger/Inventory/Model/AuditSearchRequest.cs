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
  public class AuditSearchRequest : BaseRequest {
    /// <summary>
    /// Audit identifier
    /// </summary>
    /// <value>Audit identifier</value>
    [DataMember(Name="auditID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "auditID")]
    public int? AuditID { get; set; }

    /// <summary>
    /// Name of the bin
    /// </summary>
    /// <value>Name of the bin</value>
    [DataMember(Name="binName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "binName")]
    public string BinName { get; set; }

    /// <summary>
    /// Audit Status
    /// </summary>
    /// <value>Audit Status</value>
    [DataMember(Name="auditStatus", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "auditStatus")]
    public string AuditStatus { get; set; }

    /// <summary>
    /// Gets or Sets DateRange
    /// </summary>
    [DataMember(Name="dateRange", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "dateRange")]
    public DateRange DateRange { get; set; }

    /// <summary>
    /// List of matching products
    /// </summary>
    /// <value>List of matching products</value>
    [DataMember(Name="products", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "products")]
    public List<ProductMatch> Products { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class AuditSearchRequest {\n");
      sb.Append("  AuditID: ").Append(AuditID).Append("\n");
      sb.Append("  BinName: ").Append(BinName).Append("\n");
      sb.Append("  AuditStatus: ").Append(AuditStatus).Append("\n");
      sb.Append("  DateRange: ").Append(DateRange).Append("\n");
      sb.Append("  Products: ").Append(Products).Append("\n");
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
