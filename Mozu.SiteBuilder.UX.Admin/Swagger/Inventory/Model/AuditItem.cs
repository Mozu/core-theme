using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// 
    /// </summary>
    [DataContract]
  public class AuditItem : BaseResponse {
    /// <summary>
    /// Audit Item identifier
    /// </summary>
    /// <value>Audit Item identifier</value>
    [DataMember(Name="auditItemID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "auditItemID")]
    public int? AuditItemID { get; set; }

    /// <summary>
    /// Bin Name
    /// </summary>
    /// <value>Bin Name</value>
    [DataMember(Name="binName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "binName")]
    public string BinName { get; set; }

    /// <summary>
    /// Gets or Sets Product
    /// </summary>
    [DataMember(Name="product", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "product")]
    public AuditItemQuantity Product { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class AuditItem {\n");
      sb.Append("  AuditItemID: ").Append(AuditItemID).Append("\n");
      sb.Append("  BinName: ").Append(BinName).Append("\n");
      sb.Append("  Product: ").Append(Product).Append("\n");
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
