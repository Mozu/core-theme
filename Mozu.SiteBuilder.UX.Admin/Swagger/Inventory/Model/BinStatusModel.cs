using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// Status of Bin
    /// </summary>
    [DataContract]
  public class BinStatusModel {
    /// <summary>
    /// Bin Status Identifier
    /// </summary>
    /// <value>Bin Status Identifier</value>
    [DataMember(Name="binStatusID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "binStatusID")]
    public int? BinStatusID { get; set; }

    /// <summary>
    /// Bin Status Description
    /// </summary>
    /// <value>Bin Status Description</value>
    [DataMember(Name="description", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "description")]
    public string Description { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class BinStatusModel {\n");
      sb.Append("  BinStatusID: ").Append(BinStatusID).Append("\n");
      sb.Append("  Description: ").Append(Description).Append("\n");
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
