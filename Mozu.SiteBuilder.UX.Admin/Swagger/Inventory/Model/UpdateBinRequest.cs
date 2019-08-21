using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// 
    /// </summary>
    [DataContract]
  public class UpdateBinRequest : BaseRequest {
    /// <summary>
    /// Bin identifier
    /// </summary>
    /// <value>Bin identifier</value>
    [DataMember(Name="binID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "binID")]
    public int? BinID { get; set; }

    /// <summary>
    /// Bin Location Code
    /// </summary>
    /// <value>Bin Location Code</value>
    [DataMember(Name="locationCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationCode")]
    public string LocationCode { get; set; }

    /// <summary>
    /// New Bin's Type ID
    /// </summary>
    /// <value>New Bin's Type ID</value>
    [DataMember(Name="binTypeID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "binTypeID")]
    public int? BinTypeID { get; set; }

    /// <summary>
    /// New Bin's Status ID
    /// </summary>
    /// <value>New Bin's Status ID</value>
    [DataMember(Name="binStatusID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "binStatusID")]
    public int? BinStatusID { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class UpdateBinRequest {\n");
      sb.Append("  BinID: ").Append(BinID).Append("\n");
      sb.Append("  LocationCode: ").Append(LocationCode).Append("\n");
      sb.Append("  BinTypeID: ").Append(BinTypeID).Append("\n");
      sb.Append("  BinStatusID: ").Append(BinStatusID).Append("\n");
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
