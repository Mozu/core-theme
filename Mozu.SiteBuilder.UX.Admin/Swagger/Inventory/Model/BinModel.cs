using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// Bin Model
    /// </summary>
    [DataContract]
  public class BinModel {
    /// <summary>
    /// Unique Bin Identifier assigned by the system
    /// </summary>
    /// <value>Unique Bin Identifier assigned by the system</value>
    [DataMember(Name="binID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "binID")]
    public int? BinID { get; set; }

    /// <summary>
    /// Location Identifier of the owning location
    /// </summary>
    /// <value>Location Identifier of the owning location</value>
    [DataMember(Name="locationID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationID")]
    public int? LocationID { get; set; }

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
    /// Client specified static bin name
    /// </summary>
    /// <value>Client specified static bin name</value>
    [DataMember(Name="name", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "name")]
    public int? Name { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class BinModel {\n");
      sb.Append("  BinID: ").Append(BinID).Append("\n");
      sb.Append("  LocationID: ").Append(LocationID).Append("\n");
      sb.Append("  BinTypeID: ").Append(BinTypeID).Append("\n");
      sb.Append("  BinStatusID: ").Append(BinStatusID).Append("\n");
      sb.Append("  Name: ").Append(Name).Append("\n");
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
