using System;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace IO.Swagger.Model {

  /// <summary>
  /// 
  /// </summary>
  [DataContract]
  public class CandidateSuggestionsRequest {
    /// <summary>
    /// Gets or Sets EnvironmentID
    /// </summary>
    [DataMember(Name="environmentID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "environmentID")]
    public int? EnvironmentID { get; set; }

    /// <summary>
    /// Gets or Sets ExclusionListLocationCode
    /// </summary>
    [DataMember(Name="exclusionListLocationCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "exclusionListLocationCode")]
    public List<ExclusionListEntryLocationCode> ExclusionListLocationCode { get; set; }

    /// <summary>
    /// Gets or Sets InventoryRequestType
    /// </summary>
    [DataMember(Name="inventoryRequestType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "inventoryRequestType")]
    public string InventoryRequestType { get; set; }

    /// <summary>
    /// Gets or Sets IsExpress
    /// </summary>
    [DataMember(Name="isExpress", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "isExpress")]
    public bool? IsExpress { get; set; }

    /// <summary>
    /// Gets or Sets Items
    /// </summary>
    [DataMember(Name="items", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "items")]
    public List<OrderItem> Items { get; set; }

    /// <summary>
    /// Gets or Sets LocationCodeWhiteList
    /// </summary>
    [DataMember(Name="locationCodeWhiteList", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationCodeWhiteList")]
    public List<string> LocationCodeWhiteList { get; set; }

    /// <summary>
    /// Gets or Sets OrderType
    /// </summary>
    [DataMember(Name="orderType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "orderType")]
    public string OrderType { get; set; }

    /// <summary>
    /// Gets or Sets PickupLocationCode
    /// </summary>
    [DataMember(Name="pickupLocationCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "pickupLocationCode")]
    public string PickupLocationCode { get; set; }

    /// <summary>
    /// Gets or Sets ShippingAddress
    /// </summary>
    [DataMember(Name="shippingAddress", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shippingAddress")]
    public ShippingAddress ShippingAddress { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class CandidateSuggestionsRequest {\n");
      sb.Append("  EnvironmentID: ").Append(EnvironmentID).Append("\n");
      sb.Append("  ExclusionListLocationCode: ").Append(ExclusionListLocationCode).Append("\n");
      sb.Append("  InventoryRequestType: ").Append(InventoryRequestType).Append("\n");
      sb.Append("  IsExpress: ").Append(IsExpress).Append("\n");
      sb.Append("  Items: ").Append(Items).Append("\n");
      sb.Append("  LocationCodeWhiteList: ").Append(LocationCodeWhiteList).Append("\n");
      sb.Append("  OrderType: ").Append(OrderType).Append("\n");
      sb.Append("  PickupLocationCode: ").Append(PickupLocationCode).Append("\n");
      sb.Append("  ShippingAddress: ").Append(ShippingAddress).Append("\n");
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
