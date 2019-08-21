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
  public class LoadBinInventoryResponse : BaseResponse {
    /// <summary>
    /// Number of units added
    /// </summary>
    /// <value>Number of units added</value>
    [DataMember(Name="unitsAdded", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "unitsAdded")]
    public int? UnitsAdded { get; set; }

    /// <summary>
    /// Number of removed units
    /// </summary>
    /// <value>Number of removed units</value>
    [DataMember(Name="unitsRemoved", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "unitsRemoved")]
    public int? UnitsRemoved { get; set; }

    /// <summary>
    /// Names of created bins
    /// </summary>
    /// <value>Names of created bins</value>
    [DataMember(Name="binsCreated", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "binsCreated")]
    public List<string> BinsCreated { get; set; }

    /// <summary>
    /// List of products created
    /// </summary>
    /// <value>List of products created</value>
    [DataMember(Name="productsCreated", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "productsCreated")]
    public List<Product> ProductsCreated { get; set; }

    /// <summary>
    /// List of new bin product quantities
    /// </summary>
    /// <value>List of new bin product quantities</value>
    [DataMember(Name="binQuantities", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "binQuantities")]
    public List<BinProductQuantities> BinQuantities { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class LoadBinInventoryResponse {\n");
      sb.Append("  UnitsAdded: ").Append(UnitsAdded).Append("\n");
      sb.Append("  UnitsRemoved: ").Append(UnitsRemoved).Append("\n");
      sb.Append("  BinsCreated: ").Append(BinsCreated).Append("\n");
      sb.Append("  ProductsCreated: ").Append(ProductsCreated).Append("\n");
      sb.Append("  BinQuantities: ").Append(BinQuantities).Append("\n");
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
