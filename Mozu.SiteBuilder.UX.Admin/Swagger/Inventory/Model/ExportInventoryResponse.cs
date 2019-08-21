using System.Text;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// Response for Export Inventory api
    /// </summary>
    [DataContract]
  public class ExportInventoryResponse {
    /// <summary>
    /// List of Export Inventory Job Responses
    /// </summary>
    /// <value>List of Export Inventory Job Responses</value>
    [DataMember(Name="exportInventoryJobResponses", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "exportInventoryJobResponses")]
    public List<ExportInventoryJobResponse> ExportInventoryJobResponses { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class ExportInventoryResponse {\n");
      sb.Append("  ExportInventoryJobResponses: ").Append(ExportInventoryJobResponses).Append("\n");
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
