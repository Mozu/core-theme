using System.Text;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// Get Pending Items Response
    /// </summary>
    [DataContract]
  public class GetPendingItemsResponse {
    /// <summary>
    /// Total Count of pending items
    /// </summary>
    /// <value>Total Count of pending items</value>
    [DataMember(Name="totalCount", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "totalCount")]
    public int? TotalCount { get; set; }

    /// <summary>
    /// Page number
    /// </summary>
    /// <value>Page number</value>
    [DataMember(Name="page", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "page")]
    public int? Page { get; set; }

    /// <summary>
    /// Number per page
    /// </summary>
    /// <value>Number per page</value>
    [DataMember(Name="perPage", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "perPage")]
    public int? PerPage { get; set; }

    /// <summary>
    /// Previous page
    /// </summary>
    /// <value>Previous page</value>
    [DataMember(Name="prevPage", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "prevPage")]
    public int? PrevPage { get; set; }

    /// <summary>
    /// Field to sort by
    /// </summary>
    /// <value>Field to sort by</value>
    [DataMember(Name="sortBy", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "sortBy")]
    public string SortBy { get; set; }

    /// <summary>
    /// Flag to sort by ascending
    /// </summary>
    /// <value>Flag to sort by ascending</value>
    [DataMember(Name="sortAscending", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "sortAscending")]
    public bool? SortAscending { get; set; }

    /// <summary>
    /// List of pending items
    /// </summary>
    /// <value>List of pending items</value>
    [DataMember(Name="pendingItems", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "pendingItems")]
    public List<PendingItem> PendingItems { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class GetPendingItemsResponse {\n");
      sb.Append("  TotalCount: ").Append(TotalCount).Append("\n");
      sb.Append("  Page: ").Append(Page).Append("\n");
      sb.Append("  PerPage: ").Append(PerPage).Append("\n");
      sb.Append("  PrevPage: ").Append(PrevPage).Append("\n");
      sb.Append("  SortBy: ").Append(SortBy).Append("\n");
      sb.Append("  SortAscending: ").Append(SortAscending).Append("\n");
      sb.Append("  PendingItems: ").Append(PendingItems).Append("\n");
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
