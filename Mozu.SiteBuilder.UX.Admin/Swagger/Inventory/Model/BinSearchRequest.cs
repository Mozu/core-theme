using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// 
    /// </summary>
    [DataContract]
  public class BinSearchRequest : BaseRequest {
    /// <summary>
    /// Partial match of bin name
    /// </summary>
    /// <value>Partial match of bin name</value>
    [DataMember(Name="binName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "binName")]
    public string BinName { get; set; }

    /// <summary>
    /// Gets or Sets Product
    /// </summary>
    [DataMember(Name="product", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "product")]
    public Product Product { get; set; }

    /// <summary>
    /// Flag for sorting ascending
    /// </summary>
    /// <value>Flag for sorting ascending</value>
    [DataMember(Name="sortAscending", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "sortAscending")]
    public bool? SortAscending { get; set; }

    /// <summary>
    /// Flag for showing negative inventory
    /// </summary>
    /// <value>Flag for showing negative inventory</value>
    [DataMember(Name="showNegativeInventory", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "showNegativeInventory")]
    public bool? ShowNegativeInventory { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class BinSearchRequest {\n");
      sb.Append("  BinName: ").Append(BinName).Append("\n");
      sb.Append("  Product: ").Append(Product).Append("\n");
      sb.Append("  SortAscending: ").Append(SortAscending).Append("\n");
      sb.Append("  ShowNegativeInventory: ").Append(ShowNegativeInventory).Append("\n");
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
