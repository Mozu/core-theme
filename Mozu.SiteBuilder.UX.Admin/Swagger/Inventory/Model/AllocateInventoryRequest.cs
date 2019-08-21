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
  public class AllocateInventoryRequest : BaseRequest {
    /// <summary>
    /// list of AllocateItems
    /// </summary>
    /// <value>list of AllocateItems</value>
    [DataMember(Name="items", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "items")]
    public List<AllocateItem> Items { get; set; }

    /// <summary>
    /// order date
    /// </summary>
    /// <value>order date</value>
    [DataMember(Name="orderDate", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "orderDate")]
    public string OrderDate { get; set; }

    /// <summary>
    /// order weight
    /// </summary>
    /// <value>order weight</value>
    [DataMember(Name="orderWeight", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "orderWeight")]
    public int? OrderWeight { get; set; }

    /// <summary>
    /// flag to determine deallocation on decrements
    /// </summary>
    /// <value>flag to determine deallocation on decrements</value>
    [DataMember(Name="decrementOnHandOnDeallocate", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "decrementOnHandOnDeallocate")]
    public bool? DecrementOnHandOnDeallocate { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class AllocateInventoryRequest {\n");
      sb.Append("  Items: ").Append(Items).Append("\n");
      sb.Append("  OrderDate: ").Append(OrderDate).Append("\n");
      sb.Append("  OrderWeight: ").Append(OrderWeight).Append("\n");
      sb.Append("  DecrementOnHandOnDeallocate: ").Append(DecrementOnHandOnDeallocate).Append("\n");
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
