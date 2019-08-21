using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// Bin Response Object
    /// </summary>
    [DataContract]
  public class BinResponseModel {
    /// <summary>
    /// Gets or Sets Bins
    /// </summary>
    [DataMember(Name="bins", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "bins")]
    public BinModel Bins { get; set; }

    /// <summary>
    /// number of results
    /// </summary>
    /// <value>number of results</value>
    [DataMember(Name="resultCount", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "resultCount")]
    public int? ResultCount { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class BinResponseModel {\n");
      sb.Append("  Bins: ").Append(Bins).Append("\n");
      sb.Append("  ResultCount: ").Append(ResultCount).Append("\n");
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
