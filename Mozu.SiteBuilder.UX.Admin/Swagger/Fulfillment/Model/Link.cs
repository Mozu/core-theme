using System;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Fulfiller.Contracts.Model {

  /// <summary>
  /// 
  /// </summary>
  [DataContract]
  public class Link {
    /// <summary>
    /// Gets or Sets Deprecation
    /// </summary>
    [DataMember(Name="deprecation", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "deprecation")]
    public string Deprecation { get; set; }

    /// <summary>
    /// Gets or Sets Href
    /// </summary>
    [DataMember(Name="href", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "href")]
    public string Href { get; set; }

    /// <summary>
    /// Gets or Sets Hreflang
    /// </summary>
    [DataMember(Name="hreflang", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "hreflang")]
    public string Hreflang { get; set; }

    /// <summary>
    /// Gets or Sets Media
    /// </summary>
    [DataMember(Name="media", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "media")]
    public string Media { get; set; }

    /// <summary>
    /// Gets or Sets Rel
    /// </summary>
    [DataMember(Name="rel", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "rel")]
    public string Rel { get; set; }

    /// <summary>
    /// Gets or Sets Templated
    /// </summary>
    [DataMember(Name="templated", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "templated")]
    public bool? Templated { get; set; }

    /// <summary>
    /// Gets or Sets Title
    /// </summary>
    [DataMember(Name="title", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "title")]
    public string Title { get; set; }

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
      sb.Append("class Link {\n");
      sb.Append("  Deprecation: ").Append(Deprecation).Append("\n");
      sb.Append("  Href: ").Append(Href).Append("\n");
      sb.Append("  Hreflang: ").Append(Hreflang).Append("\n");
      sb.Append("  Media: ").Append(Media).Append("\n");
      sb.Append("  Rel: ").Append(Rel).Append("\n");
      sb.Append("  Templated: ").Append(Templated).Append("\n");
      sb.Append("  Title: ").Append(Title).Append("\n");
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
