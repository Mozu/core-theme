using System;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Swagger.Fulfiller.Model {

  /// <summary>
  /// 
  /// </summary>
  [DataContract]
  public class TaskInput {
    /// <summary>
    /// Gets or Sets HelpMessage
    /// </summary>
    [DataMember(Name="helpMessage", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "helpMessage")]
    public string HelpMessage { get; set; }

    /// <summary>
    /// Gets or Sets Label
    /// </summary>
    [DataMember(Name="label", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "label")]
    public string Label { get; set; }

    /// <summary>
    /// Gets or Sets MaxLength
    /// </summary>
    [DataMember(Name="maxLength", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "maxLength")]
    public int? MaxLength { get; set; }

    /// <summary>
    /// Gets or Sets Maximum
    /// </summary>
    [DataMember(Name="maximum", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "maximum")]
    public decimal Maximum { get; set; }

    /// <summary>
    /// Gets or Sets MinLength
    /// </summary>
    [DataMember(Name="minLength", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "minLength")]
    public int? MinLength { get; set; }

    /// <summary>
    /// Gets or Sets Minimum
    /// </summary>
    [DataMember(Name="minimum", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "minimum")]
    public decimal Minimum { get; set; }

    /// <summary>
    /// Gets or Sets Name
    /// </summary>
    [DataMember(Name="name", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "name")]
    public string Name { get; set; }

    /// <summary>
    /// Gets or Sets Options
    /// </summary>
    [DataMember(Name="options", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "options")]
    public List<Object> Options { get; set; }

    /// <summary>
    /// Gets or Sets Pattern
    /// </summary>
    [DataMember(Name="pattern", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "pattern")]
    public string Pattern { get; set; }

    /// <summary>
    /// Gets or Sets Required
    /// </summary>
    [DataMember(Name="required", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "required")]
    public bool? Required { get; set; }

    /// <summary>
    /// Gets or Sets Type
    /// </summary>
    [DataMember(Name="type", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "type")]
    public string Type { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class TaskInput {\n");
      sb.Append("  HelpMessage: ").Append(HelpMessage).Append("\n");
      sb.Append("  Label: ").Append(Label).Append("\n");
      sb.Append("  MaxLength: ").Append(MaxLength).Append("\n");
      sb.Append("  Maximum: ").Append(Maximum).Append("\n");
      sb.Append("  MinLength: ").Append(MinLength).Append("\n");
      sb.Append("  Minimum: ").Append(Minimum).Append("\n");
      sb.Append("  Name: ").Append(Name).Append("\n");
      sb.Append("  Options: ").Append(Options).Append("\n");
      sb.Append("  Pattern: ").Append(Pattern).Append("\n");
      sb.Append("  Required: ").Append(Required).Append("\n");
      sb.Append("  Type: ").Append(Type).Append("\n");
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
