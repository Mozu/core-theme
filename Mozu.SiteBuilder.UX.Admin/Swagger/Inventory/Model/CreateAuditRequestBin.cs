using System.Text;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// Request for creating an audit bin
    /// </summary>
    [DataContract]
  public class CreateAuditRequestBin {
    /// <summary>
    /// Name of bin
    /// </summary>
    /// <value>Name of bin</value>
    [DataMember(Name="binName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "binName")]
    public string BinName { get; set; }

    /// <summary>
    /// List of Products within a bin
    /// </summary>
    /// <value>List of Products within a bin</value>
    [DataMember(Name="products", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "products")]
    public List<Product> Products { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class CreateAuditRequestBin {\n");
      sb.Append("  BinName: ").Append(BinName).Append("\n");
      sb.Append("  Products: ").Append(Products).Append("\n");
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
