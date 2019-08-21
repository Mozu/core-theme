using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// 
    /// </summary>
    [DataContract]
  public class CreateWaveResponse : BaseResponse {
    /// <summary>
    /// Wave Identifier
    /// </summary>
    /// <value>Wave Identifier</value>
    [DataMember(Name="waveID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "waveID")]
    public int? WaveID { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class CreateWaveResponse {\n");
      sb.Append("  WaveID: ").Append(WaveID).Append("\n");
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
