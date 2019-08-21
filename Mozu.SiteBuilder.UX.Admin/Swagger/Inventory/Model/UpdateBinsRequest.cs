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
  public class UpdateBinsRequest : BaseRequest {
    /// <summary>
    /// List of Update Bin Requests
    /// </summary>
    /// <value>List of Update Bin Requests</value>
    [DataMember(Name="bins", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "bins")]
    public List<UpdateBinRequest> Bins { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class UpdateBinsRequest {\n");
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
