using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// 
    /// </summary>
    [DataContract]
  public class GetBinsRequest : BaseRequest {
    /// <summary>
    /// term to search for
    /// </summary>
    /// <value>term to search for</value>
    [DataMember(Name="searchTerm", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "searchTerm")]
    public string SearchTerm { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class GetBinsRequest {\n");
      sb.Append("  SearchTerm: ").Append(SearchTerm).Append("\n");
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
