using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// Base Request Model
    /// </summary>
    [DataContract]
  public class BaseRequest {
    /// <summary>
    /// external location id
    /// </summary>
    /// <value>external location id</value>
    [DataMember(Name="locationCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationCode")]
    public string LocationCode { get; set; }

    /// <summary>
    /// user id
    /// </summary>
    /// <value>user id</value>
    [DataMember(Name="userID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "userID")]
    public int? UserID { get; set; }

    /// <summary>
    /// how many results to show per page
    /// </summary>
    /// <value>how many results to show per page</value>
    [DataMember(Name="pageSize", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "pageSize")]
    public int? PageSize { get; set; }

    /// <summary>
    /// which page to show
    /// </summary>
    /// <value>which page to show</value>
    [DataMember(Name="pageNum", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "pageNum")]
    public int? PageNum { get; set; }

    /// <summary>
    /// index to sort results by
    /// </summary>
    /// <value>index to sort results by</value>
    [DataMember(Name="sortBy", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "sortBy")]
    public string SortBy { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class BaseRequest {\n");
      sb.Append("  LocationCode: ").Append(LocationCode).Append("\n");
      sb.Append("  UserID: ").Append(UserID).Append("\n");
      sb.Append("  PageSize: ").Append(PageSize).Append("\n");
      sb.Append("  PageNum: ").Append(PageNum).Append("\n");
      sb.Append("  SortBy: ").Append(SortBy).Append("\n");
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
