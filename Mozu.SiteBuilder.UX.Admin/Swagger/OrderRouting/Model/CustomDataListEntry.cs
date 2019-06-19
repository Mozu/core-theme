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
  public class CustomDataListEntry {
    /// <summary>
    /// Gets or Sets CustomDataListEntryID
    /// </summary>
    [DataMember(Name="customDataListEntryID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "customDataListEntryID")]
    public int? CustomDataListEntryID { get; set; }

    /// <summary>
    /// Gets or Sets DataValid
    /// </summary>
    [DataMember(Name="dataValid", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "dataValid")]
    public bool? DataValid { get; set; }

    /// <summary>
    /// Gets or Sets List
    /// </summary>
    [DataMember(Name="list", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "list")]
    public CustomDataList List { get; set; }

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
      sb.Append("class CustomDataListEntry {\n");
      sb.Append("  CustomDataListEntryID: ").Append(CustomDataListEntryID).Append("\n");
      sb.Append("  DataValid: ").Append(DataValid).Append("\n");
      sb.Append("  List: ").Append(List).Append("\n");
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
