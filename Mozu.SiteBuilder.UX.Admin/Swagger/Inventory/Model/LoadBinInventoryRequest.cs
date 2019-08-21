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
  public class LoadBinInventoryRequest : BaseRequest {
    /// <summary>
    /// List of bins and their associated product quantities
    /// </summary>
    /// <value>List of bins and their associated product quantities</value>
    [DataMember(Name="bins", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "bins")]
    public List<BinProductQuantities> Bins { get; set; }

    /// <summary>
    /// Flag for dry runs
    /// </summary>
    /// <value>Flag for dry runs</value>
    [DataMember(Name="dryRun", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "dryRun")]
    public bool? DryRun { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class LoadBinInventoryRequest {\n");
      sb.Append("  Bins: ").Append(Bins).Append("\n");
      sb.Append("  DryRun: ").Append(DryRun).Append("\n");
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
