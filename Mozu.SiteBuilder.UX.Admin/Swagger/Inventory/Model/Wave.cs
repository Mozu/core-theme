using System.Text;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// Wave Model
    /// </summary>
    [DataContract]
  public class Wave {
    /// <summary>
    /// Wave Identifier
    /// </summary>
    /// <value>Wave Identifier</value>
    [DataMember(Name="waveID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "waveID")]
    public int? WaveID { get; set; }

    /// <summary>
    /// Location Identifier
    /// </summary>
    /// <value>Location Identifier</value>
    [DataMember(Name="locationID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationID")]
    public int? LocationID { get; set; }

    /// <summary>
    /// When the wave was created
    /// </summary>
    /// <value>When the wave was created</value>
    [DataMember(Name="created", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "created")]
    public string Created { get; set; }

    /// <summary>
    /// User Identifier for the wave creator
    /// </summary>
    /// <value>User Identifier for the wave creator</value>
    [DataMember(Name="userID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "userID")]
    public int? UserID { get; set; }

    /// <summary>
    /// Order Type of the wave
    /// </summary>
    /// <value>Order Type of the wave</value>
    [DataMember(Name="orderType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "orderType")]
    public string OrderType { get; set; }

    /// <summary>
    /// Type of wave
    /// </summary>
    /// <value>Type of wave</value>
    [DataMember(Name="type", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "type")]
    public string Type { get; set; }

    /// <summary>
    /// Status of the wave
    /// </summary>
    /// <value>Status of the wave</value>
    [DataMember(Name="status", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "status")]
    public string Status { get; set; }

    /// <summary>
    /// List of Wave Contents
    /// </summary>
    /// <value>List of Wave Contents</value>
    [DataMember(Name="contents", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "contents")]
    public List<WaveContent> Contents { get; set; }

    /// <summary>
    /// Wave Recovery Identifier
    /// </summary>
    /// <value>Wave Recovery Identifier</value>
    [DataMember(Name="recoveryWaveID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "recoveryWaveID")]
    public int? RecoveryWaveID { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class Wave {\n");
      sb.Append("  WaveID: ").Append(WaveID).Append("\n");
      sb.Append("  LocationID: ").Append(LocationID).Append("\n");
      sb.Append("  Created: ").Append(Created).Append("\n");
      sb.Append("  UserID: ").Append(UserID).Append("\n");
      sb.Append("  OrderType: ").Append(OrderType).Append("\n");
      sb.Append("  Type: ").Append(Type).Append("\n");
      sb.Append("  Status: ").Append(Status).Append("\n");
      sb.Append("  Contents: ").Append(Contents).Append("\n");
      sb.Append("  RecoveryWaveID: ").Append(RecoveryWaveID).Append("\n");
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
