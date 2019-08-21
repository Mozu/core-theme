using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// Range of bins
    /// </summary>
    [DataContract]
  public class BinRange {
    /// <summary>
    /// Start Bin Name
    /// </summary>
    /// <value>Start Bin Name</value>
    [DataMember(Name="startBinName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "startBinName")]
    public string StartBinName { get; set; }

    /// <summary>
    /// End Bin Name
    /// </summary>
    /// <value>End Bin Name</value>
    [DataMember(Name="endBinName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "endBinName")]
    public string EndBinName { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class BinRange {\n");
      sb.Append("  StartBinName: ").Append(StartBinName).Append("\n");
      sb.Append("  EndBinName: ").Append(EndBinName).Append("\n");
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
