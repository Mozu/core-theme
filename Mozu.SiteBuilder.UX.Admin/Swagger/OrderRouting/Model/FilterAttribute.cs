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
  public class FilterAttribute {
    /// <summary>
    /// Gets or Sets FilterTypeGroup
    /// </summary>
    [DataMember(Name="filterTypeGroup", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "filterTypeGroup")]
    public string FilterTypeGroup { get; set; }

    /// <summary>
    /// Gets or Sets LangTag
    /// </summary>
    [DataMember(Name="langTag", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "langTag")]
    public string LangTag { get; set; }

    /// <summary>
    /// Gets or Sets Name
    /// </summary>
    [DataMember(Name="name", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "name")]
    public string Name { get; set; }

    /// <summary>
    /// Gets or Sets PropertyPath
    /// </summary>
    [DataMember(Name="propertyPath", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "propertyPath")]
    public string PropertyPath { get; set; }

    /// <summary>
    /// Gets or Sets UnitType
    /// </summary>
    [DataMember(Name="unitType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "unitType")]
    public string UnitType { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class FilterAttribute {\n");
      sb.Append("  FilterTypeGroup: ").Append(FilterTypeGroup).Append("\n");
      sb.Append("  LangTag: ").Append(LangTag).Append("\n");
      sb.Append("  Name: ").Append(Name).Append("\n");
      sb.Append("  PropertyPath: ").Append(PropertyPath).Append("\n");
      sb.Append("  UnitType: ").Append(UnitType).Append("\n");
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
