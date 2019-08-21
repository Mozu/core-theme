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
  public class WaveCompletion : BaseRequest {
    /// <summary>
    /// Flag for creating a recovery
    /// </summary>
    /// <value>Flag for creating a recovery</value>
    [DataMember(Name="createRecovery", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "createRecovery")]
    public bool? CreateRecovery { get; set; }

    /// <summary>
    /// Maximum number of orders
    /// </summary>
    /// <value>Maximum number of orders</value>
    [DataMember(Name="bins", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "bins")]
    public List<BinProductQuantities> Bins { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class WaveCompletion {\n");
      sb.Append("  CreateRecovery: ").Append(CreateRecovery).Append("\n");
      sb.Append("  Bins: ").Append(Bins).Append("\n");
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
