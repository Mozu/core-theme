using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// Type of Bin
    /// </summary>
    [DataContract]
  public class BinTypeModel {
    /// <summary>
    /// Bin Type Identifier
    /// </summary>
    /// <value>Bin Type Identifier</value>
    [DataMember(Name="binTypeID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "binTypeID")]
    public int? BinTypeID { get; set; }

    /// <summary>
    /// Bin Type Description
    /// </summary>
    /// <value>Bin Type Description</value>
    [DataMember(Name="description", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "description")]
    public string Description { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class BinTypeModel {\n");
      sb.Append("  BinTypeID: ").Append(BinTypeID).Append("\n");
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
