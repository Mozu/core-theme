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
  public class CustomDataListEntryResponse {
    /// <summary>
    /// Gets or Sets Id
    /// </summary>
    [DataMember(Name="id", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "id")]
    public int? Id { get; set; }

    /// <summary>
    /// Gets or Sets LocationAddress
    /// </summary>
    [DataMember(Name="locationAddress", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationAddress")]
    public string LocationAddress { get; set; }

    /// <summary>
    /// Gets or Sets LocationID
    /// </summary>
    [DataMember(Name="locationID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationID")]
    public int? LocationID { get; set; }

    /// <summary>
    /// Gets or Sets LocationName
    /// </summary>
    [DataMember(Name="locationName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationName")]
    public string LocationName { get; set; }

    /// <summary>
    /// Gets or Sets Notes
    /// </summary>
    [DataMember(Name="notes", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "notes")]
    public string Notes { get; set; }

    /// <summary>
    /// Gets or Sets StringValue
    /// </summary>
    [DataMember(Name="stringValue", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "stringValue")]
    public string StringValue { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class CustomDataListEntryResponse {\n");
      sb.Append("  Id: ").Append(Id).Append("\n");
      sb.Append("  LocationAddress: ").Append(LocationAddress).Append("\n");
      sb.Append("  LocationID: ").Append(LocationID).Append("\n");
      sb.Append("  LocationName: ").Append(LocationName).Append("\n");
      sb.Append("  Notes: ").Append(Notes).Append("\n");
      sb.Append("  StringValue: ").Append(StringValue).Append("\n");
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
