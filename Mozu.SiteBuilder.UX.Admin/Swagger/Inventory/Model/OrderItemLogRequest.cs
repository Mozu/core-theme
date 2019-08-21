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
  public class OrderItemLogRequest : BaseRequest {
    /// <summary>
    /// A list of order item log identifiers to search for
    /// </summary>
    /// <value>A list of order item log identifiers to search for</value>
    [DataMember(Name="identifiers", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "identifiers")]
    public List<OrderItemLogIdentifier> Identifiers { get; set; }

    /// <summary>
    /// Order Identifier
    /// </summary>
    /// <value>Order Identifier</value>
    [DataMember(Name="orderBy", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "orderBy")]
    public string OrderBy { get; set; }

    /// <summary>
    /// The maximum number of results to return
    /// </summary>
    /// <value>The maximum number of results to return</value>
    [DataMember(Name="limit", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "limit")]
    public int? Limit { get; set; }

    /// <summary>
    /// The type of logs to retrieve
    /// </summary>
    /// <value>The type of logs to retrieve</value>
    [DataMember(Name="type", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "type")]
    public string Type { get; set; }

    /// <summary>
    /// Whether to sort results ascending, based on orderBy
    /// </summary>
    /// <value>Whether to sort results ascending, based on orderBy</value>
    [DataMember(Name="sortAscending", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "sortAscending")]
    public bool? SortAscending { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class OrderItemLogRequest {\n");
      sb.Append("  Identifiers: ").Append(Identifiers).Append("\n");
      sb.Append("  OrderBy: ").Append(OrderBy).Append("\n");
      sb.Append("  Limit: ").Append(Limit).Append("\n");
      sb.Append("  Type: ").Append(Type).Append("\n");
      sb.Append("  SortAscending: ").Append(SortAscending).Append("\n");
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
